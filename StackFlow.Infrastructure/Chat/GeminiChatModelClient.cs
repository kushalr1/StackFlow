using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Configuration;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Chat;

/// <summary>
/// Talks to Gemini's generateContent REST endpoint. Field shapes below were confirmed against a
/// real live call on 2026-10-27, not assumed from Google's docs (which were inconsistent on exact
/// casing). Notably: Gemini's own turns use role "model" (not "assistant"), and a function-call
/// part carries a "thoughtSignature" that MUST be echoed back verbatim on that same part when the
/// tool's result is sent in a later turn, or the API rejects the request with 400.
/// </summary>
public class GeminiChatModelClient : IChatModelClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiChatModelClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini API key was not configured.");
        _model = configuration["Gemini:Model"] ?? "gemini-3.5-flash-lite";
    }

    public async Task<ChatModelResponse> SendAsync(
        IReadOnlyList<ChatMessageDto> history,
        IReadOnlyList<ToolDefinition> allowedTools,
        CancellationToken cancellationToken = default)
    {
        var contents = new JsonArray(history.Select(BuildTextTurn).ToArray());
        var tools = BuildToolsArray(allowedTools);
        return await SendRequestAsync(contents, tools, cancellationToken);
    }

    public async Task<ChatModelResponse> ContinueWithToolResultAsync(
        ChatModelResponse previousResponse,
        string toolResultJson,
        CancellationToken cancellationToken = default)
    {
        if (previousResponse.ToolCall is null || previousResponse.ProviderStateJson is null)
        {
            throw new InvalidOperationException(
                "ContinueWithToolResultAsync requires a response that returned a ToolCall.");
        }

        var state = JsonNode.Parse(previousResponse.ProviderStateJson)!.AsObject();
        var contents = state["contents"]!.AsArray();
        var tools = state["tools"]!.AsArray();

        JsonNode? resultValue;
        try
        {
            resultValue = JsonNode.Parse(toolResultJson);
        }
        catch (JsonException)
        {
            resultValue = JsonValue.Create(toolResultJson);
        }

        contents.Add(new JsonObject
        {
            ["role"] = "user",
            ["parts"] = new JsonArray(new JsonObject
            {
                ["functionResponse"] = new JsonObject
                {
                    ["name"] = previousResponse.ToolCall.ToolName,
                    ["response"] = new JsonObject { ["result"] = resultValue }
                }
            })
        });

        return await SendRequestAsync(contents, tools, cancellationToken);
    }

    private static JsonObject BuildTextTurn(ChatMessageDto message) => new()
    {
        ["role"] = message.Role == "assistant" ? "model" : "user",
        ["parts"] = new JsonArray(new JsonObject { ["text"] = message.Content })
    };

    private static JsonArray BuildToolsArray(IReadOnlyList<ToolDefinition> allowedTools)
    {
        if (allowedTools.Count == 0)
        {
            return [];
        }

        var declarations = new JsonArray(allowedTools.Select(tool => (JsonNode)new JsonObject
        {
            ["name"] = tool.Name,
            ["description"] = tool.Description,
            ["parameters"] = JsonNode.Parse(tool.ParameterSchemaJson)
        }).ToArray());

        return [new JsonObject { ["function_declarations"] = declarations }];
    }

    private async Task<ChatModelResponse> SendRequestAsync(
        JsonArray contents, JsonArray tools, CancellationToken cancellationToken)
    {
        var requestBody = new JsonObject { ["contents"] = contents.DeepClone() };
        if (tools.Count > 0)
        {
            requestBody["tools"] = tools.DeepClone();
        }

        using var request = new HttpRequestMessage(
            HttpMethod.Post, $"v1beta/models/{_model}:generateContent")
        {
            Content = new StringContent(requestBody.ToJsonString(), Encoding.UTF8, "application/json")
        };
        request.Headers.Add("x-goog-api-key", _apiKey);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(request, cancellationToken);
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException)
        {
            throw new ChatModelUnavailableException("The AI assistant could not be reached.", exception);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new ChatModelUnavailableException(
                $"The AI assistant returned an error (HTTP {(int)response.StatusCode}).");
        }

        JsonNode root;
        try
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            root = JsonNode.Parse(body) ?? throw new JsonException("Empty response body.");
        }
        catch (JsonException exception)
        {
            throw new ChatModelUnavailableException("The AI assistant returned an unreadable response.", exception);
        }

        return ParseResponse(root, contents, tools);
    }

    private static ChatModelResponse ParseResponse(JsonNode root, JsonArray contents, JsonArray tools)
    {
        var parts = root["candidates"]?[0]?["content"]?["parts"]?.AsArray();
        if (parts is null)
        {
            throw new ChatModelUnavailableException("The AI assistant's response had no content.");
        }

        foreach (var part in parts)
        {
            if (part?["functionCall"] is JsonObject functionCall)
            {
                var toolName = functionCall["name"]!.GetValue<string>();
                var argumentsJson = (functionCall["args"] ?? new JsonObject()).ToJsonString();

                var modelTurn = new JsonObject
                {
                    ["role"] = "model",
                    ["parts"] = new JsonArray(part.DeepClone())
                };
                var nextState = new JsonObject
                {
                    ["contents"] = new JsonArray([.. contents.Select(n => n!.DeepClone()), modelTurn]),
                    ["tools"] = tools.DeepClone()
                };

                return new ChatModelResponse(
                    ReplyText: null,
                    ToolCall: new ToolCallRequest(toolName, argumentsJson),
                    ProviderStateJson: nextState.ToJsonString());
            }
        }

        var text = string.Concat(parts
            .Select(part => part?["text"]?.GetValue<string>())
            .Where(value => value is not null));

        return new ChatModelResponse(ReplyText: text, ToolCall: null);
    }
}

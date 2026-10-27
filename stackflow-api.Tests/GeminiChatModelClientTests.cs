using System.Net;
using System.Text;
using Microsoft.Extensions.Configuration;
using stackflow_api.Services;
using StackFlow.Infrastructure.Chat;

namespace stackflow_api.Tests;

public class GeminiChatModelClientTests
{
    // Real response captured from a live call to gemini-3.5-flash-lite's generateContent endpoint
    // (2026-10-27) — not guessed from docs, which were inconsistent on exact field casing.
    private const string FunctionCallResponse = """
    {
      "candidates": [
        {
          "content": {
            "parts": [
              {
                "functionCall": { "name": "get_weather", "args": { "location": "Paris" }, "id": "call_4278364" },
                "thoughtSignature": "EmAKXgFpFH0TGRnD7h"
              }
            ],
            "role": "model"
          },
          "finishReason": "STOP",
          "index": 0
        }
      ]
    }
    """;

    private const string TextReplyResponse = """
    {
      "candidates": [
        {
          "content": {
            "parts": [
              { "text": "The current weather in Paris is 22°C and sunny.", "thoughtSignature": "EmAKXgFpFH0TW1Zm" }
            ],
            "role": "model"
          },
          "finishReason": "STOP",
          "index": 0
        }
      ]
    }
    """;

    private static (GeminiChatModelClient Client, StubHandler Handler) Build(HttpStatusCode status, string body)
    {
        var handler = new StubHandler(status, body);
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://generativelanguage.googleapis.com/") };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Gemini:ApiKey"] = "test-key" })
            .Build();
        return (new GeminiChatModelClient(httpClient, configuration), handler);
    }

    [Fact]
    public async Task SendAsync_ThrowsChatModelUnavailable_WhenApiKeyIsNotConfigured()
    {
        // The constructor must NOT throw here — this class is DI-activated outside any
        // try/catch the orchestrator runs, so a constructor-time throw would surface as a raw
        // 500 instead of the orchestrator's intended "assistant unavailable" degradation.
        var handler = new StubHandler(HttpStatusCode.OK, TextReplyResponse);
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://generativelanguage.googleapis.com/") };
        var configurationWithNoGeminiSection = new ConfigurationBuilder().Build();

        var client = new GeminiChatModelClient(httpClient, configurationWithNoGeminiSection);

        await Assert.ThrowsAsync<ChatModelUnavailableException>(() =>
            client.SendAsync([new ChatMessageDto("user", "Hi")], []));
    }

    [Fact]
    public async Task SendAsync_ParsesFunctionCall_AndCapturesProviderState()
    {
        var (client, handler) = Build(HttpStatusCode.OK, FunctionCallResponse);

        var response = await client.SendAsync(
            [new ChatMessageDto("user", "What is the weather in Paris?")],
            [new ToolDefinition("get_weather", "Get weather", """{"type":"object","properties":{}}""")]);

        Assert.Null(response.ReplyText);
        Assert.NotNull(response.ToolCall);
        Assert.Equal("get_weather", response.ToolCall!.ToolName);
        Assert.Contains("Paris", response.ToolCall.ArgumentsJson);
        Assert.NotNull(response.ProviderStateJson);
        Assert.Contains("x-goog-api-key", handler.LastRequestHeaders);
    }

    [Fact]
    public async Task SendAsync_ParsesPlainTextReply_WhenNoFunctionCallIsMade()
    {
        var (client, _) = Build(HttpStatusCode.OK, TextReplyResponse);

        var response = await client.SendAsync(
            [new ChatMessageDto("user", "Hello")],
            []);

        Assert.Null(response.ToolCall);
        Assert.Contains("22", response.ReplyText);
    }

    [Fact]
    public async Task SendAsync_MapsAssistantRoleToModel_ForGemini()
    {
        var (client, handler) = Build(HttpStatusCode.OK, TextReplyResponse);

        await client.SendAsync(
            [new ChatMessageDto("user", "Hi"), new ChatMessageDto("assistant", "Hello!")],
            []);

        Assert.Contains("\"role\":\"model\"", handler.LastRequestBody);
        Assert.DoesNotContain("\"role\":\"assistant\"", handler.LastRequestBody);
    }

    [Fact]
    public async Task ContinueWithToolResultAsync_EchoesThoughtSignature_AndReturnsFinalReply()
    {
        var (client, handler) = Build(HttpStatusCode.OK, FunctionCallResponse);
        var toolCallResponse = await client.SendAsync(
            [new ChatMessageDto("user", "What is the weather in Paris?")],
            [new ToolDefinition("get_weather", "Get weather", """{"type":"object","properties":{}}""")]);

        handler.SetResponse(HttpStatusCode.OK, TextReplyResponse);
        var finalResponse = await client.ContinueWithToolResultAsync(toolCallResponse, """{"result":"22C, sunny"}""");

        Assert.Contains("thoughtSignature", handler.LastRequestBody);
        Assert.Contains("functionResponse", handler.LastRequestBody);
        Assert.Contains("22", finalResponse.ReplyText);
        Assert.Null(finalResponse.ToolCall);
    }

    [Fact]
    public async Task SendAsync_ThrowsChatModelUnavailable_OnNonSuccessStatus()
    {
        var (client, _) = Build(HttpStatusCode.ServiceUnavailable, """{"error":{"message":"overloaded"}}""");

        await Assert.ThrowsAsync<ChatModelUnavailableException>(() =>
            client.SendAsync([new ChatMessageDto("user", "Hi")], []));
    }

    [Fact]
    public async Task SendAsync_ThrowsChatModelUnavailable_OnMalformedResponseBody()
    {
        var (client, _) = Build(HttpStatusCode.OK, "{not valid json");

        await Assert.ThrowsAsync<ChatModelUnavailableException>(() =>
            client.SendAsync([new ChatMessageDto("user", "Hi")], []));
    }

    private class StubHandler(HttpStatusCode status, string body) : HttpMessageHandler
    {
        private HttpStatusCode _status = status;
        private string _body = body;

        public string LastRequestBody { get; private set; } = "";
        public string LastRequestHeaders { get; private set; } = "";

        public void SetResponse(HttpStatusCode status, string body)
        {
            _status = status;
            _body = body;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequestBody = request.Content is null ? "" : await request.Content.ReadAsStringAsync(cancellationToken);
            LastRequestHeaders = string.Join(",", request.Headers.Select(h => h.Key));
            return new HttpResponseMessage(_status)
            {
                Content = new StringContent(_body, Encoding.UTF8, "application/json")
            };
        }
    }
}

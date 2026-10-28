using System.Text.Json;

namespace StackFlow.Application.Chat.Tools;

/// <summary>
/// Tiny helper for reading optional fields out of a tool call's argumentsJson. Tools only ever
/// read fields that narrow a query (e.g. "which month") — they never read an identity field
/// (employeeId) from here; identity always comes from ChatCallContext.
/// </summary>
internal static class ChatToolArguments
{
    public static JsonElement Parse(string? argumentsJson)
    {
        if (string.IsNullOrWhiteSpace(argumentsJson))
        {
            return default;
        }

        using var document = JsonDocument.Parse(argumentsJson);
        return document.RootElement.Clone();
    }

    public static string? GetString(this JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(name, out var value) &&
        value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    public static int? GetInt(this JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty(name, out var value) &&
        value.ValueKind == JsonValueKind.Number
            ? value.GetInt32()
            : null;

    public static IReadOnlyList<string> GetStringArray(this JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(name, out var value) ||
            value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return value.EnumerateArray()
            .Where(item => item.ValueKind == JsonValueKind.String)
            .Select(item => item.GetString()!)
            .ToList();
    }

    /// <summary>Reads a "YYYY-MM-DD" date. Anything else is treated as absent.</summary>
    public static DateOnly? GetDate(this JsonElement element, string name) =>
        DateOnly.TryParseExact(element.GetString(name), "yyyy-MM-dd", out var date) ? date : null;

    public static TEnum? GetEnum<TEnum>(this JsonElement element, string name) where TEnum : struct =>
        Enum.TryParse<TEnum>(element.GetString(name), ignoreCase: true, out var parsed) ? parsed : null;
}

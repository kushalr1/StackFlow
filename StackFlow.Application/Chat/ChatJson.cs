using System.Text.Encodings.Web;
using System.Text.Json;

namespace StackFlow.Application.Chat;

/// <summary>
/// Serializer for tool results. Relaxed escaping keeps symbols such as ₹ readable to the model
/// instead of \u20B9 sequences.
/// </summary>
public static class ChatJson
{
    private static readonly JsonSerializerOptions Options = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    public static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Options);
}

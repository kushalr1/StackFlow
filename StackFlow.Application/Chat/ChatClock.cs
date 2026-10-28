namespace StackFlow.Application.Chat;

/// <summary>
/// "Today" for the assistant. The company works in India, so relative dates ("today", "aaj") are
/// resolved in Asia/Kolkata rather than the server's or the UTC clock.
/// </summary>
public static class ChatClock
{
    private static readonly TimeZoneInfo CompanyZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");

    public static DateOnly Today() =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, CompanyZone));
}

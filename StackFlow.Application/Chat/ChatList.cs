using System.Globalization;

namespace StackFlow.Application.Chat;

/// <summary>One column of a list. Type is one of: text, date, number, currency, status.</summary>
public record ChatListColumn(string Key, string Label, string Type);

/// <summary>
/// A cell shows Text to the user. Sort is the raw value (number, ISO date or text) the viewer sorts by.
/// </summary>
public record ChatCell(string Text, object? Sort);

/// <summary>
/// Structured list result. The model only writes a one-line summary; the app renders this payload as a card
/// and a full-screen viewer. Rows are already role-scoped by the tool that built them.
/// </summary>
public record ChatList(
    string Title,
    string? Subtitle,
    IReadOnlyList<ChatListColumn> Columns,
    IReadOnlyList<Dictionary<string, ChatCell>> Rows,
    int TotalCount);

public static class ChatListBuilder
{
    public const int MaxRows = 500;

    public static ChatList Build(string title, string? subtitle, IReadOnlyList<ChatListColumn> columns, IReadOnlyList<Dictionary<string, ChatCell>> rows) =>
        new(title, subtitle, columns, rows.Take(MaxRows).ToList(), rows.Count);

    public static ChatCell Text(string? value) => new(string.IsNullOrWhiteSpace(value) ? "—" : value, value ?? string.Empty);

    public static ChatCell Date(DateOnly? value) =>
        value is DateOnly date ? new(ChatDate.Format(date), date.ToString("yyyy-MM-dd")) : new("—", string.Empty);

    public static ChatCell Currency(decimal value) => new(ChatMoney.Format(value), ChatMoney.Round(value));

    public static ChatCell Number(int value) => new(value.ToString(CultureInfo.InvariantCulture), value);

    public static ChatCell Status(string value) => new(value, value);
}

/// <summary>Dates for India, e.g. "7 Oct 2026".</summary>
public static class ChatDate
{
    private static readonly CultureInfo IndiaCulture = CultureInfo.GetCultureInfo("en-IN");

    public static string Format(DateOnly date) => date.ToString("d MMM yyyy", IndiaCulture);
}

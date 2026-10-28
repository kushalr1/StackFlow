using System.Globalization;

namespace StackFlow.Application.Chat;

/// <summary>All money in chat is rounded to 2 decimals in C# and formatted with Indian digit grouping.</summary>
public static class ChatMoney
{
    private static readonly CultureInfo IndiaCulture = CultureInfo.GetCultureInfo("en-IN");

    public static decimal Round(decimal amount) => Math.Round(amount, 2, MidpointRounding.AwayFromZero);

    public static string Format(decimal amount) => Round(amount).ToString("C2", IndiaCulture);
}

using stackflow_api.Models;
using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Payroll;

/// <summary>A leave request as the payroll rule needs it: its type, status and inclusive date span.</summary>
public record LeaveSpan(LeaveType Type, LeaveStatus Status, DateOnly Start, DateOnly End);

public record PayrollBreakdown(
    decimal MonthlySalary,
    int DaysInMonth,
    decimal PerDaySalary,
    int PaidLeaveDays,
    int SickLeaveDays,
    int UnpaidLeaveDays,
    decimal Deduction,
    decimal FinalSalary);

/// <summary>
/// Fixed payroll rule. Per-day = monthly ÷ calendar days in the month. Only approved UnpaidLeave days
/// are deducted; Casual, Paid and Other leave are not, and SickLeave is counted but not deducted.
/// A leave that spans two months contributes only its days inside the requested month.
/// </summary>
public static class PayrollCalculator
{
    public const int MinYear = 1900;
    public const int MaxYear = 2100;

    public static PayrollBreakdown Calculate(decimal monthlySalary, int year, int month, IEnumerable<LeaveSpan> leaves)
    {
        if (month is < 1 or > 12)
        {
            throw new ArgumentOutOfRangeException(nameof(month), "Month must be between 1 and 12.");
        }

        if (year is < MinYear or > MaxYear)
        {
            throw new ArgumentOutOfRangeException(nameof(year), $"Year must be between {MinYear} and {MaxYear}.");
        }

        if (monthlySalary < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(monthlySalary), "Salary cannot be negative.");
        }

        var monthStart = new DateOnly(year, month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);
        var daysInMonth = monthEnd.Day;
        var approved = leaves.Where(leave => leave.Status == LeaveStatus.Approved).ToList();

        // Each calendar day is classified once, so overlapping leave records cannot double-count a day,
        // and the unpaid count can never exceed the days in the month.
        var paidDays = 0;
        var sickDays = 0;
        var unpaidDays = 0;
        for (var day = monthStart; day <= monthEnd; day = day.AddDays(1))
        {
            var covering = approved.Where(leave => leave.Start <= day && day <= leave.End).Select(leave => leave.Type).ToList();
            if (covering.Count == 0)
            {
                continue;
            }

            if (covering.Contains(LeaveType.UnpaidLeave))
            {
                unpaidDays++;
            }
            else if (covering.Contains(LeaveType.SickLeave))
            {
                sickDays++;
            }
            else
            {
                paidDays++;
            }
        }

        var perDay = ChatMoney.Round(monthlySalary / daysInMonth);
        var deduction = ChatMoney.Round(perDay * unpaidDays);
        var finalSalary = ChatMoney.Round(monthlySalary - deduction);

        return new PayrollBreakdown(
            ChatMoney.Round(monthlySalary), daysInMonth, perDay, paidDays, sickDays, unpaidDays, deduction, finalSalary);
    }

    /// <summary>Inclusive count of days shared by two date ranges; zero when they do not overlap.</summary>
    public static int OverlapDays(DateOnly start, DateOnly end, DateOnly rangeStart, DateOnly rangeEnd)
    {
        var from = start > rangeStart ? start : rangeStart;
        var to = end < rangeEnd ? end : rangeEnd;
        return to < from ? 0 : to.DayNumber - from.DayNumber + 1;
    }
}

using stackflow_api.Models;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Payroll;

namespace stackflow_api.Tests.Chat;

public class PayrollCalculatorTests
{
    [Fact]
    public void NoLeaves_NothingDeducted_FinalEqualsMonthly()
    {
        var result = PayrollCalculator.Calculate(31000m, 2026, 10, []);

        Assert.Equal(31, result.DaysInMonth);
        Assert.Equal(1000m, result.PerDaySalary);
        Assert.Equal(0, result.UnpaidLeaveDays);
        Assert.Equal(0m, result.Deduction);
        Assert.Equal(31000m, result.FinalSalary);
    }

    [Fact]
    public void LeaveSpanningMonthBoundary_CountsOnlyDaysInsideTheRequestedMonth()
    {
        // Unpaid leave 30 Oct → 2 Nov: October gets 2 days (30, 31), November gets 2.
        var leave = new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 30), new DateOnly(2026, 11, 2));

        var october = PayrollCalculator.Calculate(31000m, 2026, 10, [leave]);
        var november = PayrollCalculator.Calculate(30000m, 2026, 11, [leave]);

        Assert.Equal(2, october.UnpaidLeaveDays);
        Assert.Equal(2000m, october.Deduction);
        Assert.Equal(29000m, october.FinalSalary);
        Assert.Equal(2, november.UnpaidLeaveDays);
        Assert.Equal(2000m, november.Deduction);
    }

    [Fact]
    public void OnlyPaidCasualSickAndOtherLeave_AreNotDeducted()
    {
        var leaves = new[]
        {
            new LeaveSpan(LeaveType.PaidLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 2)),
            new LeaveSpan(LeaveType.CasualLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 5)),
            new LeaveSpan(LeaveType.SickLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 10), new DateOnly(2026, 10, 11)),
            new LeaveSpan(LeaveType.Other, LeaveStatus.Approved, new DateOnly(2026, 10, 20), new DateOnly(2026, 10, 20)),
        };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(4, result.PaidLeaveDays);  // 2 paid + 1 casual + 1 other
        Assert.Equal(2, result.SickLeaveDays);
        Assert.Equal(0, result.UnpaidLeaveDays);
        Assert.Equal(0m, result.Deduction);
        Assert.Equal(31000m, result.FinalSalary);
    }

    [Fact]
    public void AllUnpaidMonth_DeductsWholeSalary()
    {
        var leave = new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Approved, new DateOnly(2026, 4, 1), new DateOnly(2026, 4, 30));

        var result = PayrollCalculator.Calculate(30000m, 2026, 4, [leave]);

        Assert.Equal(30, result.UnpaidLeaveDays);
        Assert.Equal(30000m, result.Deduction);
        Assert.Equal(0m, result.FinalSalary);
    }

    [Theory]
    [InlineData(2026, 2, 28)]
    [InlineData(2028, 2, 29)]
    [InlineData(2026, 4, 30)]
    [InlineData(2026, 10, 31)]
    public void PerDaySalary_UsesCalendarDaysOfTheMonth(int year, int month, int expectedDays)
    {
        var salary = expectedDays * 1000m;
        var leave = new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Approved, new DateOnly(year, month, 1), new DateOnly(year, month, 1));

        var result = PayrollCalculator.Calculate(salary, year, month, [leave]);

        Assert.Equal(expectedDays, result.DaysInMonth);
        Assert.Equal(1000m, result.PerDaySalary);
        Assert.Equal(1000m, result.Deduction);
        Assert.Equal(salary - 1000m, result.FinalSalary);
    }

    [Fact]
    public void PendingAndRejectedLeave_AreIgnored()
    {
        var leaves = new[]
        {
            new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Pending, new DateOnly(2026, 10, 3), new DateOnly(2026, 10, 4)),
            new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Rejected, new DateOnly(2026, 10, 6), new DateOnly(2026, 10, 6)),
        };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(0, result.UnpaidLeaveDays);
        Assert.Equal(31000m, result.FinalSalary);
    }

    [Fact]
    public void Rounding_IsTwoDecimals_AndMatchesTheManualFormula()
    {
        // 50,000 ÷ 31 = 1,612.903… → per-day ₹1,612.90. 3 unpaid days → deduction ₹4,838.70.
        var leave = new LeaveSpan(LeaveType.UnpaidLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 7), new DateOnly(2026, 10, 9));

        var result = PayrollCalculator.Calculate(50000m, 2026, 10, [leave]);

        Assert.Equal(1612.90m, result.PerDaySalary);
        Assert.Equal(4838.70m, result.Deduction);
        Assert.Equal(45161.30m, result.FinalSalary);
    }

    [Fact]
    public void Money_FormatsWithIndianGroupingAndRupeeSymbol()
    {
        Assert.Equal("₹1,23,456.70", ChatMoney.Format(123456.7m));
    }
}

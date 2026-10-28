using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Payroll;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

/// <summary>Negative and boundary cases for the payroll rule. Pure calculator cases first, then the tool that calls it.</summary>
public class PayrollNegativeCaseTests
{
    private static LeaveSpan Unpaid(DateOnly start, DateOnly end) => new(LeaveType.UnpaidLeave, LeaveStatus.Approved, start, end);

    [Theory]
    [InlineData(0)]
    [InlineData(13)]
    public void Calculate_MonthOutOfRange_Throws(int month)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => PayrollCalculator.Calculate(31000m, 2026, month, []));
    }

    [Theory]
    [InlineData(1899)]
    [InlineData(2101)]
    public void Calculate_YearOutsideSupportedRange_Throws(int year)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => PayrollCalculator.Calculate(31000m, year, 6, []));
    }

    [Fact]
    public void Calculate_NegativeSalary_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => PayrollCalculator.Calculate(-1m, 2026, 10, []));
    }

    [Fact]
    public void Calculate_ZeroSalary_ReturnsZeroFinalSalaryWithoutDividingByZero()
    {
        var result = PayrollCalculator.Calculate(0m, 2026, 10, [Unpaid(new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 3))]);

        Assert.Equal(0m, result.PerDaySalary);
        Assert.Equal(0m, result.FinalSalary);
    }

    [Fact]
    public void Calculate_LeaveEndingBeforeItStarts_DeductsNothing()
    {
        var result = PayrollCalculator.Calculate(31000m, 2026, 10, [Unpaid(new DateOnly(2026, 10, 9), new DateOnly(2026, 10, 5))]);

        Assert.Equal(0, result.UnpaidLeaveDays);
        Assert.Equal(31000m, result.FinalSalary);
    }

    [Fact]
    public void Calculate_LeaveStartingAndEndingSameDay_CountsOneDay()
    {
        var result = PayrollCalculator.Calculate(31000m, 2026, 10, [Unpaid(new DateOnly(2026, 10, 15), new DateOnly(2026, 10, 15))]);

        Assert.Equal(1, result.UnpaidLeaveDays);
        Assert.Equal(30000m, result.FinalSalary);
    }

    [Fact]
    public void Calculate_OverlappingUnpaidRecords_CountEachDayOnce()
    {
        var leaves = new[]
        {
            Unpaid(new DateOnly(2026, 10, 5), new DateOnly(2026, 10, 7)),
            Unpaid(new DateOnly(2026, 10, 6), new DateOnly(2026, 10, 8)),
        };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(4, result.UnpaidLeaveDays);
        Assert.Equal(4000m, result.Deduction);
    }

    [Fact]
    public void Calculate_DayCoveredByUnpaidAndSick_CountsAsUnpaidOnly()
    {
        var leaves = new[]
        {
            new LeaveSpan(LeaveType.SickLeave, LeaveStatus.Approved, new DateOnly(2026, 10, 2), new DateOnly(2026, 10, 2)),
            Unpaid(new DateOnly(2026, 10, 2), new DateOnly(2026, 10, 2)),
        };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(1, result.UnpaidLeaveDays);
        Assert.Equal(0, result.SickLeaveDays);
    }

    [Fact]
    public void Calculate_UnpaidLeaveCoveringMonthAndMore_CapsDeductionAtMonthlySalary()
    {
        var leaves = new[] { Unpaid(new DateOnly(2026, 9, 1), new DateOnly(2026, 12, 31)) };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(31, result.UnpaidLeaveDays);
        Assert.Equal(0m, result.FinalSalary);
        Assert.True(result.FinalSalary >= 0);
    }

    [Fact]
    public void Calculate_DeductionOfOddPerDayAmount_RoundsToTwoDecimals()
    {
        // April has 30 days: 10000 / 30 = 333.333... per day, rounded to 333.33 before multiplying by 3 days.
        var result = PayrollCalculator.Calculate(10000m, 2026, 4, [Unpaid(new DateOnly(2026, 4, 1), new DateOnly(2026, 4, 3))]);

        Assert.Equal(333.33m, result.PerDaySalary);
        Assert.Equal(999.99m, result.Deduction);
        Assert.Equal(9000.01m, result.FinalSalary);
    }

    [Fact]
    public void Calculate_FirstAndLastDayOfMonth_BothCountInsideTheMonth()
    {
        var leaves = new[]
        {
            Unpaid(new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 1)),
            Unpaid(new DateOnly(2026, 10, 31), new DateOnly(2026, 10, 31)),
        };

        var result = PayrollCalculator.Calculate(31000m, 2026, 10, leaves);

        Assert.Equal(2, result.UnpaidLeaveDays);
    }

    [Fact]
    public void Calculate_FarPastYearInRange_UsesCalendarDays()
    {
        var result = PayrollCalculator.Calculate(31000m, 1900, 2, []);

        Assert.Equal(28, result.DaysInMonth);
    }

    [Fact]
    public async Task CalculateMonthlyPayrollTool_MonthThirteen_AsksWhichMonthInsteadOfCrashing()
    {
        var tool = BuildTool(new EmployeeDto { Id = 1, Name = "Arnav", Salary = 31000m, IsActive = true, DateOfJoining = new DateOnly(2025, 1, 1) }, []);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"month":13,"year":2026}""");

        Assert.Contains("\"missing\":\"month\"", result);
    }

    [Fact]
    public async Task CalculateMonthlyPayrollTool_YearFarFuture_IsRefusedWithoutCrashing()
    {
        var tool = BuildTool(new EmployeeDto { Id = 1, Name = "Arnav", Salary = 31000m, IsActive = true, DateOfJoining = new DateOnly(2025, 1, 1) }, []);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"month":6,"year":9999}""");

        Assert.Contains("\"missing\":\"year\"", result);
        Assert.DoesNotContain("finalSalary", result);
    }

    [Fact]
    public async Task CalculateMonthlyPayrollTool_NullOrZeroSalary_ReportsMissingSalary()
    {
        var tool = BuildTool(new EmployeeDto { Id = 1, Name = "Arnav", Salary = 0m, IsActive = true, DateOfJoining = new DateOnly(2025, 1, 1) }, []);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"month":10,"year":2026}""");

        Assert.Contains("\"missing\":\"salary\"", result);
    }

    [Fact]
    public async Task CalculateMonthlyPayrollTool_PendingAndRejectedUnpaidLeave_AreNotDeducted()
    {
        var leaves = new List<LeaveRequestDto>
        {
            new() { Id = 1, EmployeeId = 1, LeaveType = "UnpaidLeave", Status = "Pending", StartDate = new DateOnly(2026, 10, 2), EndDate = new DateOnly(2026, 10, 3) },
            new() { Id = 2, EmployeeId = 1, LeaveType = "UnpaidLeave", Status = "Rejected", StartDate = new DateOnly(2026, 10, 4), EndDate = new DateOnly(2026, 10, 4) },
        };
        var tool = BuildTool(new EmployeeDto { Id = 1, Name = "Arnav", Salary = 31000m, IsActive = true, DateOfJoining = new DateOnly(2025, 1, 1) }, leaves);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"month":10,"year":2026}""");

        Assert.Contains("\"unpaidLeaveDays\":0", result);
        Assert.Contains("\"finalSalary\":\"₹31,000.00\"", result);
    }

    [Fact]
    public async Task CalculateMonthlyPayrollTool_LeavesOfAnotherEmployee_AreNotCounted()
    {
        // The leave service is keyed by employee id: asking for Arnav must never return Dhruv's leave.
        var leaves = new List<LeaveRequestDto>
        {
            new() { Id = 9, EmployeeId = 2, LeaveType = "UnpaidLeave", Status = "Approved", StartDate = new DateOnly(2026, 10, 2), EndDate = new DateOnly(2026, 10, 10) },
        };
        var tool = BuildTool(new EmployeeDto { Id = 1, Name = "Arnav", Salary = 31000m, IsActive = true, DateOfJoining = new DateOnly(2025, 1, 1) }, leaves);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"month":10,"year":2026}""");

        Assert.Contains("\"unpaidLeaveDays\":0", result);
    }

    private static ChatCallContext EmployeeCaller(int employeeId) => new(AccountId: 10 + employeeId, EmployeeId: employeeId, Role: UserRoles.Employee);

    private static CalculateMonthlyPayrollTool BuildTool(EmployeeDto employee, IReadOnlyList<LeaveRequestDto> leaves)
    {
        var employees = new FakeEmployees([employee]);
        var lookup = new ChatLookup(employees, new FakeDepartments());
        return new CalculateMonthlyPayrollTool(lookup, new FakeLeaveRequests(leaves));
    }

    private class FakeEmployees(IReadOnlyList<EmployeeDto> all) : IEmployeeService
    {
        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive) => Task.FromResult<IReadOnlyList<EmployeeDto>>(all.ToList());
        public Task<EmployeeDto?> GetByIdAsync(int id) => Task.FromResult(all.FirstOrDefault(employee => employee.Id == id));
        public Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeUpdateResult> UpdateAsync(int id, UpdateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto relieveEmployeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by these tests.");
    }

    private class FakeDepartments : IDepartmentService
    {
        public Task<IReadOnlyList<DepartmentDto>> GetAllAsync() => Task.FromResult<IReadOnlyList<DepartmentDto>>([]);
        public Task<DepartmentDto?> GetByIdAsync(int id) => Task.FromResult<DepartmentDto?>(null);
        public Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<DepartmentUpdateResult> UpdateAsync(int id, SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<DepartmentDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by these tests.");
    }

    private class FakeLeaveRequests(IReadOnlyList<LeaveRequestDto> all) : ILeaveRequestService
    {
        public Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(int? employeeId, LeaveStatus? status, LeaveType? leaveType) =>
            Task.FromResult<IReadOnlyList<LeaveRequestDto>>(all.Where(request => employeeId is null || request.EmployeeId == employeeId).ToList());
        public Task<LeaveRequestDto?> GetByIdAsync(int id) => Task.FromResult(all.FirstOrDefault(request => request.Id == id));
        public Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status) => throw new NotSupportedException("Not used by these tests.");
    }
}

using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

/// <summary>Salary aggregates and top-paid lists: empty departments, unknown names, bad counts, ties.</summary>
public class SalaryAggregateNegativeTests
{
    private static readonly ChatCallContext AdminCaller = new(AccountId: 2, EmployeeId: null, Role: UserRoles.Admin);

    private static readonly DepartmentDto Technical = new() { Id = 1, Name = "Technical" };
    private static readonly DepartmentDto Hr = new() { Id = 2, Name = "Human Resources" };

    private static readonly EmployeeDto Arnav = new() { Id = 1, Name = "Arnav", Salary = 50000m, DepartmentId = 1, IsActive = true };
    private static readonly EmployeeDto Vivek = new() { Id = 2, Name = "Vivek", Salary = 40000m, DepartmentId = 1, IsActive = true };
    private static readonly EmployeeDto Left = new() { Id = 3, Name = "Former", Salary = 99000m, DepartmentId = 1, IsActive = false };

    [Fact]
    public async Task GetSalaryStats_DepartmentWithNoActiveEmployees_ReturnsNoDataInsteadOfAnAverage()
    {
        var tool = BuildSalaryTool([Arnav, Vivek]);

        var result = await tool.ExecuteAsync(AdminCaller, """{"department":"Human Resources","metric":"avg"}""");

        Assert.Contains("\"noData\":true", result);
        Assert.DoesNotContain("\"value\"", result);
    }

    [Fact]
    public async Task GetSalaryStats_SingleEmployee_ReportsThatSalaryAsTheAverage()
    {
        var tool = BuildSalaryTool([Arnav]);

        var result = await tool.ExecuteAsync(AdminCaller, """{"metric":"avg"}""");

        Assert.Contains("\"value\":\"₹50,000.00\"", result);
        Assert.Contains("\"activeEmployees\":1", result);
    }

    [Fact]
    public async Task GetSalaryStats_InactiveEmployeeWithHighSalary_IsExcludedFromTheMax()
    {
        var tool = BuildSalaryTool([Arnav, Vivek, Left]);

        var result = await tool.ExecuteAsync(AdminCaller, """{"department":"Technical","metric":"max"}""");

        Assert.Contains("\"value\":\"₹50,000.00\"", result);
        Assert.DoesNotContain("99,000", result);
    }

    [Fact]
    public async Task GetSalaryStats_NonExistentDepartment_ReturnsNotFoundAndNoNumber()
    {
        var tool = BuildSalaryTool([Arnav]);

        var result = await tool.ExecuteAsync(AdminCaller, """{"department":"Quantum Physics","metric":"sum"}""");

        Assert.Contains("\"notFound\":true", result);
        Assert.DoesNotContain("\"value\"", result);
    }

    [Theory]
    [InlineData("technical")]
    [InlineData("  TECHNICAL  ")]
    [InlineData("TecHnicAl")]
    public async Task GetSalaryStats_DepartmentNameCaseAndSpacing_ResolvesToTheSameDepartment(string name)
    {
        var tool = BuildSalaryTool([Arnav, Vivek]);

        var result = await tool.ExecuteAsync(AdminCaller, $$"""{"department":"{{name}}","metric":"count"}""");

        Assert.Contains("\"scope\":\"Technical\"", result);
        Assert.Contains("\"value\":\"2\"", result);
    }

    [Fact]
    public async Task GetSalaryStats_UnknownMetric_FallsBackToAverageWithoutThrowing()
    {
        var tool = BuildSalaryTool([Arnav, Vivek]);

        var result = await tool.ExecuteAsync(AdminCaller, """{"metric":"median"}""");

        Assert.Contains("\"value\":\"₹45,000.00\"", result);
    }

    [Fact]
    public async Task CompareDepartments_DepartmentWithNoEmployees_ListedAsEmptyNotAsZeroAverage()
    {
        var tool = new CompareDepartmentsSalaryTool(new FakeDepartments([Technical, Hr]), new FakeEmployees([Arnav, Vivek]));

        var result = await tool.ExecuteAsync(AdminCaller, "{}");

        Assert.Contains("\"departmentsWithoutActiveEmployees\":[\"Human Resources\"]", result);
        Assert.DoesNotContain("\"department\":\"Human Resources\"", result);
    }

    [Fact]
    public async Task CompareDepartments_NoDepartmentsExist_ReturnsEmptyComparison()
    {
        var tool = new CompareDepartmentsSalaryTool(new FakeDepartments([]), new FakeEmployees([]));

        var result = await tool.ExecuteAsync(AdminCaller, "{}");

        Assert.Contains("\"comparison\":[]", result);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-5")]
    public async Task GetTopPaid_ZeroOrNegativeN_IsClampedToOneResult(string n)
    {
        var tool = new GetTopPaidTool(new ChatLookup(new FakeEmployees([Arnav, Vivek]), new FakeDepartments([])), new FakeEmployees([Arnav, Vivek]));

        var result = await tool.ExecuteAsync(AdminCaller, $$"""{"n":{{n}}}""");

        Assert.Contains("\"Arnav\"", result);
        Assert.DoesNotContain("\"Vivek\"", result);
    }

    [Fact]
    public async Task GetTopPaid_TieForHighestWithNEqualOne_ListsEveryoneTied()
    {
        var twin = new EmployeeDto { Id = 4, Name = "Twin", Salary = 50000m, DepartmentId = 1, IsActive = true };
        var tool = new GetTopPaidTool(new ChatLookup(new FakeEmployees([Arnav, twin]), new FakeDepartments([])), new FakeEmployees([Arnav, twin]));

        var result = await tool.ExecuteAsync(AdminCaller, """{"n":1}""");

        Assert.Contains("\"Arnav\"", result);
        Assert.Contains("\"Twin\"", result);
    }

    [Fact]
    public async Task GetTopPaid_DepartmentWithNoActiveEmployees_ReturnsNoData()
    {
        var employees = new FakeEmployees([Arnav, Vivek]);
        var tool = new GetTopPaidTool(new ChatLookup(employees, new FakeDepartments([Technical, Hr])), employees);

        var result = await tool.ExecuteAsync(AdminCaller, """{"department":"Human Resources"}""");

        Assert.Contains("\"noData\":true", result);
    }

    private static GetSalaryStatsTool BuildSalaryTool(IReadOnlyList<EmployeeDto> employees)
    {
        var departments = new FakeDepartments([Technical, Hr]);
        var employeeService = new FakeEmployees(employees);
        return new GetSalaryStatsTool(new ChatLookup(employeeService, departments), employeeService);
    }

    private class FakeEmployees(IReadOnlyList<EmployeeDto> all) : IEmployeeService
    {
        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive) =>
            Task.FromResult<IReadOnlyList<EmployeeDto>>(all
                .Where(employee => departmentId is null || employee.DepartmentId == departmentId)
                .Where(employee => isActive is null || employee.IsActive == isActive)
                .ToList());
        public Task<EmployeeDto?> GetByIdAsync(int id) => Task.FromResult(all.FirstOrDefault(employee => employee.Id == id));
        public Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeUpdateResult> UpdateAsync(int id, UpdateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto relieveEmployeeDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<EmployeeDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by these tests.");
    }

    private class FakeDepartments(IReadOnlyList<DepartmentDto> all) : IDepartmentService
    {
        public Task<IReadOnlyList<DepartmentDto>> GetAllAsync() => Task.FromResult(all);
        public Task<DepartmentDto?> GetByIdAsync(int id) => Task.FromResult(all.FirstOrDefault(department => department.Id == id));
        public Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<DepartmentUpdateResult> UpdateAsync(int id, SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by these tests.");
        public Task<DepartmentDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by these tests.");
    }
}

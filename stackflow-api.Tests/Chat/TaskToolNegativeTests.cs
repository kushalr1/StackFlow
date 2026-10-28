using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

/// <summary>To-do lookups with empty days, overdue items, other employees' items, and bad date ranges. All dates are explicit.</summary>
public class TaskToolNegativeTests
{
    private static readonly DateOnly Day = new(2026, 10, 27);

    private static readonly EmployeeDto Arnav = new() { Id = 1, Name = "Arnav", IsActive = true };
    private static readonly EmployeeDto Dhruv = new() { Id = 2, Name = "Dhruv", IsActive = true };

    private static ChatCallContext EmployeeCaller(int id) => new(AccountId: 10 + id, EmployeeId: id, Role: UserRoles.Employee);

    [Fact]
    public async Task GetEmployeeTasks_NoTasksOnTheDate_ReturnsEmptyStateWithAddAction()
    {
        var actions = new ChatActionCollector();
        var tool = BuildTool(new FakeTasks([]), actions);

        var result = await tool.ExecuteAsync(EmployeeCaller(1), $$"""{"date":"{{Day:yyyy-MM-dd}}"}""");

        Assert.Contains("\"count\":0", result);
        Assert.Contains("You don't have any to-dos", result);
        Assert.Contains(actions.Actions, action => action.Route.Contains("todo", StringComparison.OrdinalIgnoreCase) || action.Label.Contains("to-do", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetEmployeeTasks_OverdueTaskFromAnEarlierDate_IsNotListedForTheDate()
    {
        var overdue = new PersonalTaskDto(1, "Old report", "Daily", Day.AddDays(-5), false);
        var tool = BuildTool(new FakeTasks([overdue]), new ChatActionCollector());

        var result = await tool.ExecuteAsync(EmployeeCaller(1), $$"""{"date":"{{Day:yyyy-MM-dd}}"}""");

        Assert.Contains("\"count\":0", result);
        Assert.DoesNotContain("Old report", result);
    }

    [Fact]
    public async Task GetEmployeeTasks_AnotherEmployeesTaskNamedInTheRequest_IsRefused()
    {
        var tasks = new FakeTasks([new PersonalTaskDto(1, "Dhruv secret task", "Daily", Day, false)]);
        var tool = BuildTool(tasks, new ChatActionCollector());

        var result = await tool.ExecuteAsync(EmployeeCaller(1), $$"""{"employee":"Dhruv","date":"{{Day:yyyy-MM-dd}}"}""");

        Assert.Contains("You can only view your own information.", result);
        Assert.DoesNotContain("Dhruv secret task", result);
        Assert.Equal(0, tasks.RequestedOwner);
    }

    [Fact]
    public async Task GetEmployeeTasks_FromDateAfterToDate_ReturnsInvalidRangeError()
    {
        var tool = BuildTool(new FakeTasks([new PersonalTaskDto(1, "Any", "Daily", Day, false)]), new ChatActionCollector());

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"fromDate":"2026-10-30","toDate":"2026-10-01"}""");

        Assert.Contains("\"error\":\"invalid_range\"", result);
        Assert.DoesNotContain("\"tasks\"", result);
    }

    [Fact]
    public async Task GetEmployeeTasks_MalformedDate_DoesNotThrow()
    {
        var tool = BuildTool(new FakeTasks([]), new ChatActionCollector());

        var result = await tool.ExecuteAsync(EmployeeCaller(1), """{"date":"27/10/2026"}""");

        Assert.False(string.IsNullOrWhiteSpace(result));
    }

    private static GetEmployeeTasksTool BuildTool(FakeTasks tasks, ChatActionCollector actions)
    {
        var employees = new FakeEmployees([Arnav, Dhruv]);
        return new GetEmployeeTasksTool(new ChatLookup(employees, new FakeDepartments()), tasks, actions);
    }

    private class FakeTasks(List<PersonalTaskDto> items) : IPersonalTaskService
    {
        public int RequestedOwner { get; private set; }
        public Task<List<PersonalTaskDto>> ListAsync(int owner)
        {
            RequestedOwner = owner;
            return Task.FromResult(items);
        }
        public Task<PersonalTaskDto> CreateAsync(int owner, SavePersonalTask input) => throw new NotSupportedException("Not used by these tests.");
        public Task<bool> CompleteAsync(int owner, int id, bool completed) => throw new NotSupportedException("Not used by these tests.");
        public Task<bool> DeleteAsync(int owner, int id) => throw new NotSupportedException("Not used by these tests.");
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
}

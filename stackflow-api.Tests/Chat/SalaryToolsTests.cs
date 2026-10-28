using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

public class SalaryToolsTests
{
    private static ChatCallContext AdminCaller() => new(AccountId: 2, EmployeeId: null, Role: UserRoles.Admin);

    [Fact]
    public async Task GetTopPaid_IncludesEveryoneTiedWithTheLastPlaceShown()
    {
        var employees = new FakeEmployees(
        [
            new EmployeeDto { Id = 1, Name = "Dev", Salary = 50000m, IsActive = true },
            new EmployeeDto { Id = 2, Name = "Mayank", Salary = 50000m, IsActive = true },
            new EmployeeDto { Id = 3, Name = "Arnav", Salary = 40000m, IsActive = true },
        ]);
        var tool = new GetTopPaidTool(new ChatLookup(employees, new FakeDepartments()), employees);

        var result = await tool.ExecuteAsync(AdminCaller(), """{"n": 1}""");

        Assert.Contains("\"Dev\"", result);
        Assert.Contains("\"Mayank\"", result);
        Assert.DoesNotContain("\"Arnav\"", result);
        Assert.Contains("\"tiedAtCutoff\":true", result);
    }

    private class FakeEmployees(IReadOnlyList<EmployeeDto> all) : IEmployeeService
    {
        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive) =>
            Task.FromResult<IReadOnlyList<EmployeeDto>>(all.ToList());
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

using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;

namespace stackflow_api.Tests.Chat;

public class ChatLookupTests
{
    private static readonly EmployeeDto Arnav = new() { Id = 1, Name = "Arnav Sharma", Email = "arnav@x.test", Salary = 50000m, IsActive = true };
    private static readonly EmployeeDto Dhruv = new() { Id = 2, Name = "Dhruv Mehta", Email = "dhruv@x.test", Salary = 90000m, IsActive = true };
    private static readonly EmployeeDto OtherArnav = new() { Id = 3, Name = "Arnav Gupta", Email = "arnav.g@x.test", Salary = 60000m, IsActive = true };

    private static ChatCallContext EmployeeArnav() => new(AccountId: 10, EmployeeId: 1, Role: UserRoles.Employee);
    private static ChatCallContext AdminCaller() => new(AccountId: 2, EmployeeId: null, Role: UserRoles.Admin);

    [Fact]
    public async Task Employee_NamingAnotherEmployee_IsRefused()
    {
        var lookup = new ChatLookup(new FakeEmployees([Arnav, Dhruv]), new FakeDepartments());

        var result = await lookup.ResolveEmployeeAsync(EmployeeArnav(), "Dhruv", id: null);

        Assert.Null(result.Match);
        Assert.Equal(ChatLookup.Refusal(), result.Json);
    }

    [Fact]
    public async Task Employee_RequestingAnotherId_IsRefused()
    {
        var lookup = new ChatLookup(new FakeEmployees([Arnav, Dhruv]), new FakeDepartments());

        var result = await lookup.ResolveEmployeeAsync(EmployeeArnav(), name: null, id: 2);

        Assert.Null(result.Match);
        Assert.Contains("refused", result.Json);
    }

    [Fact]
    public async Task Employee_WithNoName_ResolvesToSelf()
    {
        var lookup = new ChatLookup(new FakeEmployees([Arnav, Dhruv]), new FakeDepartments());

        var result = await lookup.ResolveEmployeeAsync(EmployeeArnav(), name: null, id: null);

        Assert.Equal(1, result.Match!.Id);
        Assert.Null(result.Json);
    }

    [Fact]
    public async Task Admin_NameMatchingTwoPeople_AsksWhichOne()
    {
        var lookup = new ChatLookup(new FakeEmployees([Arnav, Dhruv, OtherArnav]), new FakeDepartments());

        var result = await lookup.ResolveEmployeeAsync(AdminCaller(), "Arnav", id: null);

        Assert.Null(result.Match);
        Assert.Contains("ambiguous", result.Json);
    }

    [Fact]
    public async Task Admin_CanResolveAnyEmployee()
    {
        var lookup = new ChatLookup(new FakeEmployees([Arnav, Dhruv]), new FakeDepartments());

        var result = await lookup.ResolveEmployeeAsync(AdminCaller(), "Dhruv", id: null);

        Assert.Equal(2, result.Match!.Id);
    }

    private class FakeEmployees(IReadOnlyList<EmployeeDto> all) : IEmployeeService
    {
        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive)
        {
            IEnumerable<EmployeeDto> matches = all;
            if (search is not null)
            {
                matches = matches.Where(employee => employee.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
            }
            return Task.FromResult<IReadOnlyList<EmployeeDto>>(matches.ToList());
        }

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

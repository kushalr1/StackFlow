using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

public class FuzzyAdminToolsTests
{
    private static ChatCallContext AdminContext() => new(AccountId: 2, EmployeeId: null, Role: "Admin");

    private static readonly EmployeeDto Arnav = new() { Id = 1, Name = "Arnav Sharma", Email = "arnav@stackflow.local", DepartmentId = 10, Department = "Technical", JobTitle = "Engineer", IsActive = true };
    private static readonly EmployeeDto Meera = new() { Id = 2, Name = "Meera Rao", Email = "meera@stackflow.local", DepartmentId = 11, Department = "Design", JobTitle = "Designer", IsActive = true };

    [Theory]
    [InlineData("arnv", "Arnav Sharma")]
    [InlineData("Arnav", "Arnav Sharma")]
    [InlineData("meera rao", "Meera Rao")]
    [InlineData("mera", "Meera Rao")]
    public void FuzzyMatcher_FindsTypoAndPartialNames(string query, string expectedName)
    {
        var ranked = FuzzyMatcher.Rank(query, new[] { Arnav, Meera }, employee => [employee.Name]);

        Assert.Equal(expectedName, ranked[0].Item.Name);
    }

    [Fact]
    public void FuzzyMatcher_ReturnsNothing_ForAnUnknownName()
    {
        var ranked = FuzzyMatcher.Rank("priya", new[] { Arnav, Meera }, employee => [employee.Name]);

        Assert.Empty(ranked);
    }

    [Fact]
    public void FuzzyMatcher_IgnoresFillerWords_SoTechTeamMatchesTechnical()
    {
        var departments = new[] { new DepartmentDto { Id = 1, Name = "Technical" }, new DepartmentDto { Id = 2, Name = "Design" } };

        var ranked = FuzzyMatcher.Rank("tech team", departments, department => [department.Name]);

        Assert.Equal("Technical", Assert.Single(ranked).Item.Name);
    }

    [Fact]
    public void FuzzyMatcher_DoesNotMatchADifferentSurname()
    {
        var kumar = new EmployeeDto { Id = 3, Name = "Arnav Kumar" };

        var ranked = FuzzyMatcher.Rank("arnav sharma", new[] { kumar }, employee => [employee.Name]);

        Assert.Empty(ranked);
    }

    [Fact]
    public async Task FindEmployeeTool_FallsBackToFuzzyMatch_WhenExactSearchFindsNothing()
    {
        var fake = new FakeEmployeeService { All = [Arnav, Meera] };
        var tool = new FindEmployeeTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), """{"search": "arnv"}""");

        Assert.Contains("\"matchedBy\":\"fuzzy\"", result);
        Assert.Contains("Arnav Sharma", result);
        Assert.DoesNotContain("Meera Rao", result);
        Assert.Contains("\"Status\":\"Active\"", result);
    }

    [Fact]
    public async Task GetDepartmentMembersTool_ListsActiveMembersOfTheFuzzilyMatchedDepartment()
    {
        var departments = new FakeDepartmentService
        {
            Departments = [new DepartmentDto { Id = 10, Name = "Technical" }, new DepartmentDto { Id = 11, Name = "Design" }]
        };
        var employees = new FakeEmployeeService { All = [Arnav, Meera] };
        var tool = new GetDepartmentMembersTool(departments, employees, new StackFlow.Application.Chat.ChatActionCollector());

        var result = await tool.ExecuteAsync(AdminContext(), """{"department": "tech team"}""");

        Assert.Contains("\"found\":true", result);
        Assert.Contains("Arnav Sharma", result);
        Assert.DoesNotContain("Meera Rao", result);
    }

    [Fact]
    public async Task GetDepartmentMembersTool_ReportsAmbiguity_InsteadOfGuessing()
    {
        var departments = new FakeDepartmentService
        {
            Departments = [new DepartmentDto { Id = 10, Name = "Technical" }, new DepartmentDto { Id = 11, Name = "Technical Support" }]
        };
        var tool = new GetDepartmentMembersTool(departments, new FakeEmployeeService { All = [] }, new StackFlow.Application.Chat.ChatActionCollector());

        var result = await tool.ExecuteAsync(AdminContext(), """{"department": "technical"}""");

        Assert.Contains("\"ambiguous\"", result);
        Assert.Contains("Technical Support", result);
    }

    [Fact]
    public async Task GetLeaveRequestsTool_ReturnsAllStatuses_ForTheRequestedDay()
    {
        var today = ChatClock.Today();
        var leaves = new FakeLeaveRequestService
        {
            Requests =
            [
                new LeaveRequestDto { Id = 1, EmployeeName = "Arnav Sharma", Status = "Approved", StartDate = today, EndDate = today },
                new LeaveRequestDto { Id = 2, EmployeeName = "Meera Rao", Status = "Pending", StartDate = today.AddDays(-2), EndDate = today.AddDays(-1) },
                new LeaveRequestDto { Id = 3, EmployeeName = "Dev Patel", Status = "Rejected", StartDate = today.AddDays(-1), EndDate = today.AddDays(1) }
            ]
        };
        var tool = new GetLeaveRequestsTool(leaves, new StackFlow.Application.Chat.ChatActionCollector());

        var result = await tool.ExecuteAsync(AdminContext(), $$"""{"fromDate": "{{today:yyyy-MM-dd}}", "toDate": "{{today:yyyy-MM-dd}}"}""");

        Assert.Null(leaves.RequestedStatus);
        Assert.Contains("Arnav Sharma", result);
        Assert.Contains("Dev Patel", result);
        Assert.DoesNotContain("Meera Rao", result);
        Assert.Contains("\"totalCount\":2", result);
    }

    private class FakeEmployeeService : IEmployeeService
    {
        public IReadOnlyList<EmployeeDto> All { get; set; } = [];

        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive)
        {
            IEnumerable<EmployeeDto> matches = All;
            if (search is not null)
            {
                matches = matches.Where(employee => employee.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
            }
            if (departmentId is not null)
            {
                matches = matches.Where(employee => employee.DepartmentId == departmentId);
            }
            return Task.FromResult<IReadOnlyList<EmployeeDto>>(matches.ToList());
        }

        public Task<EmployeeDto?> GetByIdAsync(int id) => Task.FromResult(All.FirstOrDefault(e => e.Id == id));
        public Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<EmployeeUpdateResult> UpdateAsync(int id, UpdateEmployeeDto employeeDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<EmployeeRelieveResult> RelieveAsync(int id, RelieveEmployeeDto relieveEmployeeDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<EmployeeDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeDepartmentService : IDepartmentService
    {
        public IReadOnlyList<DepartmentDto> Departments { get; set; } = [];
        public Task<IReadOnlyList<DepartmentDto>> GetAllAsync() => Task.FromResult(Departments);
        public Task<DepartmentDto?> GetByIdAsync(int id) => Task.FromResult(Departments.FirstOrDefault(d => d.Id == id));
        public Task<DepartmentDto?> CreateAsync(SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<DepartmentUpdateResult> UpdateAsync(int id, SaveDepartmentDto departmentDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<DepartmentDeleteResult> DeleteAsync(int id) => throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeLeaveRequestService : ILeaveRequestService
    {
        public IReadOnlyList<LeaveRequestDto> Requests { get; set; } = [];
        public LeaveStatus? RequestedStatus { get; private set; }
        public Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(int? employeeId, LeaveStatus? status, LeaveType? leaveType)
        {
            RequestedStatus = status;
            return Task.FromResult(Requests);
        }
        public Task<LeaveRequestDto?> GetByIdAsync(int id) => Task.FromResult(Requests.FirstOrDefault(r => r.Id == id));
        public Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status) => throw new NotSupportedException("Not used by chat tools.");
    }
}

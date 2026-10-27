using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

public class AdminToolsTests
{
    private static ChatCallContext AdminContext() => new(AccountId: 1, EmployeeId: null, Role: "Admin");

    [Fact]
    public async Task FindEmployeeTool_SearchesByName_AndOmitsSalary()
    {
        var fake = new FakeEmployeeService
        {
            Results = [new EmployeeDto { Id = 7, Name = "Priya Sharma", Department = "Engineering", JobTitle = "Developer", Salary = 999999m, IsActive = true }]
        };
        var tool = new FindEmployeeTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), """{"search": "Priya"}""");

        Assert.Equal(ChatRole.Admin, tool.AllowedRole);
        Assert.Equal("Priya", fake.RequestedSearch);
        Assert.Contains("Priya Sharma", result);
        Assert.DoesNotContain("999999", result);
        Assert.DoesNotContain("Salary", result, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetDepartmentSummaryTool_ReturnsAllDepartments()
    {
        var fake = new FakeDepartmentService
        {
            Departments = [new DepartmentDto { Id = 1, Name = "Engineering", EmployeeCount = 12 }]
        };
        var tool = new GetDepartmentSummaryTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), "{}");

        Assert.Equal(ChatRole.Admin, tool.AllowedRole);
        Assert.Contains("Engineering", result);
        Assert.Contains("12", result);
    }

    [Fact]
    public async Task GetLeaveRequestsTool_FiltersByStatusAndEmployeeId()
    {
        var fake = new FakeLeaveRequestService
        {
            Requests = [new LeaveRequestDto { Id = 1, EmployeeName = "Priya Sharma", Status = "Pending" }]
        };
        var tool = new GetLeaveRequestsTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), """{"status": "Pending", "employeeId": 7}""");

        Assert.Equal(ChatRole.Admin, tool.AllowedRole);
        Assert.Equal(LeaveStatus.Pending, fake.RequestedStatus);
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Contains("Priya Sharma", result);
    }

    [Fact]
    public async Task GetLeaveRequestsTool_WorksWithNoFilters()
    {
        var fake = new FakeLeaveRequestService { Requests = [] };
        var tool = new GetLeaveRequestsTool(fake);

        await tool.ExecuteAsync(AdminContext(), "{}");

        Assert.Null(fake.RequestedStatus);
        Assert.Null(fake.RequestedEmployeeId);
    }

    [Fact]
    public async Task GetProjectStatusTool_FiltersByStatus()
    {
        var fake = new FakeProjectService
        {
            Projects = [new ProjectDto { Id = 1, Name = "Website Revamp", Status = "Active", IsDelayed = true, DelayDays = 3 }]
        };
        var tool = new GetProjectStatusTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), """{"status": "Active"}""");

        Assert.Equal(ChatRole.Admin, tool.AllowedRole);
        Assert.Equal(ProjectStatus.Active, fake.RequestedStatus);
        Assert.Contains("Website Revamp", result);
    }

    [Fact]
    public async Task GetAttendanceTodayTool_PassesTodaysDate()
    {
        var fake = new FakeAttendanceService { Records = [] };
        var tool = new GetAttendanceTodayTool(fake);

        await tool.ExecuteAsync(AdminContext(), "{}");

        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), fake.RequestedDate);
    }

    [Fact]
    public async Task GetDashboardStatsTool_ReturnsAggregateCounts()
    {
        var fake = new FakeDashboardService
        {
            Stats = new DashboardStatsDto { TotalEmployees = 10, ActiveEmployees = 9, PendingLeaveRequests = 2 }
        };
        var tool = new GetDashboardStatsTool(fake);

        var result = await tool.ExecuteAsync(AdminContext(), "{}");

        Assert.Equal(ChatRole.Admin, tool.AllowedRole);
        Assert.Contains("10", result);
        Assert.Contains("2", result);
    }

    private class FakeEmployeeService : IEmployeeService
    {
        public IReadOnlyList<EmployeeDto> Results { get; set; } = [];
        public string? RequestedSearch { get; private set; }
        public Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, int? departmentId, bool? isActive)
        {
            RequestedSearch = search;
            return Task.FromResult(Results);
        }
        public Task<EmployeeDto?> GetByIdAsync(int id) => Task.FromResult(Results.FirstOrDefault(e => e.Id == id));
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
        public int? RequestedEmployeeId { get; private set; }
        public Task<IReadOnlyList<LeaveRequestDto>> GetAllAsync(int? employeeId, LeaveStatus? status, LeaveType? leaveType)
        {
            RequestedEmployeeId = employeeId;
            RequestedStatus = status;
            return Task.FromResult(Requests);
        }
        public Task<LeaveRequestDto?> GetByIdAsync(int id) => Task.FromResult(Requests.FirstOrDefault(r => r.Id == id));
        public Task<LeaveSaveResult> CreateAsync(SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<LeaveSaveOutcome> UpdateAsync(int id, SaveLeaveRequestDto leaveRequestDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<LeaveSaveOutcome> UpdateStatusAsync(int id, LeaveStatus status) => throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeProjectService : IProjectService
    {
        public IReadOnlyList<ProjectDto> Projects { get; set; } = [];
        public ProjectStatus? RequestedStatus { get; private set; }
        public Task<IReadOnlyList<ProjectDto>> GetAllAsync(ProjectStatus? status)
        {
            RequestedStatus = status;
            return Task.FromResult(Projects);
        }
        public Task<ProjectDto?> GetByIdAsync(int id) => Task.FromResult(Projects.FirstOrDefault(p => p.Id == id));
        public Task<ProjectSaveResult> CreateAsync(CreateProjectDto dto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<ProjectSaveOutcome> UpdateAsync(int id, SaveProjectDto dto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<ProjectSaveOutcome> DeleteAsync(int id) => throw new NotSupportedException("Not used by chat tools.");
        public Task<ProjectSaveOutcome> AssignEmployeeAsync(int projectId, AssignEmployeeDto dto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<ProjectSaveOutcome> RemoveEmployeeAsync(int projectId, int employeeId) => throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeAttendanceService : IAttendanceService
    {
        public IReadOnlyList<AttendanceDto> Records { get; set; } = [];
        public DateOnly? RequestedDate { get; private set; }
        public Task<IReadOnlyList<AttendanceDto>> GetAllAsync(DateOnly? date, int? employeeId, string? status)
        {
            RequestedDate = date;
            return Task.FromResult(Records);
        }
        public Task<AttendanceDto?> GetByIdAsync(int id) => Task.FromResult(Records.FirstOrDefault(r => r.Id == id));
        public Task<AttendanceSaveResult> CreateAsync(SaveAttendanceDto attendanceDto) => throw new NotSupportedException("Not used by chat tools.");
        public Task<AttendanceSaveResult> UpdateAsync(int id, SaveAttendanceDto attendanceDto) => throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeDashboardService : IDashboardService
    {
        public DashboardStatsDto Stats { get; set; } = new();
        public Task<DashboardStatsDto> GetStatsAsync() => Task.FromResult(Stats);
    }
}

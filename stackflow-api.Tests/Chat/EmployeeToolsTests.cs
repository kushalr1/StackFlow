using stackflow_api.DTOs;
using stackflow_api.Services;
using StackFlow.Application.Chat.Tools;

namespace stackflow_api.Tests.Chat;

public class EmployeeToolsTests
{
    private static ChatCallContext ContextFor(int employeeId) => new(AccountId: 1, EmployeeId: employeeId, Role: "Employee");

    [Fact]
    public async Task GetMyProfileTool_ReturnsOwnProfile_AndOmitsSalary()
    {
        var fake = new FakeEmployeeProfileService
        {
            Profile = new EmployeeProfileDto
            {
                Id = 7,
                Name = "Priya Sharma",
                Email = "priya@example.test",
                Phone = "+911234567890",
                Department = "Engineering",
                JobTitle = "Developer",
                Salary = 999999m,
                DateOfJoining = new DateOnly(2024, 1, 1),
                IsActive = true
            }
        };
        var tool = new GetMyProfileTool(fake);

        var result = await tool.ExecuteAsync(ContextFor(7), "{}");

        Assert.Equal(ChatRole.Employee, tool.AllowedRole);
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Contains("Priya Sharma", result);
        Assert.Contains("Engineering", result);
        Assert.DoesNotContain("999999", result);
        Assert.DoesNotContain("Salary", result, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetMyProfileTool_IgnoresEmployeeIdSuppliedInArguments_UsesContextOnly()
    {
        var fake = new FakeEmployeeProfileService
        {
            Profile = new EmployeeProfileDto { Id = 7, Name = "Priya Sharma" }
        };
        var tool = new GetMyProfileTool(fake);

        // A model-supplied "employeeId" in the arguments must never override the caller's own identity.
        await tool.ExecuteAsync(ContextFor(7), """{"employeeId": 999}""");

        Assert.Equal(7, fake.RequestedEmployeeId);
    }

    [Fact]
    public async Task GetMyLeaveSummaryTool_ReturnsOwnLeaveRequests()
    {
        var fake = new FakeEmployeeLeaveService
        {
            Leaves = [new EmployeeLeaveDto { Id = 1, LeaveType = "CasualLeave", Status = "Approved", TotalDays = 2 }]
        };
        var tool = new GetMyLeaveSummaryTool(fake);

        var result = await tool.ExecuteAsync(ContextFor(7), "{}");

        Assert.Equal(ChatRole.Employee, tool.AllowedRole);
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Contains("CasualLeave", result);
        Assert.Contains("Approved", result);
    }

    [Fact]
    public async Task GetMyProjectsTool_ReturnsOwnProjects()
    {
        var fake = new FakeEmployeeProjectService
        {
            Projects = [new EmployeeProjectDto { Id = 1, Name = "Website Revamp", Status = "Active", Role = "Member" }]
        };
        var tool = new GetMyProjectsTool(fake);

        var result = await tool.ExecuteAsync(ContextFor(7), "{}");

        Assert.Equal(ChatRole.Employee, tool.AllowedRole);
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Contains("Website Revamp", result);
    }

    [Fact]
    public async Task GetMyAttendanceSummaryTool_DefaultsToCurrentMonth_WhenNoArgumentsGiven()
    {
        var fake = new FakeEmployeeAttendanceService();
        var tool = new GetMyAttendanceSummaryTool(fake);

        await tool.ExecuteAsync(ContextFor(7), "{}");

        var today = DateTime.UtcNow;
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Equal(today.Year, fake.RequestedYear);
        Assert.Equal(today.Month, fake.RequestedMonth);
    }

    [Fact]
    public async Task GetMyAttendanceSummaryTool_HonorsYearAndMonthArguments()
    {
        var fake = new FakeEmployeeAttendanceService();
        var tool = new GetMyAttendanceSummaryTool(fake);

        await tool.ExecuteAsync(ContextFor(7), """{"year": 2026, "month": 3}""");

        Assert.Equal(2026, fake.RequestedYear);
        Assert.Equal(3, fake.RequestedMonth);
    }

    [Fact]
    public async Task GetMyTasksTool_ReturnsOwnTasks()
    {
        var fake = new FakePersonalTaskService
        {
            Tasks = [new PersonalTaskDto(1, "Finish report", "Daily", new DateOnly(2026, 10, 30), false)]
        };
        var tool = new GetMyTasksTool(fake);

        var result = await tool.ExecuteAsync(ContextFor(7), "{}");

        Assert.Equal(ChatRole.Employee, tool.AllowedRole);
        Assert.Equal(7, fake.RequestedOwner);
        Assert.Contains("Finish report", result);
    }

    [Fact]
    public async Task GetMyNotificationsTool_ReturnsOwnInbox()
    {
        var fake = new FakeEmployeeNotificationService
        {
            Inbox = new EmployeeNotificationInbox(1, [new EmployeeNotificationDto(1, 5, "You were assigned to Website Revamp", DateTime.UtcNow, null)])
        };
        var tool = new GetMyNotificationsTool(fake);

        var result = await tool.ExecuteAsync(ContextFor(7), "{}");

        Assert.Equal(ChatRole.Employee, tool.AllowedRole);
        Assert.Equal(7, fake.RequestedEmployeeId);
        Assert.Contains("Website Revamp", result);
    }

    private class FakeEmployeeProfileService : IEmployeeProfileService
    {
        public EmployeeProfileDto? Profile { get; set; }
        public int RequestedEmployeeId { get; private set; }
        public Task<EmployeeProfileDto?> GetAsync(int employeeId)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult(Profile);
        }
    }

    private class FakeEmployeeLeaveService : IEmployeeLeaveService
    {
        public IReadOnlyList<EmployeeLeaveDto> Leaves { get; set; } = [];
        public int RequestedEmployeeId { get; private set; }
        public Task<IReadOnlyList<EmployeeLeaveDto>> GetAllAsync(int employeeId)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult(Leaves);
        }
        public Task<EmployeeLeaveCreateResult> CreateAsync(int employeeId, CreateEmployeeLeaveDto dto) =>
            throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeEmployeeProjectService : IEmployeeProjectService
    {
        public IReadOnlyList<EmployeeProjectDto> Projects { get; set; } = [];
        public int RequestedEmployeeId { get; private set; }
        public Task<IReadOnlyList<EmployeeProjectDto>> GetAllAsync(int employeeId)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult(Projects);
        }
    }

    private class FakeEmployeeAttendanceService : IEmployeeAttendanceService
    {
        public IReadOnlyList<EmployeeAttendanceDto> Records { get; set; } = [];
        public int RequestedEmployeeId { get; private set; }
        public int RequestedYear { get; private set; }
        public int RequestedMonth { get; private set; }
        public Task<IReadOnlyList<EmployeeAttendanceDto>> GetMonthlyAsync(int employeeId, int year, int month)
        {
            RequestedEmployeeId = employeeId;
            RequestedYear = year;
            RequestedMonth = month;
            return Task.FromResult(Records);
        }
    }

    private class FakePersonalTaskService : IPersonalTaskService
    {
        public List<PersonalTaskDto> Tasks { get; set; } = [];
        public int RequestedOwner { get; private set; }
        public Task<List<PersonalTaskDto>> ListAsync(int owner)
        {
            RequestedOwner = owner;
            return Task.FromResult(Tasks);
        }
        public Task<PersonalTaskDto> CreateAsync(int owner, SavePersonalTask input) =>
            throw new NotSupportedException("Not used by chat tools.");
        public Task<bool> CompleteAsync(int owner, int id, bool completed) =>
            throw new NotSupportedException("Not used by chat tools.");
        public Task<bool> DeleteAsync(int owner, int id) =>
            throw new NotSupportedException("Not used by chat tools.");
    }

    private class FakeEmployeeNotificationService : IEmployeeNotificationService
    {
        public EmployeeNotificationInbox Inbox { get; set; } = new(0, []);
        public int RequestedEmployeeId { get; private set; }
        public Task<EmployeeNotificationInbox> GetInboxAsync(int employeeId)
        {
            RequestedEmployeeId = employeeId;
            return Task.FromResult(Inbox);
        }
        public Task<bool> MarkReadAsync(int employeeId, int id) =>
            throw new NotSupportedException("Not used by chat tools.");
    }
}

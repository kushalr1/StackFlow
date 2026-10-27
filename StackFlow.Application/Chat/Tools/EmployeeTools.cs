using System.Text.Json;
using stackflow_api.Services;

namespace StackFlow.Application.Chat.Tools;

public class GetMyProfileTool(IEmployeeProfileService profileService) : IChatTool
{
    public string Name => "get_my_profile";
    public string Description => "Returns the caller's own employee profile: name, contact details, department, job title, join date. Never includes salary.";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No employee profile is linked to this account.";
        }

        var profile = await profileService.GetAsync(employeeId);
        if (profile is null)
        {
            return "Profile not found.";
        }

        return JsonSerializer.Serialize(new
        {
            profile.Name,
            profile.Email,
            profile.Phone,
            profile.Department,
            profile.JobTitle,
            profile.DateOfJoining,
            profile.IsActive
        });
    }
}

public class GetMyLeaveSummaryTool(IEmployeeLeaveService leaveService) : IChatTool
{
    public string Name => "get_my_leave_summary";
    public string Description => "Returns the caller's own leave requests (type, dates, status).";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No leave history is linked to this account.";
        }

        var leaves = await leaveService.GetAllAsync(employeeId);
        return JsonSerializer.Serialize(leaves.Select(leave => new
        {
            leave.LeaveType,
            leave.StartDate,
            leave.EndDate,
            leave.TotalDays,
            leave.Status,
            leave.AppliedOn
        }));
    }
}

public class GetMyProjectsTool(IEmployeeProjectService projectService) : IChatTool
{
    public string Name => "get_my_projects";
    public string Description => "Returns the projects the caller is currently or was previously assigned to.";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No projects are linked to this account.";
        }

        var projects = await projectService.GetAllAsync(employeeId);
        return JsonSerializer.Serialize(projects.Select(project => new
        {
            project.Name,
            project.Status,
            project.Priority,
            project.Role,
            project.StartDate,
            project.DueDate,
            project.CompletedOn
        }));
    }
}

public class GetMyAttendanceSummaryTool(IEmployeeAttendanceService attendanceService) : IChatTool
{
    public string Name => "get_my_attendance_summary";
    public string Description => "Returns the caller's own daily attendance records for a given month. Defaults to the current month if year/month are not given.";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"year":{"type":"integer"},"month":{"type":"integer","minimum":1,"maximum":12}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No attendance history is linked to this account.";
        }

        var arguments = ChatToolArguments.Parse(argumentsJson);
        var today = DateTime.UtcNow;
        var year = arguments.GetInt("year") ?? today.Year;
        var month = arguments.GetInt("month") ?? today.Month;

        var records = await attendanceService.GetMonthlyAsync(employeeId, year, month);
        return JsonSerializer.Serialize(records.Select(record => new { record.Date, record.Status }));
    }
}

public class GetMyTasksTool(IPersonalTaskService taskService) : IChatTool
{
    public string Name => "get_my_tasks";
    public string Description => "Returns the caller's own personal to-do tasks.";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No personal tasks are linked to this account.";
        }

        var tasks = await taskService.ListAsync(employeeId);
        return JsonSerializer.Serialize(tasks);
    }
}

public class GetMyNotificationsTool(IEmployeeNotificationService notificationService) : IChatTool
{
    public string Name => "get_my_notifications";
    public string Description => "Returns the caller's own assignment notification inbox (unread count and recent items).";
    public ChatRole AllowedRole => ChatRole.Employee;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        if (context.EmployeeId is not int employeeId)
        {
            return "No notifications are linked to this account.";
        }

        var inbox = await notificationService.GetInboxAsync(employeeId);
        return JsonSerializer.Serialize(inbox);
    }
}

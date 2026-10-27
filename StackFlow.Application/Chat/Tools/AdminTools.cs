using System.Text.Json;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Application.Chat.Tools;

public class FindEmployeeTool(IEmployeeService employeeService) : IChatTool
{
    public string Name => "find_employee";
    public string Description => "Searches employees by name, email or job title (partial match). Returns matching employees; never includes salary.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{"search":{"type":"string"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var search = arguments.GetString("search");

        var employees = await employeeService.GetAllAsync(search, departmentId: null, isActive: null);
        return JsonSerializer.Serialize(employees.Select(employee => new
        {
            employee.Id,
            employee.Name,
            employee.Email,
            employee.Phone,
            employee.Department,
            employee.JobTitle,
            employee.DateOfJoining,
            employee.IsActive
        }));
    }
}

public class GetDepartmentSummaryTool(IDepartmentService departmentService) : IChatTool
{
    public string Name => "get_department_summary";
    public string Description => "Returns every department with its active and relieved employee counts.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var departments = await departmentService.GetAllAsync();
        return JsonSerializer.Serialize(departments.Select(department => new
        {
            department.Name,
            department.EmployeeCount,
            department.RelievedEmployeeCount
        }));
    }
}

public class GetLeaveRequestsTool(ILeaveRequestService leaveRequestService) : IChatTool
{
    public string Name => "get_leave_requests";
    public string Description => "Lists leave requests, optionally filtered by status (Pending/Approved/Rejected) and/or a specific employeeId.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"status":{"type":"string","enum":["Pending","Approved","Rejected"]},"employeeId":{"type":"integer"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var status = Enum.TryParse<LeaveStatus>(arguments.GetString("status"), ignoreCase: true, out var parsedStatus)
            ? parsedStatus
            : (LeaveStatus?)null;
        var employeeId = arguments.GetInt("employeeId");

        var requests = await leaveRequestService.GetAllAsync(employeeId, status, leaveType: null);
        return JsonSerializer.Serialize(requests.Select(request => new
        {
            request.EmployeeName,
            request.LeaveType,
            request.StartDate,
            request.EndDate,
            request.Status,
            request.AppliedOn
        }));
    }
}

public class GetProjectStatusTool(IProjectService projectService) : IChatTool
{
    public string Name => "get_project_status";
    public string Description => "Lists projects, optionally filtered by status (Planned/Active/Completed/OnHold), including delay information.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"status":{"type":"string","enum":["Planned","Active","Completed","OnHold"]}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var status = Enum.TryParse<ProjectStatus>(arguments.GetString("status"), ignoreCase: true, out var parsedStatus)
            ? parsedStatus
            : (ProjectStatus?)null;

        var projects = await projectService.GetAllAsync(status);
        return JsonSerializer.Serialize(projects.Select(project => new
        {
            project.Name,
            project.Status,
            project.Priority,
            project.IsDelayed,
            project.DelayDays,
            project.StartDate,
            project.DueDate
        }));
    }
}

public class GetAttendanceTodayTool(IAttendanceService attendanceService) : IChatTool
{
    public string Name => "get_attendance_today";
    public string Description => "Returns today's attendance status for every employee.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var records = await attendanceService.GetAllAsync(today, employeeId: null, status: null);
        return JsonSerializer.Serialize(records.Select(record => new { record.EmployeeName, record.Status }));
    }
}

public class GetDashboardStatsTool(IDashboardService dashboardService) : IChatTool
{
    public string Name => "get_dashboard_stats";
    public string Description => "Returns company-wide aggregate counts: employees, today's attendance, pending leave requests, departments, active projects.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var stats = await dashboardService.GetStatsAsync();
        return JsonSerializer.Serialize(stats);
    }
}

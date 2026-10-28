using System.Text.Json;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Tools;

public class FindEmployeeTool(IEmployeeService employeeService) : IChatTool
{
    private const int MaxResults = 10;

    public string Name => "find_employee";
    public string Description =>
        "Finds employees by name, email or job title (partial match). If nothing matches exactly, retries with fuzzy matching so typos like 'arnv' still find 'Arnav'. Returns the matches with their details; never includes salary.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{"search":{"type":"string"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var search = arguments.GetString("search");

        var employees = (await employeeService.GetAllAsync(search, departmentId: null, isActive: null)).ToList();
        var matchedBy = "exact";

        if (employees.Count == 0 && !string.IsNullOrWhiteSpace(search))
        {
            var everyone = await employeeService.GetAllAsync(search: null, departmentId: null, isActive: null);
            employees = FuzzyMatcher.Rank(search, everyone, employee => [employee.Name, EmailLocalPart(employee.Email)])
                .Select(match => match.Item)
                .Take(MaxResults)
                .ToList();
            matchedBy = "fuzzy";
        }

        return JsonSerializer.Serialize(new
        {
            matchedBy,
            count = employees.Count,
            employees = employees.Take(MaxResults).Select(employee => new
            {
                employee.Id,
                employee.Name,
                employee.Email,
                employee.Phone,
                employee.Department,
                employee.JobTitle,
                employee.DateOfJoining,
                Status = employee.IsActive ? "Active" : "Relieved"
            })
        });
    }

    private static string EmailLocalPart(string email) => email.Split('@')[0];
}

public class GetDepartmentMembersTool(IDepartmentService departmentService, IEmployeeService employeeService, ChatActionCollector actions) : IChatTool
{
    public string Name => "get_department_members";
    public string Description =>
        "Lists the active employees of one department (name, job title, email, phone, join date). The department name is matched fuzzily, so 'technical', 'tech team' and 'Technical' all work. Reports possible matches when the name is ambiguous.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson => """{"type":"object","properties":{"department":{"type":"string"}},"required":["department"]}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var query = arguments.GetString("department") ?? string.Empty;

        var departments = await departmentService.GetAllAsync();
        var ranked = FuzzyMatcher.Rank(query, departments, department => [department.Name]);

        if (ranked.Count == 0)
        {
            return JsonSerializer.Serialize(new
            {
                found = false,
                availableDepartments = departments.Select(department => department.Name)
            });
        }

        // Several departments scoring about the same means the name was ambiguous: let the model ask.
        var topScore = ranked[0].Score;
        var close = ranked.Where(match => match.Score >= topScore - 0.05).Select(match => match.Item).ToList();
        if (close.Count > 1)
        {
            return JsonSerializer.Serialize(new
            {
                found = false,
                ambiguous = close.Select(department => department.Name)
            });
        }

        var department = close[0];
        var members = await employeeService.GetAllAsync(search: null, departmentId: department.Id, isActive: true);
        if (members.Count > 0)
        {
            actions.AddList(ChatListBuilder.Build(
                $"Employees — {department.Name}",
                $"{members.Count} active",
                [new("name", "Name", "text"), new("jobTitle", "Job title", "text"), new("email", "Email", "text"),
                 new("phone", "Phone", "text"), new("dateOfJoining", "Joined", "date")],
                members.Select(member => new Dictionary<string, ChatCell>
                {
                    ["name"] = ChatListBuilder.Text(member.Name),
                    ["jobTitle"] = ChatListBuilder.Text(member.JobTitle),
                    ["email"] = ChatListBuilder.Text(member.Email),
                    ["phone"] = ChatListBuilder.Text(member.Phone),
                    ["dateOfJoining"] = ChatListBuilder.Date(member.DateOfJoining)
                }).ToList()));
        }
        return JsonSerializer.Serialize(new
        {
            found = true,
            department = department.Name,
            activeCount = members.Count,
            relievedCount = department.RelievedEmployeeCount,
            members = members.Select(member => new
            {
                member.Id,
                member.Name,
                member.JobTitle,
                member.Email,
                member.Phone,
                member.DateOfJoining
            })
        });
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
        return JsonSerializer.Serialize(new
        {
            departmentCount = departments.Count,
            departments = departments.Select(department => new
            {
                department.Name,
                department.EmployeeCount,
                department.RelievedEmployeeCount
            })
        });
    }
}

public class GetLeaveRequestsTool(ILeaveRequestService leaveRequestService, ChatActionCollector actions) : IChatTool
{
    private const int MaxResults = 100;

    public string Name => "get_leave_requests";
    public string Description =>
        "Lists leave requests of ALL statuses unless a status is given. Use fromDate and toDate (inclusive, YYYY-MM-DD) to get leave that overlaps a period; for a single day such as today, pass the same date for both.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"status":{"type":"string","enum":["Pending","Approved","Rejected"]},"employeeId":{"type":"integer"},"fromDate":{"type":"string","description":"YYYY-MM-DD"},"toDate":{"type":"string","description":"YYYY-MM-DD"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var status = arguments.GetEnum<LeaveStatus>("status");
        var employeeId = arguments.GetInt("employeeId");
        var fromDate = arguments.GetDate("fromDate");
        var toDate = arguments.GetDate("toDate") ?? fromDate;

        var requests = (await leaveRequestService.GetAllAsync(employeeId, status, leaveType: null)).AsEnumerable();
        if (fromDate is DateOnly from && toDate is DateOnly to)
        {
            requests = requests.Where(request => request.StartDate <= to && request.EndDate >= from);
        }

        var matches = requests.ToList();
        if (matches.Count > 0)
        {
            var period = fromDate is DateOnly start && toDate is DateOnly end
                ? (start == end ? ChatDate.Format(start) : $"{ChatDate.Format(start)} – {ChatDate.Format(end)}")
                : "all dates";
            actions.AddList(ChatListBuilder.Build(
                $"Leave requests — {period}",
                status is null ? "All statuses" : status.ToString(),
                [new("employee", "Employee", "text"), new("leaveType", "Type", "text"), new("startDate", "From", "date"),
                 new("endDate", "To", "date"), new("status", "Status", "status"), new("appliedOn", "Applied", "date")],
                matches.Select(request => new Dictionary<string, ChatCell>
                {
                    ["employee"] = ChatListBuilder.Text(request.EmployeeName),
                    ["leaveType"] = ChatListBuilder.Text(request.LeaveType),
                    ["startDate"] = ChatListBuilder.Date(request.StartDate),
                    ["endDate"] = ChatListBuilder.Date(request.EndDate),
                    ["status"] = ChatListBuilder.Status(request.Status),
                    ["appliedOn"] = ChatListBuilder.Date(DateOnly.FromDateTime(request.AppliedOn))
                }).ToList()));
        }

        return JsonSerializer.Serialize(new
        {
            totalCount = matches.Count,
            leaveRequests = matches.Take(MaxResults).Select(request => new
            {
                request.EmployeeName,
                request.LeaveType,
                request.StartDate,
                request.EndDate,
                request.Status,
                request.AppliedOn
            })
        });
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
        var status = arguments.GetEnum<ProjectStatus>("status");

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

public class GetAttendanceTool(IAttendanceService attendanceService, ChatActionCollector actions) : IChatTool
{
    private const int MaxResults = 200;

    public string Name => "get_attendance";
    public string Description =>
        "Returns attendance records. Defaults to today. Pass date for one day, or fromDate and toDate (inclusive, YYYY-MM-DD) for a period such as a month. Optionally filter by status (Present/Absent/Late/HalfDay/OnLeave) or employeeId.";
    public ChatRole AllowedRole => ChatRole.Admin;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"date":{"type":"string","description":"YYYY-MM-DD"},"fromDate":{"type":"string","description":"YYYY-MM-DD"},"toDate":{"type":"string","description":"YYYY-MM-DD"},"status":{"type":"string","enum":["Present","Absent","Late","HalfDay","OnLeave"]},"employeeId":{"type":"integer"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeId = arguments.GetInt("employeeId");
        var status = arguments.GetEnum<AttendanceStatus>("status")?.ToString();

        var date = arguments.GetDate("date");
        var fromDate = arguments.GetDate("fromDate") ?? date ?? ChatClock.Today();
        var toDate = arguments.GetDate("toDate") ?? date ?? fromDate;

        // The service filters a single date natively; a longer period is filtered here, which is fine for admin-panel sized data.
        var matches = fromDate == toDate
            ? (await attendanceService.GetAllAsync(fromDate, employeeId, status)).ToList()
            : (await attendanceService.GetAllAsync(null, employeeId, status))
                .Where(record => record.Date >= fromDate && record.Date <= toDate)
                .ToList();

        if (matches.Count > 0)
        {
            var period = fromDate == toDate ? ChatDate.Format(fromDate) : $"{ChatDate.Format(fromDate)} – {ChatDate.Format(toDate)}";
            actions.AddList(ChatListBuilder.Build(
                $"Attendance — {period}",
                status ?? "All statuses",
                [new("employee", "Employee", "text"), new("date", "Date", "date"), new("status", "Status", "status")],
                matches.OrderBy(record => record.Date).ThenBy(record => record.EmployeeName).Select(record => new Dictionary<string, ChatCell>
                {
                    ["employee"] = ChatListBuilder.Text(record.EmployeeName),
                    ["date"] = ChatListBuilder.Date(record.Date),
                    ["status"] = ChatListBuilder.Status(record.Status)
                }).ToList()));
        }

        return JsonSerializer.Serialize(new
        {
            totalCount = matches.Count,
            records = matches.Take(MaxResults).Select(record => new
            {
                record.EmployeeName,
                record.Date,
                record.Status
            })
        });
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

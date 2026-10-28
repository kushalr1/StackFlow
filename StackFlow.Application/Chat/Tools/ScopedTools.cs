using System.Text.Json;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat.Payroll;
using StackFlow.Application.Chat;
using StackFlow.Application.Chat.Projects;

using StackFlow.Application.Chat;

namespace StackFlow.Application.Chat.Tools;

// Tools available to both roles. Each resolves its employee through ChatLookup, so an employee caller
// only ever receives their own data, and an admin caller can read any employee.

public class CalculateMonthlyPayrollTool(ChatLookup lookup, ILeaveRequestService leaveService) : IChatTool
{
    public string Name => "calculate_monthly_payroll";
    public string Description =>
        "Calculates one employee's salary for a month after deducting approved unpaid leave, with the full breakdown. Use for questions like 'calculate October salary of X' or 'meri October salary'. All money is computed here: report the returned fields exactly and never recompute them. Needs month; year defaults to the current year.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"employee":{"type":"string"},"month":{"type":"integer","minimum":1,"maximum":12},"year":{"type":"integer"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeResult = await lookup.ResolveEmployeeAsync(context, arguments.GetString("employee"), id: null);
        if (employeeResult.Json is not null)
        {
            return employeeResult.Json;
        }

        var month = arguments.GetInt("month");
        if (month is not (>= 1 and <= 12))
        {
            return ChatJson.Serialize(new { missing = "month", message = "Which month?" });
        }

        var year = arguments.GetInt("year") ?? ChatClock.Today().Year;
        if (year is < PayrollCalculator.MinYear or > PayrollCalculator.MaxYear)
        {
            return ChatJson.Serialize(new { missing = "year", message = $"Year must be between {PayrollCalculator.MinYear} and {PayrollCalculator.MaxYear}." });
        }

        var employee = employeeResult.Match!;
        var monthStart = new DateOnly(year, month.Value, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        if (employee.DateOfJoining > monthEnd)
        {
            return ChatJson.Serialize(new { noData = true, message = $"{employee.Name} joined after {monthStart:MMMM yyyy}, so there is no salary for that month." });
        }

        if (employee.Salary <= 0)
        {
            return ChatJson.Serialize(new { noData = true, missing = "salary", message = "No monthly salary is set for this employee." });
        }

        var leaves = (await leaveService.GetAllAsync(employee.Id, status: null, leaveType: null))
            .Select(ToLeaveSpan)
            .OfType<LeaveSpan>()
            .ToList();
        var breakdown = PayrollCalculator.Calculate(employee.Salary, year, month.Value, leaves);

        return ChatJson.Serialize(new
        {
            employee = employee.Name,
            period = monthStart.ToString("MMMM yyyy"),
            monthlySalary = ChatMoney.Format(breakdown.MonthlySalary),
            daysInMonth = breakdown.DaysInMonth,
            perDaySalary = ChatMoney.Format(breakdown.PerDaySalary),
            paidLeaveDays = breakdown.PaidLeaveDays,
            sickLeaveDays = breakdown.SickLeaveDays,
            unpaidLeaveDays = breakdown.UnpaidLeaveDays,
            deduction = ChatMoney.Format(breakdown.Deduction),
            finalSalary = ChatMoney.Format(breakdown.FinalSalary),
            formula = $"Final salary = {ChatMoney.Format(breakdown.MonthlySalary)} − ({breakdown.UnpaidLeaveDays} unpaid days × {ChatMoney.Format(breakdown.PerDaySalary)}) = {ChatMoney.Format(breakdown.FinalSalary)}",
            rule = "Per-day salary = monthly salary ÷ days in the month. Only approved unpaid leave is deducted; paid, casual, other and sick leave are not. No leave quota is configured, so no leave beyond quota is deducted."
        });
    }

    private static LeaveSpan? ToLeaveSpan(LeaveRequestDto request)
    {
        return Enum.TryParse<LeaveType>(request.LeaveType, out var type) && Enum.TryParse<LeaveStatus>(request.Status, out var status)
            ? new LeaveSpan(type, status, request.StartDate, request.EndDate)
            : null;
    }
}

public class GetEmployeeTasksTool(ChatLookup lookup, IPersonalTaskService taskService, ChatActionCollector actions) : IChatTool
{
    public string Name => "get_employee_tasks";
    public string Description =>
        "Returns an employee's to-do tasks due on a date or in a range, optionally only pending or done ones. Defaults to today. Use for 'today's to-do', 'aaj mujhe kya kaam karna hai', or 'today's tasks of Arnav'.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"employee":{"type":"string"},"date":{"type":"string","description":"YYYY-MM-DD"},"fromDate":{"type":"string","description":"YYYY-MM-DD"},"toDate":{"type":"string","description":"YYYY-MM-DD"},"status":{"type":"string","enum":["pending","done","all"]}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeResult = await lookup.ResolveEmployeeAsync(context, arguments.GetString("employee"), id: null);
        if (employeeResult.Json is not null)
        {
            return employeeResult.Json;
        }

        var employee = employeeResult.Match!;
        var today = ChatClock.Today();
        var date = arguments.GetDate("date");
        var fromDate = date ?? arguments.GetDate("fromDate") ?? today;
        var toDate = date ?? arguments.GetDate("toDate") ?? fromDate;
        var status = arguments.GetString("status") ?? "all";
        if (fromDate > toDate)
        {
            return ChatJson.Serialize(new { error = "invalid_range", message = "The start date is after the end date. Ask again with a valid range." });
        }

        var periodLabel = fromDate == toDate
            ? (fromDate == today ? "today" : fromDate.ToString("yyyy-MM-dd"))
            : $"{fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd}";

        var tasks = (await taskService.ListAsync(employee.Id))
            .Where(task => task.DueDate >= fromDate && task.DueDate <= toDate)
            .Where(task => status switch
            {
                "pending" => !task.IsCompleted,
                "done" => task.IsCompleted,
                _ => true
            })
            .ToList();

        if (tasks.Count == 0)
        {
            var isSelf = context.EmployeeId == employee.Id;
            if (isSelf)
            {
                // The empty state gives the employee a working way to add the to-do.
                var addAction = ChatRoutes.Build(ChatLookup.RoleOf(context), ChatRoutes.Page.AddTodo);
                if (addAction is not null)
                {
                    actions.AddAction(addAction);
                }
            }

            return ChatJson.Serialize(new
            {
                employee = employee.Name,
                period = periodLabel,
                count = 0,
                tasks = Array.Empty<object>(),
                message = isSelf
                    ? $"You don't have any to-dos for {periodLabel}."
                    : $"{employee.Name} has no to-dos for {periodLabel}."
            });
        }

        actions.AddList(ChatListBuilder.Build(
            $"To-dos — {periodLabel}",
            $"{tasks.Count} item(s) for {employee.Name}",
            [new("title", "Task", "text"), new("dueDate", "Due", "date"), new("status", "Status", "status")],
            tasks.Select(task => new Dictionary<string, ChatCell>
            {
                ["title"] = ChatListBuilder.Text(task.Title),
                ["dueDate"] = ChatListBuilder.Date(task.DueDate),
                ["status"] = ChatListBuilder.Status(task.IsCompleted ? "Done" : "Pending")
            }).ToList()));

        return ChatJson.Serialize(new
        {
            employee = employee.Name,
            period = periodLabel,
            count = tasks.Count,
            pending = tasks.Count(task => !task.IsCompleted),
            done = tasks.Count(task => task.IsCompleted),
            tasks = tasks.Select(task => new
            {
                task.Title,
                dueDate = task.DueDate.ToString("yyyy-MM-dd"),
                status = task.IsCompleted ? "Done" : "Pending"
            })
        });
    }
}

public class GetLeaveSummaryTool(ChatLookup lookup, ILeaveRequestService leaveService, ChatActionCollector actions) : IChatTool
{
    public string Name => "get_leave_summary";
    public string Description =>
        "Summarises an employee's leave for a year: approved days per leave type, plus pending and rejected request counts. Use for 'total leaves till now', 'my leaves by type', or 'leave balance'. The company has no leave quota, so balance cannot be computed; say so when asked.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"employee":{"type":"string"},"year":{"type":"integer"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeResult = await lookup.ResolveEmployeeAsync(context, arguments.GetString("employee"), id: null);
        if (employeeResult.Json is not null)
        {
            return employeeResult.Json;
        }

        var employee = employeeResult.Match!;
        var year = arguments.GetInt("year") ?? ChatClock.Today().Year;
        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd = new DateOnly(year, 12, 31);

        var inYear = (await leaveService.GetAllAsync(employee.Id, status: null, leaveType: null))
            .Where(request => request.StartDate <= yearEnd && request.EndDate >= yearStart)
            .ToList();

        if (inYear.Count == 0)
        {
            return ChatJson.Serialize(new { employee = employee.Name, year, noData = true, message = $"{employee.Name} has no leave requests in {year}." });
        }

        var byType = inYear
            .GroupBy(request => request.LeaveType)
            .Select(group => new
            {
                type = group.Key,
                approvedDays = group.Where(request => request.Status == nameof(LeaveStatus.Approved))
                    .Sum(request => PayrollCalculator.OverlapDays(request.StartDate, request.EndDate, yearStart, yearEnd)),
                pendingRequests = group.Count(request => request.Status == nameof(LeaveStatus.Pending)),
                rejectedRequests = group.Count(request => request.Status == nameof(LeaveStatus.Rejected))
            })
            .OrderBy(item => item.type)
            .ToList();

        actions.AddList(ChatListBuilder.Build(
            $"Leave requests — {year}",
            $"{inYear.Count} request(s) for {employee.Name}",
            [new("type", "Type", "text"), new("startDate", "From", "date"), new("endDate", "To", "date"),
             new("days", "Days", "number"), new("status", "Status", "status"), new("reason", "Reason", "text")],
            inYear.OrderBy(request => request.StartDate).Select(request => new Dictionary<string, ChatCell>
            {
                ["type"] = ChatListBuilder.Text(request.LeaveType),
                ["startDate"] = ChatListBuilder.Date(request.StartDate),
                ["endDate"] = ChatListBuilder.Date(request.EndDate),
                ["days"] = ChatListBuilder.Number(request.EndDate.DayNumber - request.StartDate.DayNumber + 1),
                ["status"] = ChatListBuilder.Status(request.Status),
                ["reason"] = ChatListBuilder.Text(request.Reason)
            }).ToList()));

        return ChatJson.Serialize(new
        {
            employee = employee.Name,
            year,
            totalApprovedDays = byType.Sum(item => item.approvedDays),
            byType,
            note = "No leave quota is configured, so remaining balance is not available."
        });
    }
}

public class GetProjectsTool(ChatLookup lookup, IChatDataStore dataStore, ChatActionCollector actions) : IChatTool
{
    private const int MaxDescriptionLength = 300;

    public string Name => "get_projects";
    public string Description =>
        "Lists projects for a month: the count and the list (name, status, start date, completed date, description). view 'active' = projects the employee was assigned to that were active in the month (default); view 'completed' = projects completed in the month. Optional status filter (Planned, Active, Completed, OnHold); 'in progress' means status Active. Omit employee to get the whole company (admin only). Month is required; year defaults to the current year.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"employee":{"type":"string"},"month":{"type":"integer","minimum":1,"maximum":12},"year":{"type":"integer"},"view":{"type":"string","enum":["active","completed"]},"status":{"type":"string","enum":["Planned","Active","Completed","OnHold"]}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeName = arguments.GetString("employee");

        int? employeeId = null;
        string scope;
        if (context.Role == UserRoles.Admin && string.IsNullOrWhiteSpace(employeeName))
        {
            scope = "the whole company";
        }
        else
        {
            var employeeResult = await lookup.ResolveEmployeeAsync(context, employeeName, id: null);
            if (employeeResult.Json is not null)
            {
                return employeeResult.Json;
            }

            employeeId = employeeResult.Match!.Id;
            scope = employeeResult.Match.Name;
        }

        var month = arguments.GetInt("month");
        if (month is not (>= 1 and <= 12))
        {
            return ChatJson.Serialize(new { missing = "month", message = "Which month?" });
        }

        var year = arguments.GetInt("year") ?? ChatClock.Today().Year;
        var view = arguments.GetString("view") == "completed" ? ProjectMonthView.Completed : ProjectMonthView.Active;
        var status = arguments.GetEnum<stackflow_api.Models.ProjectStatus>("status");
        var period = new DateOnly(year, month.Value, 1).ToString("MMMM yyyy");

        var rows = await dataStore.ListProjectAssignmentsAsync(employeeId);
        var matches = ProjectMonthFilter.Filter(rows, year, month.Value, view, status);

        var projects = matches
            .GroupBy(row => row.ProjectId)
            .Select(group =>
            {
                var first = group.First();
                return new
                {
                    name = first.ProjectName,
                    status = first.ProjectStatus.ToString(),
                    startDate = first.StartDate.ToString("yyyy-MM-dd"),
                    completedOn = first.CompletedOn?.ToString("yyyy-MM-dd") ?? "Not completed",
                    description = Truncate(first.Description),
                    assignedTo = employeeId is null ? group.Select(row => row.EmployeeName).Distinct().ToList() : null
                };
            })
            .OrderBy(project => project.name)
            .ToList();

        if (matches.Count > 0)
        {
            var companyView = employeeId is null;
            var columns = new List<ChatListColumn>
            {
                new("name", "Project", "text"), new("status", "Status", "status"),
                new("startDate", "Start", "date"), new("completedOn", "Completed", "date"),
                new("description", "Description", "text")
            };
            if (companyView)
            {
                columns.Add(new("assignedTo", "Assigned to", "text"));
            }

            var projectRows = matches.GroupBy(row => row.ProjectId)
                .OrderBy(group => group.First().ProjectName)
                .Select(group =>
                {
                    var first = group.First();
                    var row = new Dictionary<string, ChatCell>
                    {
                        ["name"] = ChatListBuilder.Text(first.ProjectName),
                        ["status"] = ChatListBuilder.Status(first.ProjectStatus.ToString()),
                        ["startDate"] = ChatListBuilder.Date(first.StartDate),
                        ["completedOn"] = ChatListBuilder.Date(first.CompletedOn),
                        ["description"] = ChatListBuilder.Text(first.Description)
                    };
                    if (companyView)
                    {
                        row["assignedTo"] = ChatListBuilder.Text(string.Join(", ", group.Select(item => item.EmployeeName).Distinct()));
                    }
                    return row;
                })
                .ToList();
            actions.AddList(ChatListBuilder.Build($"Projects — {period}", scope, columns, projectRows));
        }

        return ChatJson.Serialize(new
        {
            scope,
            period,
            view = view == ProjectMonthView.Active ? "assigned / active during the month" : "completed during the month",
            statusFilter = status?.ToString() ?? "any",
            rule = view == ProjectMonthView.Active ? ProjectMonthFilter.ActiveRule : ProjectMonthFilter.CompletedRule,
            count = projects.Count,
            projects,
            message = projects.Count == 0 ? $"No matching projects for {scope} in {period}." : null
        });
    }

    private static string Truncate(string description) =>
        description.Length <= MaxDescriptionLength ? description : description[..MaxDescriptionLength] + "…";
}

public class GetAttendanceSummaryTool(ChatLookup lookup, IAttendanceService attendanceService, ChatActionCollector actions) : IChatTool
{
    public string Name => "get_attendance_summary";
    public string Description =>
        "Counts an employee's attendance by status (Present, Absent, Late, HalfDay, OnLeave) for a month. Defaults to the current month and year.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson =>
        """{"type":"object","properties":{"employee":{"type":"string"},"month":{"type":"integer","minimum":1,"maximum":12},"year":{"type":"integer"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeResult = await lookup.ResolveEmployeeAsync(context, arguments.GetString("employee"), id: null);
        if (employeeResult.Json is not null)
        {
            return employeeResult.Json;
        }

        var employee = employeeResult.Match!;
        var today = ChatClock.Today();
        var month = arguments.GetInt("month") ?? today.Month;
        var year = arguments.GetInt("year") ?? today.Year;
        var monthStart = new DateOnly(year, month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);
        var period = monthStart.ToString("MMMM yyyy");

        var records = (await attendanceService.GetAllAsync(date: null, employeeId: employee.Id, status: null))
            .Where(record => record.Date >= monthStart && record.Date <= monthEnd)
            .ToList();

        if (records.Count == 0)
        {
            return ChatJson.Serialize(new { employee = employee.Name, period, noData = true, message = $"No attendance is recorded for {employee.Name} in {period}." });
        }

        actions.AddList(ChatListBuilder.Build(
            $"Attendance — {period}",
            employee.Name,
            [new("date", "Date", "date"), new("status", "Status", "status")],
            records.OrderBy(record => record.Date).Select(record => new Dictionary<string, ChatCell>
            {
                ["date"] = ChatListBuilder.Date(record.Date),
                ["status"] = ChatListBuilder.Status(record.Status)
            }).ToList()));

        return ChatJson.Serialize(new
        {
            employee = employee.Name,
            period,
            recordedDays = records.Count,
            byStatus = records.GroupBy(record => record.Status).Select(group => new { status = group.Key, days = group.Count() }).OrderBy(item => item.status)
        });
    }
}

public class GetEmployeeProfileTool(ChatLookup lookup) : IChatTool
{
    public string Name => "get_employee_profile";
    public string Description =>
        "Returns one employee's profile: job title, department, email, phone, joining date, status and monthly salary. Use for questions about an employee's salary, department, joining date, or details. Employees can only ask for themselves.";
    public ChatRole AllowedRole => ChatRole.Any;
    public string ParameterSchemaJson => """{"type":"object","properties":{"employee":{"type":"string"}}}""";

    public async Task<string> ExecuteAsync(ChatCallContext context, string argumentsJson)
    {
        var arguments = ChatToolArguments.Parse(argumentsJson);
        var employeeResult = await lookup.ResolveEmployeeAsync(context, arguments.GetString("employee"), id: null);
        if (employeeResult.Json is not null)
        {
            return employeeResult.Json;
        }

        var employee = employeeResult.Match!;
        return ChatJson.Serialize(new
        {
            employee.Name,
            employee.JobTitle,
            employee.Department,
            employee.Email,
            employee.Phone,
            dateOfJoining = employee.DateOfJoining.ToString("yyyy-MM-dd"),
            status = employee.IsActive ? "Active" : "Relieved",
            monthlySalary = ChatMoney.Format(employee.Salary)
        });
    }
}

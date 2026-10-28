using stackflow_api.Services;

namespace StackFlow.Application.Chat;

/// <summary>
/// The only routes the chat may send a user to. The model names a page; this table decides the URL,
/// so a prompt-injected or hallucinated path can never reach the browser.
/// </summary>
public static class ChatRoutes
{
    public enum Page
    {
        Dashboard,
        Employees,
        EmployeeDetails,
        EmployeeEdit,
        Attendance,
        Leaves,
        Departments,
        Projects,
        MyProfile,
        MyLeaves,
        MyAttendance,
        MyProjects,
        MyTasks,
        AddTodo
    }

    /// <summary>Returns the action for the page, or null when the role may not open it.</summary>
    public static ChatAction? Build(ChatRole role, Page page, int? employeeId = null, string? employeeName = null)
    {
        var admin = role == ChatRole.Admin;
        var employee = role == ChatRole.Employee;

        return page switch
        {
            Page.Dashboard when admin => new ChatAction("Open Dashboard", "/dashboard"),
            Page.Employees when admin => new ChatAction("Open Employees", "/employees"),
            Page.EmployeeDetails when admin && employeeId is int id => new ChatAction($"Open {employeeName ?? "employee"}", $"/employees/{id}"),
            Page.EmployeeEdit when admin && employeeId is int id => new ChatAction($"Edit {employeeName ?? "employee"}", $"/employees/{id}/edit"),
            Page.EmployeeEdit when admin => new ChatAction("Go to Employees (open one, then Edit)", "/employees"),
            Page.Attendance when admin => new ChatAction("Open Attendance", "/attendance"),
            Page.Leaves when admin => new ChatAction("Open Leave Requests", "/leaves"),
            Page.Departments when admin => new ChatAction("Open Departments", "/departments"),
            Page.Projects when admin => new ChatAction("Open Projects", "/projects"),
            Page.MyProfile when employee => new ChatAction("View my profile", "/employee/profile"),
            Page.MyLeaves when employee => new ChatAction("View my leaves", "/employee/leaves"),
            Page.MyAttendance when employee => new ChatAction("View my attendance", "/employee/attendance"),
            Page.MyProjects when employee => new ChatAction("View my projects", "/employee/projects"),
            Page.MyTasks when employee => new ChatAction("Open my to-do list", "/employee/tasks"),
            Page.AddTodo when employee => new ChatAction("Add to-do", "/employee/tasks"),
            _ => null
        };
    }
}

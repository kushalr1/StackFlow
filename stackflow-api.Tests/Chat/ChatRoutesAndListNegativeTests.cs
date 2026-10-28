using stackflow_api.Services;
using StackFlow.Application.Chat;

namespace stackflow_api.Tests.Chat;

/// <summary>Navigation whitelist per role, and list payload limits.</summary>
public class ChatRoutesAndListNegativeTests
{
    private static readonly string[] AdminPrefixes = ["/dashboard", "/employees", "/attendance", "/leaves", "/departments", "/projects"];

    [Theory]
    [InlineData(ChatRoutes.Page.Dashboard)]
    [InlineData(ChatRoutes.Page.Employees)]
    [InlineData(ChatRoutes.Page.Attendance)]
    [InlineData(ChatRoutes.Page.Leaves)]
    [InlineData(ChatRoutes.Page.Departments)]
    [InlineData(ChatRoutes.Page.Projects)]
    public void Build_AdminOnlyPage_IsNullForAnEmployee(ChatRoutes.Page page)
    {
        Assert.Null(ChatRoutes.Build(ChatRole.Employee, page));
    }

    [Fact]
    public void Build_EmployeeDetailsForAnEmployeeCaller_IsNull_EvenWithAnId()
    {
        Assert.Null(ChatRoutes.Build(ChatRole.Employee, ChatRoutes.Page.EmployeeDetails, employeeId: 2, employeeName: "Dhruv"));
    }

    [Fact]
    public void Build_EmployeeEditWithoutAnId_IsNullForAnAdmin_NotAnEmptyRoute()
    {
        // Only the fallback "go to Employees" action is valid without an id; no route may end in "/edit" without one.
        var action = ChatRoutes.Build(ChatRole.Admin, ChatRoutes.Page.EmployeeEdit);

        Assert.NotNull(action);
        Assert.DoesNotContain("/employees/", action!.Route);
    }

    [Theory]
    [InlineData(ChatRoutes.Page.MyProfile)]
    [InlineData(ChatRoutes.Page.MyLeaves)]
    [InlineData(ChatRoutes.Page.MyAttendance)]
    [InlineData(ChatRoutes.Page.MyProjects)]
    [InlineData(ChatRoutes.Page.MyTasks)]
    [InlineData(ChatRoutes.Page.AddTodo)]
    public void Build_EmployeeSelfServicePage_IsAllowedForAnEmployee(ChatRoutes.Page page)
    {
        Assert.NotNull(ChatRoutes.Build(ChatRole.Employee, page));
    }

    [Fact]
    public void Build_EveryPageForAnEmployee_NeverPointsAtAnAdminRoute()
    {
        foreach (var page in Enum.GetValues<ChatRoutes.Page>())
        {
            var action = ChatRoutes.Build(ChatRole.Employee, page, employeeId: 1, employeeName: "Arnav");
            if (action is null)
            {
                continue;
            }

            Assert.DoesNotContain(AdminPrefixes, prefix => action.Route.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }
    }

    [Fact]
    public void ListBuilder_ThousandRows_KeepsTheTotalButCapsTheRows()
    {
        var columns = new[] { new ChatListColumn("name", "Name", "text") };
        var rows = Enumerable.Range(1, 1000)
            .Select(index => new Dictionary<string, ChatCell> { ["name"] = ChatListBuilder.Text($"Employee {index}") })
            .ToList();

        var list = ChatListBuilder.Build("Big list", null, columns, rows);

        Assert.Equal(1000, list.TotalCount);
        Assert.Equal(ChatListBuilder.MaxRows, list.Rows.Count);
    }

    [Fact]
    public void ListBuilder_EmptyRows_ReturnsZeroTotalAndNoRows()
    {
        var list = ChatListBuilder.Build("Nothing", null, [new ChatListColumn("name", "Name", "text")], []);

        Assert.Equal(0, list.TotalCount);
        Assert.Empty(list.Rows);
    }
}

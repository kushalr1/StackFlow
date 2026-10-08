using stackflow_api.DTOs;
using stackflow_api.Services;
using StackFlow.Infrastructure.Projects;

namespace stackflow_api.Tests;

public class ProjectArchitectureTests
{
    [Fact]
    public void ProjectAndNotificationContractsBelongToApplication()
    {
        foreach (var type in new[] { typeof(ProjectService), typeof(EmployeeProjectService), typeof(EmployeeNotificationService),
            typeof(IProjectService), typeof(IEmployeeProjectService), typeof(IEmployeeNotificationService),
            typeof(IProjectStore), typeof(IEmployeeNotificationStore), typeof(SaveProjectDto), typeof(CreateProjectDto),
            typeof(AssignEmployeeDto), typeof(ProjectDto), typeof(EmployeeProjectDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.Equal("StackFlow.Infrastructure", typeof(EfProjectStore).Assembly.GetName().Name);
        Assert.Equal("StackFlow.Infrastructure", typeof(EfEmployeeNotificationStore).Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(ProjectService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }
}

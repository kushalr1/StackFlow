using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Infrastructure.Accounts;

namespace stackflow_api.Tests;

public class ArchitectureBoundaryTests
{
    [Fact]
    public void CoreDependenciesPointInwardAcrossEveryFeature()
    {
        var domain = typeof(Employee).Assembly;
        var application = typeof(AuthService).Assembly;
        var infrastructure = typeof(EfAccountStore).Assembly;
        foreach (var assembly in new[] { domain, application })
            Assert.DoesNotContain(assembly.GetReferencedAssemblies(), reference =>
                reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") ||
                reference.Name.StartsWith("Npgsql") || reference.Name.StartsWith("Microsoft.AspNetCore") ||
                reference.Name.StartsWith("Microsoft.IdentityModel") || reference.Name.StartsWith("System.IdentityModel") ||
                reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
        Assert.DoesNotContain(domain.GetReferencedAssemblies(), reference => reference.Name == "StackFlow.Application");
        Assert.DoesNotContain(infrastructure.GetReferencedAssemblies(), reference => reference.Name == "stackflow-api");
        foreach (var service in new[] { typeof(EmployeeService), typeof(DepartmentService), typeof(AttendanceService),
            typeof(EmployeeAttendanceService), typeof(LeaveRequestService), typeof(EmployeeLeaveService),
            typeof(ProjectService), typeof(EmployeeProjectService), typeof(EmployeeNotificationService),
            typeof(PersonalTaskService), typeof(DashboardService), typeof(EmployeeProfileService),
            typeof(AuthService), typeof(EmployeeAccountService) })
            Assert.Same(application, service.Assembly);
    }

    [Fact]
    public void ControllersDependOnContractsNotPersistence()
    {
        var controllers = typeof(EmployeesController).Assembly.GetTypes()
            .Where(type => !type.IsAbstract && typeof(ControllerBase).IsAssignableFrom(type));
        foreach (var controller in controllers)
        foreach (var parameter in controller.GetConstructors().SelectMany(constructor => constructor.GetParameters()))
        {
            Assert.True(parameter.ParameterType.IsInterface, controller.Name + " must use a constructor interface.");
            Assert.Equal("StackFlow.Application", parameter.ParameterType.Assembly.GetName().Name);
        }
    }
}

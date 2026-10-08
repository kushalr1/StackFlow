using stackflow_api.DTOs;
using stackflow_api.Services;
using StackFlow.Infrastructure.Employees;

namespace stackflow_api.Tests;

public class EmployeeArchitectureTests
{
    [Fact]
    public void EmployeeContractsAndServiceBelongToApplication()
    {
        foreach (var type in new[] { typeof(EmployeeService), typeof(IEmployeeService), typeof(IEmployeeStore),
                     typeof(EmployeeDto), typeof(CreateEmployeeDto), typeof(UpdateEmployeeDto), typeof(RelieveEmployeeDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.Equal("StackFlow.Infrastructure", typeof(EfEmployeeStore).Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(EmployeeService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }
}

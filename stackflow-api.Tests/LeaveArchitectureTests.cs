using stackflow_api.DTOs;
using stackflow_api.Services;
using StackFlow.Infrastructure.Leaves;

namespace stackflow_api.Tests;

public class LeaveArchitectureTests
{
    [Fact]
    public void LeaveServicesAndContractsDoNotDependOnInfrastructure()
    {
        foreach (var type in new[] { typeof(LeaveRequestService), typeof(EmployeeLeaveService),
            typeof(ILeaveRequestService), typeof(IEmployeeLeaveService), typeof(ILeaveStore),
            typeof(SaveLeaveRequestDto), typeof(CreateEmployeeLeaveDto), typeof(LeaveRequestDto),
            typeof(EmployeeLeaveDto), typeof(UpdateLeaveStatusDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.Equal("StackFlow.Infrastructure", typeof(EfLeaveStore).Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(LeaveRequestService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }
}

using stackflow_api.DTOs;
using stackflow_api.Services;
using StackFlow.Infrastructure.Attendance;

namespace stackflow_api.Tests;

public class AttendanceArchitectureTests
{
    [Fact]
    public void AttendanceContractsAndServicesBelongToCore()
    {
        foreach (var type in new[] { typeof(AttendanceService), typeof(EmployeeAttendanceService),
                     typeof(IAttendanceService), typeof(IEmployeeAttendanceService), typeof(IAttendanceStore),
                     typeof(AttendanceDto), typeof(SaveAttendanceDto), typeof(EmployeeAttendanceDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.Equal("StackFlow.Infrastructure", typeof(EfAttendanceStore).Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(AttendanceService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }
}

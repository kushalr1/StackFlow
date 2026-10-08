using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class ReadModelArchitectureTests
{
    [Fact]
    public async Task ApplicationPreservesDateAndEmployeeScope()
    {
        var store = new FakeStore();
        var dashboard = await new DashboardService(store).GetStatsAsync();
        Assert.Equal(7, dashboard.TotalEmployees);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), store.Date);
        var profile = await new EmployeeProfileService(store).GetAsync(12);
        Assert.Equal(12, profile!.Id);
        Assert.Equal(12, store.EmployeeId);
        Assert.Null(await new EmployeeProfileService(store).GetAsync(-1));
    }

    [Fact]
    public void ReadModelContractsBelongToApplication()
    {
        foreach (var type in new[] { typeof(DashboardService), typeof(EmployeeProfileService),
            typeof(IDashboardService), typeof(IEmployeeProfileService), typeof(IDashboardStore),
            typeof(IEmployeeProfileStore), typeof(DashboardStatsDto), typeof(EmployeeProfileDto) })
            Assert.Equal("StackFlow.Application", type.Assembly.GetName().Name);
        Assert.DoesNotContain(typeof(DashboardService).Assembly.GetReferencedAssemblies(), reference =>
            reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
            reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }

    private sealed class FakeStore : IDashboardStore, IEmployeeProfileStore
    {
        public DateOnly Date { get; private set; }
        public int EmployeeId { get; private set; }
        public Task<DashboardStatsDto> GetStatsAsync(DateOnly today)
        {
            Date = today;
            return Task.FromResult(new DashboardStatsDto { TotalEmployees = 7 });
        }
        public Task<EmployeeProfileDto?> GetAsync(int employeeId)
        {
            EmployeeId = employeeId;
            return Task.FromResult<EmployeeProfileDto?>(employeeId < 0 ? null : new EmployeeProfileDto { Id = employeeId });
        }
    }
}

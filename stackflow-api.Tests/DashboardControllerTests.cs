using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class DashboardControllerTests
{
    [Fact]
    public async Task GetStats_ReturnsAggregatedStatistics()
    {
        var controller = new DashboardController(new FakeDashboardService());

        var result = await controller.GetStats();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var stats = Assert.IsType<DashboardStatsDto>(ok.Value);
        Assert.Equal(7, stats.TotalEmployees);
        Assert.Equal(2, stats.ActiveProjects);
    }

    private sealed class FakeDashboardService : IDashboardService
    {
        public Task<DashboardStatsDto> GetStatsAsync() => Task.FromResult(new DashboardStatsDto
        {
            TotalEmployees = 7,
            ActiveEmployees = 6,
            PresentToday = 5,
            AbsentToday = 1,
            PendingLeaveRequests = 3,
            TotalDepartments = 4,
            ActiveProjects = 2
        });
    }
}

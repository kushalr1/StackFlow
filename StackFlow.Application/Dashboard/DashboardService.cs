using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IDashboardStore
{
    Task<DashboardStatsDto> GetStatsAsync(DateOnly today);
}

public class DashboardService(IDashboardStore store) : IDashboardService
{
    public Task<DashboardStatsDto> GetStatsAsync() => store.GetStatsAsync(DateOnly.FromDateTime(DateTime.Today));
}

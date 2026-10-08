using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}

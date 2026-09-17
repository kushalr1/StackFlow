namespace stackflow_api.DTOs;

public class DashboardStatsDto
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int PresentToday { get; set; }
    public int AbsentToday { get; set; }
    public int PendingLeaveRequests { get; set; }
    public int TotalDepartments { get; set; }
    public int ActiveProjects { get; set; }
}

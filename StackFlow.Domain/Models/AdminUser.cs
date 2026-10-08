namespace stackflow_api.Models;

public class AdminUser
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = UserRoles.Admin;

    public bool IsActive { get; set; } = true;
    public int SessionVersion { get; set; }

    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }
}

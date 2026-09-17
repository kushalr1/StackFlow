namespace stackflow_api.Models;

public class AdminUser
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}

namespace stackflow_api.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public string Email { get; set; } = string.Empty;
}

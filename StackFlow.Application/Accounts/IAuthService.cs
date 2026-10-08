using stackflow_api.DTOs;

namespace stackflow_api.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
}

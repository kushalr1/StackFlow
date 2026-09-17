using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto loginRequest)
    {
        var response = await authService.LoginAsync(loginRequest);

        return response is null
            ? Unauthorized(new { message = "Invalid email or password." })
            : Ok(response);
    }
}

using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using stackflow_api.Controllers;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class AuthenticationTests
{
    [Fact]
    public async Task Login_WithCorrectCredentials_Returns200Ok()
    {
        var controller = new AuthController(new FakeAuthService(succeed: true));

        var result = await controller.Login(new LoginRequestDto
        {
            Email = "admin@stackflow.local",
            Password = "correct-password"
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<LoginResponseDto>(ok.Value);
        Assert.NotEmpty(response.Token);
    }

    [Theory]
    [InlineData("admin@stackflow.local", "wrong-password")]
    [InlineData("unknown@stackflow.local", "any-password")]
    public async Task Login_WithInvalidCredentials_Returns401Unauthorized(
        string email,
        string password)
    {
        var controller = new AuthController(new FakeAuthService(succeed: false));

        var result = await controller.Login(new LoginRequestDto
        {
            Email = email,
            Password = password
        });

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public void PasswordHasher_DoesNotStorePlainTextPassword()
    {
        var admin = new AdminUser { Email = "admin@stackflow.local" };
        var passwordHasher = new PasswordHasher<AdminUser>();
        const string password = "StackFlowDev!2026";

        var hash = passwordHasher.HashPassword(admin, password);
        var result = passwordHasher.VerifyHashedPassword(admin, hash, password);

        Assert.NotEqual(password, hash);
        Assert.Equal(PasswordVerificationResult.Success, result);
    }

    [Theory]
    [InlineData(typeof(EmployeesController))]
    [InlineData(typeof(DepartmentsController))]
    public void AdminController_RequiresAdminAuthorization(Type controllerType)
    {
        var attribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("Admin", attribute.Roles);
    }

    private sealed class FakeAuthService(bool succeed) : IAuthService
    {
        public Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
        {
            LoginResponseDto? response = succeed
                ? new LoginResponseDto
                {
                    Email = loginRequest.Email,
                    Token = "test-token",
                    ExpiresAt = DateTime.UtcNow.AddHours(1)
                }
                : null;

            return Task.FromResult(response);
        }
    }
}

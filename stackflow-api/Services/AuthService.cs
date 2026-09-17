using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using stackflow_api.Data;
using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class AuthService(
    AppDbContext dbContext,
    IPasswordHasher<AdminUser> passwordHasher,
    IConfiguration configuration) : IAuthService
{
    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var normalizedEmail = loginRequest.Email.Trim().ToLowerInvariant();
        var admin = await dbContext.AdminUsers
            .SingleOrDefaultAsync(user => user.Email == normalizedEmail);

        if (admin is null)
        {
            return null;
        }

        var verification = passwordHasher.VerifyHashedPassword(
            admin,
            admin.PasswordHash,
            loginRequest.Password);

        if (verification == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(
            configuration.GetValue<int>("Jwt:ExpiryMinutes"));
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT signing key was not configured.");
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, admin.Email),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            Email = admin.Email
        };
    }
}

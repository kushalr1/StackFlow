using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Security;

public class JwtTokenIssuer(IConfiguration configuration) : ITokenIssuer
{
    public LoginResponseDto Issue(AdminUser account)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(
            configuration.GetValue<int>("Jwt:ExpiryMinutes"));
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT signing key was not configured.");
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, account.Email),
            new Claim(ClaimTypes.Role, account.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(AccountSession.ClaimName, AccountSession.Stamp(account.PasswordHash, account.SessionVersion))
        };

        if (account.EmployeeId.HasValue)
        {
            claims = [.. claims, new Claim("employee_id", account.EmployeeId.Value.ToString())];
        }
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
            Email = account.Email,
            Role = account.Role,
            EmployeeId = account.EmployeeId
        };
    }
}

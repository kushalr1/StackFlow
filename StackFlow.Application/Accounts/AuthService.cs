using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class AuthService(IAccountStore store, IAccountPasswordHasher passwordHasher, ITokenIssuer tokenIssuer) : IAuthService
{
    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var account = await store.FindByEmailAsync(loginRequest.Email.Trim().ToLowerInvariant());
        if (account is null || !account.IsActive ||
            (account.Role == UserRoles.Employee && (account.Employee is null || !account.Employee.IsActive)))
            return null;
        if (!passwordHasher.Verify(account, loginRequest.Password)) return null;
        return tokenIssuer.Issue(account);
    }
}

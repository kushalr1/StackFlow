using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public interface IAccountStore
{
    Task<AdminUser?> FindByEmailAsync(string email);
    Task<AdminUser?> FindByIdAsync(int id);
    Task<AdminUser?> FindEmployeeAccountAsync(int employeeId, bool employeeRoleOnly);
    Task<Employee?> FindEmployeeAsync(int id);
    Task<bool> ExistsAsync(int employeeId, string email);
    Task<bool> TryAddAsync(AdminUser account);
    Task SaveAsync();
}
public interface IAccountPasswordHasher
{
    string Hash(AdminUser account, string password);
    bool Verify(AdminUser account, string password);
}
public interface ITokenIssuer
{
    LoginResponseDto Issue(AdminUser account);
}

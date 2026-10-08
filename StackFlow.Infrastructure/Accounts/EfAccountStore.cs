using Microsoft.EntityFrameworkCore;
using Npgsql;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.Accounts;

public class EfAccountStore(AppDbContext context) : IAccountStore
{
    public Task<AdminUser?> FindByEmailAsync(string email) => context.AdminUsers.Include(user => user.Employee).SingleOrDefaultAsync(user => user.Email == email);
    public Task<AdminUser?> FindByIdAsync(int id) => context.AdminUsers.AsNoTracking().Include(user => user.Employee).SingleOrDefaultAsync(user => user.Id == id);
    public Task<AdminUser?> FindEmployeeAccountAsync(int employeeId, bool employeeRoleOnly) =>
        context.AdminUsers.Include(user => user.Employee).SingleOrDefaultAsync(user => user.EmployeeId == employeeId && (!employeeRoleOnly || user.Role == UserRoles.Employee));
    public async Task<Employee?> FindEmployeeAsync(int id) => await context.Employees.FindAsync(id);
    public Task<bool> ExistsAsync(int employeeId, string email) => context.AdminUsers.AnyAsync(user => user.EmployeeId == employeeId || user.Email == email);
    public async Task<bool> TryAddAsync(AdminUser account)
    {
        context.AdminUsers.Add(account);
        try { await context.SaveChangesAsync(); return true; }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        { return false; }
    }
    public async Task SaveAsync() => await context.SaveChangesAsync();
}

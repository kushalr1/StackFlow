using stackflow_api.DTOs;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class EmployeeAccountService(IAccountStore store, IAccountPasswordHasher passwordHasher)
    : IEmployeeAccountService
{
    public async Task<EmployeeAccountDto?> GetAsync(int employeeId)
    {
        var account = await store.FindEmployeeAccountAsync(employeeId, employeeRoleOnly: false);
        return account is null ? null : new EmployeeAccountDto(account.Email, account.IsActive);
    }

    public async Task<EmployeeAccountResult> CreateAsync(int employeeId, string password)
    {
        var employee = await store.FindEmployeeAsync(employeeId);
        if (employee is null) return new(EmployeeAccountOutcome.NotFound);
        if (!employee.IsActive) return new(EmployeeAccountOutcome.Inactive);
        var email = employee.Email.Trim().ToLowerInvariant();
        if (await store.ExistsAsync(employeeId, email))
            return new(EmployeeAccountOutcome.AlreadyExists);

        var account = new AdminUser
        {
            Email = email, EmployeeId = employeeId, Role = UserRoles.Employee, IsActive = true
        };
        account.PasswordHash = passwordHasher.Hash(account, password);
        if (!await store.TryAddAsync(account)) return new(EmployeeAccountOutcome.AlreadyExists);
        return new(EmployeeAccountOutcome.Created, new EmployeeAccountDto(account.Email, account.IsActive));
    }

    public async Task<EmployeeAccountResult> ResetAsync(int employeeId, string password)
    {
        var account = await store.FindEmployeeAccountAsync(employeeId, employeeRoleOnly: true);
        if (account is null) return new(EmployeeAccountOutcome.NotFound);
        if (!account.IsActive || account.Employee is not { IsActive: true }) return new(EmployeeAccountOutcome.Inactive);
        account.PasswordHash = passwordHasher.Hash(account, password);
        await store.SaveAsync();
        return new(EmployeeAccountOutcome.Created, new EmployeeAccountDto(account.Email, account.IsActive));
    }

    public async Task<EmployeeAccountResult> SetAccessAsync(int employeeId, bool isActive)
    {
        var account = await store.FindEmployeeAccountAsync(employeeId, employeeRoleOnly: true);
        if (account is null) return new(EmployeeAccountOutcome.NotFound);
        if (isActive && account.Employee is not { IsActive: true }) return new(EmployeeAccountOutcome.Inactive);
        if (account.IsActive != isActive)
        {
            account.IsActive = isActive;
            account.SessionVersion++;
            await store.SaveAsync();
        }
        return new(EmployeeAccountOutcome.Created, new EmployeeAccountDto(account.Email, account.IsActive));
    }

}

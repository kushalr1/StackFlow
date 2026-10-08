using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using stackflow_api.Models;

namespace stackflow_api.Data;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        if (!environment.IsDevelopment())
        {
            return;
        }

        var email = configuration["AdminSeed:Email"]?.Trim().ToLowerInvariant();
        var password = configuration["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Development admin credentials were not found in User Secrets.");
        }

        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider
            .GetRequiredService<IPasswordHasher<AdminUser>>();

        var admin = await dbContext.AdminUsers.SingleOrDefaultAsync(
            existingAdmin => existingAdmin.Email == email);

        if (admin is null)
        {
            admin = new AdminUser
            {
                Email = email,
                Role = UserRoles.Admin,
                IsActive = true
            };
            admin.PasswordHash = passwordHasher.HashPassword(admin, password);
            dbContext.AdminUsers.Add(admin);
        }
        else if (passwordHasher.VerifyHashedPassword(
            admin,
            admin.PasswordHash,
            password) == PasswordVerificationResult.Failed)
        {
            admin.PasswordHash = passwordHasher.HashPassword(admin, password);
        }


        var employeeEmail = configuration["EmployeeSeed:Email"]?.Trim().ToLowerInvariant();
        var employeePassword = configuration["EmployeeSeed:Password"];

        if (!string.IsNullOrWhiteSpace(employeeEmail) &&
            !string.IsNullOrWhiteSpace(employeePassword))
        {
            var employee = await dbContext.Employees.SingleOrDefaultAsync(
                existingEmployee => existingEmployee.Email.ToLower() == employeeEmail);

            if (employee is null)
            {
                throw new InvalidOperationException(
                    $"Employee seed account could not find employee '{employeeEmail}'.");
            }

            var employeeAccount = await dbContext.AdminUsers.SingleOrDefaultAsync(
                account => account.Email == employeeEmail);

            if (employeeAccount is null)
            {
                employeeAccount = new AdminUser
                {
                    Email = employeeEmail,
                    Role = UserRoles.Employee,
                    EmployeeId = employee.Id,
                    IsActive = true
                };
                employeeAccount.PasswordHash = passwordHasher.HashPassword(
                    employeeAccount,
                    employeePassword);
                dbContext.AdminUsers.Add(employeeAccount);
            }
            else
            {
                employeeAccount.Role = UserRoles.Employee;
                employeeAccount.EmployeeId = employee.Id;

                if (passwordHasher.VerifyHashedPassword(
                    employeeAccount,
                    employeeAccount.PasswordHash,
                    employeePassword) == PasswordVerificationResult.Failed)
                {
                    employeeAccount.PasswordHash = passwordHasher.HashPassword(
                        employeeAccount,
                        employeePassword);
                }
            }
        }

        await dbContext.SaveChangesAsync();
    }
}

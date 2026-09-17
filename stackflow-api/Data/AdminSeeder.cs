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
            admin = new AdminUser { Email = email };
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

        await dbContext.SaveChangesAsync();
    }
}

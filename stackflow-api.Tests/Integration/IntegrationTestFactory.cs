using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using stackflow_api.Data;
using stackflow_api.Models;

namespace stackflow_api.Tests.Integration;

/// <summary>
/// Boots the real Program.cs pipeline (auth, middleware, controllers) against an isolated
/// EF Core InMemory database, so security/integration tests exercise genuine request handling
/// instead of fakes.
/// </summary>
public class IntegrationTestFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"integration-tests-{Guid.NewGuid()}";

    /// <summary>
    /// Set before the first call to <see cref="WebApplicationFactory{TEntryPoint}.CreateClient()"/>
    /// (or any access to <c>Server</c>) to override/replace services for a single test, e.g. to
    /// swap a real service for a fake that throws.
    /// </summary>
    public Action<IServiceCollection>? ExtraServices { get; set; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // WebApplicationFactory boots a top-level-statement Program.cs by invoking Main
        // directly; by the time ConfigureAppConfiguration would run, Program.cs has already
        // read builder.Configuration. UseSetting feeds values in early enough (as part of the
        // initial configuration WebApplication.CreateBuilder sees), which ConfigureAppConfiguration
        // does not for this hosting style.
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=localhost;Database=unused;Username=unused");
        builder.UseSetting("Jwt:Key", "integration-test-signing-key-at-least-32-bytes-long");
        builder.UseSetting("Jwt:Issuer", "stackflow-tests");
        builder.UseSetting("Jwt:Audience", "stackflow-tests");
        builder.UseSetting("Jwt:ExpiryMinutes", "60");

        builder.ConfigureServices(services =>
        {
            // Program.cs unconditionally registers Npgsql for AppDbContext. Simply removing the
            // DbContextOptions<AppDbContext> descriptor isn't enough — AddDbContext/UseNpgsql also
            // registers Npgsql's own services into this same collection, and adding
            // UseInMemoryDatabase on top of that trips EF's "two providers registered" guard. Give
            // the in-memory provider its own isolated internal service provider instead.
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));

            var inMemoryProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
                options.UseInternalServiceProvider(inMemoryProvider);
            });

            ExtraServices?.Invoke(services);
        });
    }

    public async Task<AdminUser> SeedAccountAsync(
        string email,
        string password,
        string role = UserRoles.Admin,
        int? employeeId = null)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AdminUser>>();

        var account = new AdminUser
        {
            Email = email,
            Role = role,
            IsActive = true,
            EmployeeId = employeeId
        };
        account.PasswordHash = hasher.HashPassword(account, password);

        db.AdminUsers.Add(account);
        await db.SaveChangesAsync();
        return account;
    }

    public async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        return payload.GetProperty("token").GetString()!;
    }
}

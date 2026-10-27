using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using stackflow_api.DTOs;
using stackflow_api.Services;

namespace stackflow_api.Tests.Integration;

public class GlobalExceptionHandlerTests
{
    private class ThrowingDashboardService : IDashboardService
    {
        public Task<DashboardStatsDto> GetStatsAsync() =>
            throw new InvalidOperationException("boom: simulated unexpected failure with a secret connection string inside");
    }

    [Fact]
    public async Task UnhandledException_ReturnsSafeJsonBody_NotAStackTrace()
    {
        using var factory = new IntegrationTestFactory
        {
            ExtraServices = services => services.AddScoped<IDashboardService, ThrowingDashboardService>()
        };

        await factory.SeedAccountAsync("admin@example.test", "a-valid-password-123");
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "admin@example.test", "a-valid-password-123");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/dashboard/stats");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("boom", body);
        Assert.DoesNotContain("InvalidOperationException", body);
        Assert.DoesNotContain("StackTrace", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("   at ", body);

        using var json = JsonDocument.Parse(body);
        Assert.True(json.RootElement.TryGetProperty("message", out _));
    }

    [Fact]
    public async Task UnhandledException_StillIncludesSecurityHeaders()
    {
        // UseExceptionHandler calls Response.Clear() before writing its fallback body, which
        // wipes any header set directly by middleware registered after it — this must survive
        // that, via Response.OnStarting in Program.cs.
        using var factory = new IntegrationTestFactory
        {
            ExtraServices = services => services.AddScoped<IDashboardService, ThrowingDashboardService>()
        };

        await factory.SeedAccountAsync("admin-headers@example.test", "a-valid-password-123");
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "admin-headers@example.test", "a-valid-password-123");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/dashboard/stats");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("X-Content-Type-Options", out var nosniff));
        Assert.Equal("nosniff", Assert.Single(nosniff!));
        Assert.True(response.Headers.TryGetValues("X-Frame-Options", out var frameOptions));
        Assert.Equal("DENY", Assert.Single(frameOptions!));
        Assert.True(response.Headers.TryGetValues("Referrer-Policy", out var referrerPolicy));
        Assert.Equal("no-referrer", Assert.Single(referrerPolicy!));
    }
}

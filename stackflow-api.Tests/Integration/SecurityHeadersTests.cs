using System.Net.Http.Json;

namespace stackflow_api.Tests.Integration;

public class SecurityHeadersTests
{
    [Fact]
    public async Task SuccessfulResponse_IncludesSecurityHeaders()
    {
        using var factory = new IntegrationTestFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = "nobody@example.test", password = "wrong-password" });

        AssertSecurityHeadersPresent(response);
    }

    [Fact]
    public async Task ErrorResponse_StillIncludesSecurityHeaders()
    {
        using var factory = new IntegrationTestFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/employees");

        AssertSecurityHeadersPresent(response);
    }

    private static void AssertSecurityHeadersPresent(HttpResponseMessage response)
    {
        Assert.True(response.Headers.TryGetValues("X-Content-Type-Options", out var nosniff));
        Assert.Equal("nosniff", Assert.Single(nosniff!));

        Assert.True(response.Headers.TryGetValues("X-Frame-Options", out var frameOptions));
        Assert.Equal("DENY", Assert.Single(frameOptions!));

        Assert.True(response.Headers.TryGetValues("Referrer-Policy", out var referrerPolicy));
        Assert.Equal("no-referrer", Assert.Single(referrerPolicy!));
    }
}

using System.Net;
using System.Net.Http.Json;

namespace stackflow_api.Tests.Integration;

public class LoginRateLimitTests
{
    [Fact]
    public async Task Login_IsRateLimited_AfterRepeatedAttemptsFromSameClient()
    {
        using var factory = new IntegrationTestFactory();
        var client = factory.CreateClient();
        var payload = new { email = "nobody@example.test", password = "wrong-password" };

        HttpResponseMessage? last = null;
        for (var attempt = 0; attempt < 6; attempt++)
        {
            last = await client.PostAsJsonAsync("/api/auth/login", payload);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, last!.StatusCode);
    }

    [Fact]
    public async Task Login_AllowsRequests_WithinTheLimit()
    {
        using var factory = new IntegrationTestFactory();
        var client = factory.CreateClient();
        var payload = new { email = "nobody-else@example.test", password = "wrong-password" };

        var response = await client.PostAsJsonAsync("/api/auth/login", payload);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

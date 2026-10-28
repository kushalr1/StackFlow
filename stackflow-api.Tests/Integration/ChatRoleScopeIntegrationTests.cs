using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Application.Chat;
using System.Text.Json;

namespace stackflow_api.Tests.Integration;

/// <summary>
/// Role scoping through the real auth pipeline. The model is scripted, so each test controls exactly
/// which tool the model asks for; the assertions check what the server returns and offers.
/// </summary>
public class ChatRoleScopeIntegrationTests
{
    private const string Password = "a-valid-password-123";

    [Fact]
    public async Task EmployeeToken_CannotReadAnotherEmployeesSalary_ThroughTheChatApi()
    {
        var model = new ScriptedChatModel
        {
            ToolName = "get_employee_profile",
            ArgumentsJson = """{"employee":"Dhruv"}"""
        };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "arnav@example.test", Password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsJsonAsync("/api/chat/messages", new { message = "What is Dhruv's salary?" });

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("refused", model.ToolResultJson);
        Assert.Contains(ChatLookup.RefusalMessage, model.ToolResultJson);
        Assert.DoesNotContain("monthlySalary", model.ToolResultJson);
        Assert.DoesNotContain("₹", model.ToolResultJson);
    }

    [Fact]
    public async Task EmployeeToken_CanReadOwnSalary_ThroughTheChatApi()
    {
        var model = new ScriptedChatModel
        {
            ToolName = "get_employee_profile",
            ArgumentsJson = """{"employee":"Arnav"}"""
        };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "arnav@example.test", Password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsJsonAsync("/api/chat/messages", new { message = "What is my salary?" });

        Assert.Contains("\"monthlySalary\":\"₹50,000.00\"", model.ToolResultJson);
    }

    [Fact]
    public async Task EmployeeList_ContainsOnlyTheCallersOwnRows()
    {
        var model = new ScriptedChatModel { ToolName = "get_projects", ArgumentsJson = """{"month":10,"year":2026}""" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await factory.LoginAsync(client, "arnav@example.test", Password));

        var body = await PostAndReadAsync(client, "list my October projects");

        var rows = ListRowNames(body);
        Assert.Equal(["Arnav Project"], rows);
        Assert.DoesNotContain("Dhruv Secret Project", body.GetRawText());
    }

    [Fact]
    public async Task EmployeeCannotReceiveAnotherEmployeesProjectList()
    {
        var model = new ScriptedChatModel { ToolName = "get_projects", ArgumentsJson = """{"employee":"Dhruv","month":10,"year":2026}""" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await factory.LoginAsync(client, "arnav@example.test", Password));

        var body = await PostAndReadAsync(client, "Dhruv's projects");

        Assert.Empty(body.GetProperty("lists").EnumerateArray());
        Assert.DoesNotContain("Dhruv Secret Project", body.GetRawText());
        Assert.Contains(ChatLookup.RefusalMessage, model.ToolResultJson);
    }

    [Fact]
    public async Task EmployeeCannotReceiveTheEmployeeDirectory()
    {
        var model = new ScriptedChatModel { ToolName = "list_employees", ArgumentsJson = "{}" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await factory.LoginAsync(client, "arnav@example.test", Password));

        var body = await PostAndReadAsync(client, "list of all employees");

        Assert.Empty(body.GetProperty("lists").EnumerateArray());
        Assert.DoesNotContain("Dhruv", body.GetRawText());
        Assert.Contains(ChatLookup.RefusalMessage, model.ToolResultJson);
    }

    [Fact]
    public async Task EmployeeCannotReceiveACompanySalaryList()
    {
        var model = new ScriptedChatModel { ToolName = "list_salaries", ArgumentsJson = "{}" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await factory.LoginAsync(client, "arnav@example.test", Password));

        var body = await PostAndReadAsync(client, "salary list of the company");

        Assert.Empty(body.GetProperty("lists").EnumerateArray());
        Assert.DoesNotContain("₹", body.GetRawText());
    }

    [Fact]
    public async Task AdminReceivesTheCompanySalaryList()
    {
        var model = new ScriptedChatModel { ToolName = "list_salaries", ArgumentsJson = "{}" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await factory.LoginAsync(client, "admin@example.test", Password));

        var body = await PostAndReadAsync(client, "salary list of the company");

        Assert.Equal(2, ListRowNames(body).Count);
        Assert.Contains("₹90,000.00", body.GetRawText());
    }

    private static async Task<JsonElement> PostAndReadAsync(HttpClient client, string message)
    {
        var response = await client.PostAsJsonAsync("/api/chat/messages", new { message });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    /// <summary>Values of the "name" column for the first list in the reply.</summary>
    private static List<string> ListRowNames(JsonElement body)
    {
        var list = body.GetProperty("lists").EnumerateArray().First();
        return list.GetProperty("rows").EnumerateArray()
            .Select(row => row.GetProperty("name").GetProperty("text").GetString()!)
            .ToList();
    }

    [Fact]
    public async Task EmployeeToken_IsNotOfferedAdminOnlyTools()
    {
        var model = new ScriptedChatModel { ToolName = "suggest_followups", ArgumentsJson = """{"options":["a"]}""" };
        using var factory = await CreateFactoryAsync(model);
        var client = factory.CreateClient();
        var token = await factory.LoginAsync(client, "arnav@example.test", Password);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsJsonAsync("/api/chat/messages", new { message = "what is my salary?" });

        Assert.DoesNotContain("get_salary_stats", model.OfferedToolNames);
        Assert.DoesNotContain("get_top_paid", model.OfferedToolNames);
        Assert.DoesNotContain("find_employee", model.OfferedToolNames);
        Assert.Contains("get_employee_profile", model.OfferedToolNames);
    }

    private static async Task<IntegrationTestFactory> CreateFactoryAsync(ScriptedChatModel model)
    {
        var factory = new IntegrationTestFactory
        {
            ExtraServices = services =>
            {
                services.AddSingleton(model);
                services.AddScoped<IChatModelClient>(provider => provider.GetRequiredService<ScriptedChatModel>());
            }
        };

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var department = new Department { Name = "Technical" };
        db.Departments.Add(department);
        var arnav = new Employee
        {
            Name = "Arnav", Email = "arnav@example.test", Phone = "+910000000001", Department = department,
            JobTitle = "Engineer", Salary = 50000m, DateOfJoining = new DateOnly(2025, 1, 1), IsActive = true
        };
        var dhruv = new Employee
        {
            Name = "Dhruv", Email = "dhruv@example.test", Phone = "+910000000002", Department = department,
            JobTitle = "Engineer", Salary = 90000m, DateOfJoining = new DateOnly(2025, 1, 1), IsActive = true
        };
        db.Employees.AddRange(arnav, dhruv);
        var arnavProject = new Project { Name = "Arnav Project", Description = "Arnav only", StartDate = new DateOnly(2026, 10, 1), Status = ProjectStatus.Active };
        var dhruvProject = new Project { Name = "Dhruv Secret Project", Description = "Dhruv only", StartDate = new DateOnly(2026, 10, 1), Status = ProjectStatus.Active };
        db.Projects.AddRange(arnavProject, dhruvProject);
        db.EmployeeProjects.AddRange(
            new EmployeeProject { Employee = arnav, Project = arnavProject },
            new EmployeeProject { Employee = dhruv, Project = dhruvProject });
        await db.SaveChangesAsync();

        await factory.SeedAccountAsync("arnav@example.test", Password, UserRoles.Employee, arnav.Id);
        await factory.SeedAccountAsync("admin@example.test", Password);
        return factory;
    }

    /// <summary>Asks for one scripted tool call, then answers in text. Records what the server offered and returned.</summary>
    public class ScriptedChatModel : IChatModelClient
    {
        public string ToolName { get; set; } = "";
        public string ArgumentsJson { get; set; } = "{}";
        public IReadOnlyList<string> OfferedToolNames { get; private set; } = [];
        public string ToolResultJson { get; private set; } = "";

        /// <summary>When set, the first model call throws this, simulating an unavailable LLM.</summary>
        public Exception? Throw { get; set; }
        /// <summary>When set, the follow-up call after a tool result throws this.</summary>
        public Exception? ThrowAfterFirstCall { get; set; }
        /// <summary>When true, the model returns neither text nor a tool call.</summary>
        public bool EmptyReply { get; set; }

        public Task<ChatModelResponse> SendAsync(
            IReadOnlyList<ChatMessageDto> history, IReadOnlyList<ToolDefinition> allowedTools,
            string systemInstruction, CancellationToken cancellationToken = default)
        {
            if (Throw is not null)
            {
                throw Throw;
            }

            OfferedToolNames = allowedTools.Select(tool => tool.Name).ToList();
            if (EmptyReply)
            {
                return Task.FromResult(new ChatModelResponse(null, null));
            }

            return Task.FromResult(new ChatModelResponse(null, new ToolCallRequest(ToolName, ArgumentsJson), "state"));
        }

        public Task<ChatModelResponse> ContinueWithToolResultAsync(
            ChatModelResponse previousResponse, string toolResultJson, CancellationToken cancellationToken = default)
        {
            if (ThrowAfterFirstCall is not null)
            {
                throw ThrowAfterFirstCall;
            }

            ToolResultJson = toolResultJson;
            return Task.FromResult(new ChatModelResponse("Done.", null));
        }
    }
}

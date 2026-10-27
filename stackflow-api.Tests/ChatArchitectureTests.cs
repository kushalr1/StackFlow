using stackflow_api.Models;

namespace stackflow_api.Tests;

public class ChatArchitectureTests
{
    [Fact]
    public void ChatEntities_LiveInDomain_AndDomainStaysFreeOfEfHttpAspNetCore()
    {
        Assert.Equal("StackFlow.Domain", typeof(ChatConversation).Assembly.GetName().Name);
        Assert.Equal("StackFlow.Domain", typeof(ChatMessage).Assembly.GetName().Name);
        Assert.Equal("StackFlow.Domain", typeof(ChatToolInvocation).Assembly.GetName().Name);

        var referencedAssemblyNames = typeof(ChatConversation).Assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToList();

        Assert.DoesNotContain(referencedAssemblyNames, name =>
            name!.StartsWith("Microsoft.EntityFrameworkCore") ||
            name.StartsWith("Npgsql") ||
            name.StartsWith("Microsoft.AspNetCore") ||
            name is "System.Net.Http" or "StackFlow.Infrastructure" or "stackflow-api");
    }
}

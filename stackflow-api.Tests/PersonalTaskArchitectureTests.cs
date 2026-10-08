using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class PersonalTaskArchitectureTests
{
    [Fact]
    public void CoreAssembliesDoNotDependOnWebOrDatabase()
    {
        Assert.Equal("StackFlow.Domain", typeof(PersonalTask).Assembly.GetName().Name);
        Assert.Equal("StackFlow.Application", typeof(PersonalTaskService).Assembly.GetName().Name);
        foreach (var assembly in new[] { typeof(PersonalTask).Assembly, typeof(PersonalTaskService).Assembly })
            Assert.DoesNotContain(assembly.GetReferencedAssemblies(), reference =>
                reference.Name!.StartsWith("Microsoft.EntityFrameworkCore") || reference.Name.StartsWith("Npgsql") ||
                reference.Name.StartsWith("Microsoft.AspNetCore") || reference.Name is "StackFlow.Infrastructure" or "stackflow-api");
    }

    [Fact]
    public async Task ApplicationPreservesTaskFlowWithoutDatabase()
    {
        var store = new FakeStore();
        var service = new PersonalTaskService(store);
        var created = await service.CreateAsync(7, new SavePersonalTask { Title = "  Work  ", DueDate = new DateOnly(2099, 1, 1) });
        Assert.Equal("Work", created.Title);
        Assert.False(created.IsCompleted);
        Assert.Equal(7, store.Items.Single().EmployeeId);
        Assert.True(await service.CompleteAsync(7, created.Id, true));
        Assert.True((await service.ListAsync(7)).Single().IsCompleted);
        Assert.True(await service.CompleteAsync(7, created.Id, false));
        Assert.False((await service.ListAsync(7)).Single().IsCompleted);
        Assert.True(await service.DeleteAsync(7, created.Id));
        Assert.Empty(await service.ListAsync(7));
        Assert.False(await service.DeleteAsync(7, created.Id));
    }

    [Fact]
    public async Task ApplicationRejectsForeignTaskEvenIfStoreReturnsIt()
    {
        var store = new FakeStore();
        store.Items.Add(new PersonalTask { Id = 1, EmployeeId = 8, Title = "Private" });
        var service = new PersonalTaskService(store);
        Assert.Empty(await service.ListAsync(7));
        Assert.False(await service.CompleteAsync(7, 1, true));
        Assert.False(await service.DeleteAsync(7, 1));
        Assert.False(store.Items.Single().IsCompleted);
        Assert.Equal(0, store.Saves);
    }

    private class FakeStore : IPersonalTaskStore
    {
        public List<PersonalTask> Items { get; } = [];
        public int Saves { get; private set; }
        public Task<List<PersonalTask>> ListAsync(int owner) => Task.FromResult(Items.ToList());
        public Task<PersonalTask?> FindAsync(int owner, int id) => Task.FromResult(Items.FirstOrDefault(task => task.Id == id));
        public Task AddAsync(PersonalTask task) { task.Id = Items.Count + 1; Items.Add(task); return Task.CompletedTask; }
        public Task SaveAsync() { Saves++; return Task.CompletedTask; }
        public Task DeleteAsync(PersonalTask task) { Items.Remove(task); return Task.CompletedTask; }
    }
}

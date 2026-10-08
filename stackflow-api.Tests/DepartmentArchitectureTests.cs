using stackflow_api.DTOs;
using stackflow_api.Models;
using stackflow_api.Services;

namespace stackflow_api.Tests;

public class DepartmentArchitectureTests
{
    [Fact]
    public async Task ApplicationPreservesTrimDuplicateMissingAndProtectedDelete()
    {
        Assert.Equal("StackFlow.Application", typeof(DepartmentService).Assembly.GetName().Name);
        var store = new FakeStore();
        var service = new DepartmentService(store);
        var created = await service.CreateAsync(new SaveDepartmentDto { Name = " Engineering ", Description = " Team " });
        Assert.Equal("Engineering", created!.Name);
        Assert.Equal("Team", created.Description);
        Assert.Null(await service.CreateAsync(new SaveDepartmentDto { Name = "engineering" }));
        Assert.Equal(1, store.Saves);
        Assert.Equal(DepartmentUpdateResult.NotFound, await service.UpdateAsync(99, new SaveDepartmentDto()));
        Assert.Equal(DepartmentDeleteResult.NotFound, await service.DeleteAsync(99));
        Assert.Equal(DepartmentUpdateResult.Updated, await service.UpdateAsync(created.Id, new SaveDepartmentDto { Name = " Engineering ", Description = " Updated " }));
        Assert.Equal("Updated", store.Items.Single().Description);
        await service.CreateAsync(new SaveDepartmentDto { Name = "Finance" });
        Assert.Equal(DepartmentUpdateResult.DuplicateName, await service.UpdateAsync(created.Id, new SaveDepartmentDto { Name = "finance" }));
        store.HasEmployees = true;
        var saves = store.Saves;
        Assert.Equal(DepartmentDeleteResult.HasEmployees, await service.DeleteAsync(created.Id));
        Assert.Equal(saves, store.Saves);
        store.HasEmployees = false;
        Assert.Equal(DepartmentDeleteResult.Deleted, await service.DeleteAsync(created.Id));
        Assert.Single(store.Items);
    }

    private sealed class FakeStore : IDepartmentStore
    {
        public List<Department> Items { get; } = [];
        public bool HasEmployees { get; set; }
        public int Saves { get; private set; }
        public Task<IReadOnlyList<DepartmentDto>> GetAllAsync() => Task.FromResult<IReadOnlyList<DepartmentDto>>([]);
        public Task<DepartmentDto?> GetByIdAsync(int id) => Task.FromResult<DepartmentDto?>(null);
        public Task<Department?> FindAsync(int id) => Task.FromResult(Items.Find(item => item.Id == id));
        public Task<bool> NameExistsAsync(string name, int? excludedId = null) => Task.FromResult(Items.Any(item => item.Id != excludedId && string.Equals(item.Name, name, StringComparison.OrdinalIgnoreCase)));
        public Task<bool> HasEmployeesAsync(int id) => Task.FromResult(HasEmployees);
        public Task AddAsync(Department department) { department.Id = Items.Count + 1; Items.Add(department); Saves++; return Task.CompletedTask; }
        public Task SaveAsync() { Saves++; return Task.CompletedTask; }
        public Task DeleteAsync(Department department) { Items.Remove(department); Saves++; return Task.CompletedTask; }
    }
}

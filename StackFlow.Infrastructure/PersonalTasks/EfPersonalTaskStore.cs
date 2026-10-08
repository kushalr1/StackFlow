using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;

namespace StackFlow.Infrastructure.PersonalTasks;

public class EfPersonalTaskStore(AppDbContext db) : IPersonalTaskStore
{
    public Task<List<PersonalTask>> ListAsync(int owner) => db.Set<PersonalTask>().AsNoTracking()
        .Where(task => task.EmployeeId == owner).OrderBy(task => task.IsCompleted).ThenBy(task => task.DueDate).ThenBy(task => task.Id).ToListAsync();
    public Task<PersonalTask?> FindAsync(int owner, int id) => db.Set<PersonalTask>()
        .SingleOrDefaultAsync(task => task.EmployeeId == owner && task.Id == id);
    public async Task AddAsync(PersonalTask task) { db.Add(task); await db.SaveChangesAsync(); }
    public async Task SaveAsync() { await db.SaveChangesAsync(); }
    public async Task DeleteAsync(PersonalTask task) { db.Remove(task); await db.SaveChangesAsync(); }
}

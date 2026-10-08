using System.ComponentModel.DataAnnotations;
using stackflow_api.Models;

namespace stackflow_api.Services;

public class SavePersonalTask : IValidatableObject
{
    [Required, StringLength(150)] public string Title { get; set; } = "";
    [Required, RegularExpression("^(Daily|Weekly)$")] public string Period { get; set; } = "Daily";
    public DateOnly DueDate { get; set; }
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (string.IsNullOrWhiteSpace(Title)) yield return new("Title is required.", [nameof(Title)]);
        if (DueDate.Year < 2000 || DueDate.Year > 2100) yield return new("Select a valid deadline (2000–2100).", [nameof(DueDate)]);
        else if (DueDate < DateOnly.FromDateTime(DateTime.Today)) yield return new("Deadline must be today or later.", [nameof(DueDate)]);
    }
}
public record PersonalTaskDto(int Id, string Title, string Period, DateOnly DueDate, bool IsCompleted);
public interface IPersonalTaskService
{
    Task<List<PersonalTaskDto>> ListAsync(int owner);
    Task<PersonalTaskDto> CreateAsync(int owner, SavePersonalTask input);
    Task<bool> CompleteAsync(int owner, int id, bool completed);
    Task<bool> DeleteAsync(int owner, int id);
}

public interface IPersonalTaskStore
{
    Task<List<PersonalTask>> ListAsync(int owner);
    Task<PersonalTask?> FindAsync(int owner, int id);
    Task AddAsync(PersonalTask task);
    Task SaveAsync();
    Task DeleteAsync(PersonalTask task);
}

public class PersonalTaskService(IPersonalTaskStore store) : IPersonalTaskService
{
    public async Task<List<PersonalTaskDto>> ListAsync(int owner) => (await store.ListAsync(owner))
        .Where(t => t.EmployeeId == owner).OrderBy(t => t.IsCompleted).ThenBy(t => t.DueDate).ThenBy(t => t.Id)
        .Select(t => new PersonalTaskDto(t.Id, t.Title, t.Period, t.DueDate, t.IsCompleted)).ToList();
    public async Task<PersonalTaskDto> CreateAsync(int owner, SavePersonalTask input)
    {
        var task = new PersonalTask { EmployeeId = owner, Title = input.Title.Trim(), Period = input.Period, DueDate = input.DueDate };
        await store.AddAsync(task);
        return new(task.Id, task.Title, task.Period, task.DueDate, false);
    }
    public async Task<bool> CompleteAsync(int owner, int id, bool completed)
    {
        var task = await store.FindAsync(owner, id);
        if (task is null || task.EmployeeId != owner) return false;
        task.IsCompleted = completed;
        await store.SaveAsync();
        return true;
    }
    public async Task<bool> DeleteAsync(int owner, int id)
    {
        var task = await store.FindAsync(owner, id);
        if (task is null || task.EmployeeId != owner) return false;
        await store.DeleteAsync(task);
        return true;
    }
}

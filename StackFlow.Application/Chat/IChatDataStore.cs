using StackFlow.Application.Chat.Projects;

namespace StackFlow.Application.Chat;

/// <summary>Read-only data the chat needs that no existing service exposes. Implementations must only read.</summary>
public interface IChatDataStore
{
    Task<IReadOnlyList<ProjectAssignmentRecord>> ListProjectAssignmentsAsync(int? employeeId);
}

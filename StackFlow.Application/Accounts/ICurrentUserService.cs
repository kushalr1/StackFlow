namespace stackflow_api.Services;

public interface ICurrentUserService
{
    int? EmployeeId { get; }

    /// <summary>
    /// The authenticated AdminUsers.Id of the caller (Admin or Employee alike — both roles share
    /// that table). Null only if the claim is missing/unparseable, which should not happen for an
    /// authenticated request given JWT validation already requires it.
    /// </summary>
    int? AccountId { get; }

    /// <summary>"Admin" or "Employee" (see UserRoles), or null if unauthenticated.</summary>
    string? Role { get; }
}

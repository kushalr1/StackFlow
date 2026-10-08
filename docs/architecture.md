# Incremental Clean Architecture

## Current stage: Clean Architecture core migration complete and verified

The backend has moved from a single layered API project to compiler-enforced Domain, Application, Infrastructure and API boundaries. All feature business services have migrated. API-hosted startup and EF tooling are documented compatibility exceptions, not Application dependencies.

- `StackFlow.Domain`: existing entities and enums. No EF Core, HTTP or project references.
- `StackFlow.Application`: all feature/account services, contracts, DTO validation and storage/security interfaces. References Domain only.
- `StackFlow.Infrastructure`: AppDbContext and all feature/account EF storage adapters. References Application and uses existing EF/PostgreSQL versions.
- `stackflow-api`: HTTP controllers, authentication middleware, security/identity adapters, composition root and compatible startup/design-time tooling.

Dependency direction: API references Application and Infrastructure; Infrastructure references Application; Application references Domain. Domain does not reference other project layers. Runtime calls through an Application-owned interface reach the Infrastructure implementation supplied by dependency injection.

Existing `stackflow_api` namespaces are retained deliberately to preserve type identities in the EF model and reduce migration risk. Namespace spelling does not determine assembly dependency direction. Existing migrations, snapshot and design-time factory remain in API temporarily; runtime and factory explicitly use the API migrations assembly.

## Personal To-do request flow

Employee authentication/role check runs in API. Controller reads the authenticated employee claim and calls IPersonalTaskService. Application orchestrates operations, trims new titles, orders results and checks task ownership. IPersonalTaskStore defines persistence operations. EfPersonalTaskStore applies owner-scoped queries and saves using AppDbContext. PostgreSQL tables and endpoint payloads are unchanged.

The existing ASP.NET request validation contract remains. This pilot does not introduce new domain invariants, a new date policy, generic repositories, MediatR or an additional transaction framework. Application contract validation currently uses DataAnnotations and the existing local-date rule.

## Deliberate compatibility exceptions

Existing migrations, snapshot, AppDbContextFactory and Development AdminSeeder stay in API. Their EF dependency is restricted to host startup/tooling. Keeping the migrations assembly and UserSecrets identity unchanged preserves existing dotnet run and dotnet ef workflows without moving historical migrations or resetting credentials. Clean Architecture's inward dependency rule applies to the core, not a prohibition on database wiring in the host.

CurrentUserService, AccountPasswordHasher and JwtTokenIssuer are API adapters implementing Application interfaces; they legitimately depend on HTTP/Identity/JWT. No feature controller accepts an EF context or concrete storage class.

Optional later work is frontend bundle optimization and bootstrap organization, not a required core migration step. Existing Development seeding behavior can synchronize configured passwords on restart, as before; this audit does not change that policy.

## Final verification — 2026-10-08

124 backend tests and 62 frontend tests pass. Production Angular build passes with existing bundle/CSS budget warnings. Assembly tests cover every migrated service, reject outward core dependencies and ensure controllers use Application interfaces. All 14 existing migrations list successfully; no pending model changes. Rollback-only PostgreSQL probe covers migrated feature flows and disposable-account security checks. Live anonymous protected routes return 401; PATCH CORS preflight returns 204 with PATCH allowed. Browser walkthrough and authenticated HTTP role-matrix testing were not performed in this final audit; do not interpret automated checks as exhaustive production certification.

## Authentication and accounts request flow

Application AuthService normalizes email, rejects disabled/relieved accounts and verifies passwords through IAccountPasswordHasher before calling ITokenIssuer. API Security adapters retain ASP.NET Identity hashing and JWT configuration/claims; these are outer-layer adapters, not core dependencies. Infrastructure EfAccountStore owns account queries, writes and PostgreSQL unique-conflict translation. Application EmployeeAccountService retains admin-controlled reset/access policy and session-version changes. AccountSession remains a core policy using the same hash/version stamp. JWT validation in API obtains account state through IAccountStore rather than querying EF directly. CurrentUserService stays in API as an HTTP adapter implementing an Application-owned interface.

## Dashboard and profile request flow

Application DashboardService supplies the existing local current date to IDashboardStore. EfDashboardStore retains all nine SQL count definitions and sequential queries. Application EmployeeProfileService forwards the authenticated identity to IEmployeeProfileStore. EfEmployeeProfileStore projects only the requested employee's existing profile fields. API controllers retain role and identity checks. This read-only slice adds no new business policy, aggregation semantics or UI changes.

## Projects and notifications request flow

Application ProjectService owns team eligibility, deduplication, assignment/removal outcomes, priority ordering, delay calculations, mapping and assignment notification creation. IProjectStore stages project, assignment and notification entities in one shared AppDbContext, and saves them together as before. EmployeeProjectService delegates identity-scoped assignment history to Infrastructure. EmployeeNotificationService owns idempotent read-state changes; its store scopes notification lookup and inbox queries by employee ID. Inbox ordering, 100-item limit and total unread count are unchanged. Existing project update behavior is preserved; completed/on-hold team locks are not a new blanket lock on every project update.

## Leaves request flow

EmployeeLeaveService in Application creates pending requests for the employee identity supplied by the authorized controller. Infrastructure applies scoped history queries and overlap/attendance checks through ILeaveStore. Admin LeaveRequestService owns approval date rules, active-employee decisions, attendance conflicts, approved overlap checks and the pending-only decision lock. Existing DTO validation, route authorization, reason trimming and display labels remain unchanged. Admin create/update service methods remain for compatibility; no admin submission route was added.

## Attendance request flow

Admin AttendanceController retains write authorization. Application AttendanceService owns inactive-employee, approved-leave and duplicate decisions; today's-only update and unchanged employee/date rules remain unchanged. EmployeeAttendanceController obtains the authenticated employee ID and calls the read-only Application service. Application builds month boundaries; EfAttendanceStore applies employee-scoped, half-open date queries. Storage retains SQL filters, ordering, tracking, duplicate/approved-leave checks and employee loading. No new employee write endpoint or new date policy is introduced.

## Employees request flow

EmployeesController retains its authorization and routes. Application owns employee DTOs, name validation, trimming, mapping, missing-record outcomes, relieve-date rules and history deletion protection. IEmployeeStore exposes focused persistence operations. EfEmployeeStore retains search using PostgreSQL ILike, department/history loading, tracked writes and bulk assignment removal. Existing namespaces, validation and endpoint payloads remain compatible. Account/session services remain legacy API services in this stage.

This slice preserves the existing separate bulk assignment update followed by SaveChanges during relief; it does not introduce new transaction semantics. Future transaction hardening must be scoped separately.

## Departments request flow

The existing authorized controller calls IDepartmentService. DepartmentService in Application owns trimming, duplicate-name decisions, missing-record outcomes and deletion protection. IDepartmentStore is the Application-owned persistence boundary. EfDepartmentStore in Infrastructure retains PostgreSQL ILike matching, tracked writes and SQL-projected active/relieved counts. Routes, DTO namespaces, validation messages and response shapes remain unchanged. Departments containing any employees, including relieved employees, cannot be deleted.

## Verification gates

Run backend tests, frontend tests when applicable, EF pending-model check and a rollback-only PostgreSQL probe. Preserve routes, response shapes, role/ownership checks, transaction behavior and user data. A structural move alone must not generate a schema migration. Existing `dotnet run` and `dotnet ef` commands from the API directory remain supported.

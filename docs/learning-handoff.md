# StackFlow Learning Handoff

## Editor recovery and publication checks — 2026-10-08

The unsaved VS Code leave-management buffer still contained the retired admin create/update flow. Its contents were saved outside the repository to `/private/tmp/stackflow-leave-unsaved-20261008.ts.bak` before reopening the current component. The saved component uses `GET /api/leaves` and `PATCH /api/leaves/{id}/status`; employees submit requests through their own authorized endpoint. No database changes were required.

Verification: all 124 backend tests and 62 frontend tests passed. The frontend production build passed using a temporary output directory; existing bundle/CSS budget warnings remain. Authentication tests use a test-only password rather than the local development credential. Unsaved changes in other editor tabs were not saved or discarded. Teacher files: `stackflow-frontend/src/app/components/leave-management/leave-management.ts`, `stackflow-frontend/src/app/services/leave-request.service.ts`, and `stackflow-api/Controllers/LeavesController.cs`. An editor buffer is an in-memory version; Git and build tools use saved files on disk.

## Final architecture audit — 2026-10-08

Purpose: Verify the completed backend core migration without adding features or changing user data. This section supersedes the historical “remaining migration” notes below.

Changed files: added stackflow-api.Tests/ArchitectureBoundaryTests.cs; updated docs/architecture.md and this handoff. No production behavior changed in this audit.

Architecture: Domain entities have no outward project dependency. Application contains all business services and storage/security contracts and references Domain only. Infrastructure implements EF persistence and never references API. Controllers accept Application interfaces. API retains JWT/Identity/HTTP adapters, composition-root wiring and existing EF startup/design-time tooling.

Compatibility choice: historical migrations/snapshot, AppDbContextFactory and Development AdminSeeder remain in API deliberately. This preserves migrations assembly, UserSecrets identity and existing commands. Those are host/tooling exceptions, not leaked core dependencies. No schema migration, data reset, credential reset or package update was performed.

API checks: GET /api/employee/profile and GET /api/departments without tokens return 401. OPTIONS /api/leaves/1/status from http://localhost:4200 requesting PATCH returns 204 with matching origin, allowed headers and PATCH. Existing service request flows are documented in each slice below.

Testing commands/results:
- dotnet test stackflow-api.Tests/stackflow-api.Tests.csproj --no-restore -p:NuGetAudit=false: 124/124 pass.
- Angular CLI test --watch=false with Node 24: 62/62 pass across 23 files.
- Angular CLI build: pass; initial bundle 547.56 kB exceeds 500 kB warning budget; employee-form, leave-management and project-management CSS have existing warning-budget overages.
- dotnet ef migrations list --no-build: all 14 migrations listed; no unapplied marker.
- dotnet ef migrations has-pending-model-changes --no-build: no model changes.
- PostgreSQL rollback probe: dashboard/profile fields, Department CRUD/counts, Employee relief/history, Attendance protection, Leave decisions/conflicts, personal tasks, assignments/notifications and disposable account reset/access checks pass. No test rows retained; identity sequences may advance.
- git diff --check: pass.

Limitations: no final manual browser walkthrough or authenticated HTTP role-matrix run. Production performance, deployment and exhaustive concurrency/security testing are outside this architecture audit. Existing seeder password synchronization and pre-existing transaction policies remain unchanged.

Technical terms: composition root wires implementations to interfaces; inward dependency means core cannot reference persistence/web adapters; architecture guard is an automated regression test for assembly/controller boundaries.

Teacher files to share first: docs/architecture.md; StackFlow.Domain/StackFlow.Domain.csproj; StackFlow.Application/StackFlow.Application.csproj; StackFlow.Infrastructure/StackFlow.Infrastructure.csproj; StackFlow.Application/Employees/EmployeeService.cs and IEmployeeStore.cs; StackFlow.Infrastructure/Employees/EfEmployeeStore.cs; stackflow-api/Controllers/EmployeesController.cs; stackflow-api/Program.cs; stackflow-api.Tests/ArchitectureBoundaryTests.cs. Account/security examples are listed in stage 8.

Core migration complete. No restart required for this audit because only tests/docs changed. Next useful step is a manual Admin/Employee walkthrough using fresh user-entered data.

## Clean Architecture stage 8: Authentication and accounts — 2026-10-08

Purpose: Separate account policy from persistence, password hashing and JWT generation without changing credentials or permissions.

Changed files: AuthService.cs, EmployeeAccountService.cs, AccountSession.cs, IAuthService.cs, IEmployeeAccountService.cs, ICurrentUserService.cs and login/account DTOs moved into Application/Accounts. Added IAccountStore, IAccountPasswordHasher and ITokenIssuer. Added Infrastructure/Accounts/EfAccountStore.cs and API Security/AccountPasswordHasher.cs, JwtTokenIssuer.cs. Program.cs registers adapters and loads session state through IAccountStore. Added AccountArchitectureTests.cs.

API examples: existing login endpoint accepts {"email":"employee@example.com","password":"example-only"} and returns the unchanged token/expiry/role/employeeId response. Existing admin-only employee account create/reset/access endpoints remain unchanged. No employee password-change endpoint was added.

Request flow: API validates login DTO; Application normalizes email and checks account/employee active state; Infrastructure loads account; API password adapter verifies the existing hash; API JWT adapter issues the same claims. Admin account use cases hash through the adapter and save through Infrastructure. Token-validation callback queries the store and applies AccountSession policy, retaining reset/access session invalidation.

Database changes: none. Existing credentials were not changed. Verification modified only a disposable probe account inside a rolled-back transaction; no test rows retained. Identity sequences may advance.

Testing: baseline 121 tests passed; final 122 tests pass, including existing authorization/session tests and new dependency guard. PostgreSQL probe verified disposable account creation, normalized email login, admin reset, old-password rejection, old-session stamp rejection, disabled login, idempotent disable and re-enabled login. Previous slice probes also pass. EF reports no pending model changes; git diff --check passed. Live HTTP/browser and real-user login were not retested in this slice.

Technical terms: adapter implements a core interface using a framework; session stamp binds authentication to current password hash/version; unique-conflict translation converts PostgreSQL errors into an existing application outcome. JWT settings remain in existing configuration; no secrets are copied into core.

Teacher files: StackFlow.Application/Accounts/AuthService.cs, EmployeeAccountService.cs, AccountSession.cs, IAccountStore.cs and interfaces/DTOs; StackFlow.Infrastructure/Accounts/EfAccountStore.cs; stackflow-api/Security/AccountPasswordHasher.cs and JwtTokenIssuer.cs; stackflow-api/Program.cs; stackflow-api.Tests/AccountArchitectureTests.cs.

Restart backend. Next: final infrastructure/dependency audit and full regression verification. Architecture migration is not yet declared complete.

## Clean Architecture stage 7: Dashboard and Profile — 2026-10-08

Purpose: Finish feature read-model boundaries while preserving dashboard counts and employee profile responses.

Changed files: IDashboardService.cs and DashboardStatsDto.cs moved into Application/Dashboard; IEmployeeProfileService.cs and EmployeeProfileDto.cs moved into Application/Profiles. Application DashboardService.cs owns current-date selection and IDashboardStore; EmployeeProfileService.cs defines IEmployeeProfileStore and forwards identity. Original SQL moved into Infrastructure/Dashboard/EfDashboardStore.cs and Profiles/EfEmployeeProfileStore.cs. Program.cs registers stores. Added ReadModelArchitectureTests.cs.

API examples: existing admin dashboard stats endpoint returns TotalEmployees, ActiveEmployees, RelievedEmployees, PresentToday, AbsentToday, OnLeaveToday, PendingLeaveRequests, TotalDepartments and ActiveProjects. GET /api/employee/profile returns only the authenticated employee's profile; there is no arbitrary employee ID query parameter.

Request flow: Controller authorization remains in API. Dashboard Application selects DateTime.Today and Infrastructure executes unchanged counts. Profile controller reads authenticated employee ID; Application forwards it to Infrastructure's ID-filtered projection. Missing profile still returns the existing 404 response; missing identity remains unauthorized.

Database changes: none. Verification queries for this slice are read-only; the combined regression runner uses a rollback transaction for previous feature probes and retains no test rows. Identity sequences may advance in those older probes.

Testing: baseline 119 backend tests passed; final 121/121 pass. New fake-store test verifies date and employee ID forwarding plus missing profile; dependency test checks Application ownership and forbidden database/web references. PostgreSQL compares all nine dashboard counts and all nine profile fields against direct queries, including missing identity. Prior feature probes also pass. EF reports no pending model changes; git diff --check passed. Frontend/browser unchanged and not retested.

Technical terms: read model is a response projection tailored to a screen; SQL projection selects required fields; identity scope restricts profile to the caller; storage interface keeps EF outside Application.

Teacher files: StackFlow.Application/Dashboard/DashboardService.cs, IDashboardService.cs, DashboardStatsDto.cs; StackFlow.Application/Profiles/EmployeeProfileService.cs, IEmployeeProfileService.cs, EmployeeProfileDto.cs; StackFlow.Infrastructure/Dashboard/EfDashboardStore.cs; StackFlow.Infrastructure/Profiles/EfEmployeeProfileStore.cs; stackflow-api/Controllers/DashboardController.cs and EmployeeProfileController.cs; stackflow-api/Program.cs; stackflow-api.Tests/ReadModelArchitectureTests.cs.

Restart backend. Next: Authentication/accounts slice. Full migration and final infrastructure cleanup remain incomplete.

## Clean Architecture stage 6: Projects and notifications — 2026-10-08

Purpose: Separate project orchestration and notification read-state decisions from EF persistence without changing assignment/history behavior.

Changed files: ProjectService.cs, EmployeeProjectService.cs, EmployeeNotificationService.cs (including its DTOs/interface), IProjectService.cs, IEmployeeProjectService.cs and five project DTO files moved into StackFlow.Application/Projects. Added IProjectStore and IEmployeeNotificationStore; Infrastructure/Projects/EfProjectStore.cs and EfEmployeeNotificationStore.cs; tests/ProjectArchitectureTests.cs. Program.cs registers stores. Existing ProjectsControllerTests uses the new storage constructor.

API examples: existing POST /api/projects payload includes name, startDate, status, priority and employeeIds; existing project assignment/removal routes remain unchanged. Employee projects and notification routes retain employee-only authorization and authenticated identity. Read-state update remains idempotent and rejects another employee's notification. Controllers and frontend are unchanged.

Request flow: Admin controller calls ProjectService; Application makes eligibility/history decisions and stages notification entities through IProjectStore; EfProjectStore saves projects, assignments and notifications in the same context/SaveChanges transaction. Employee project history uses an employee-scoped SQL projection. Notification Application service uses a scoped store lookup and saves ReadAt only when previously unread.

Database changes: none. EF reports no pending model changes. Rollback-only PostgreSQL probes leave no test rows; identity sequences may advance.

Testing: baseline 118 tests passed; final 119/119 passed. Assembly/dependency guard added. PostgreSQL verifies deduplicated initial team creation, assignment persistence, invalid employee rejection, duplicate assignment without extra alert, foreign notification read denial, persisted/idempotent read state, removal/reassignment notification, employee project scope, history deletion protection and on-hold/completed team locks. Previous migrated slice probes also pass. git diff --check passed. Live HTTP/browser UI not retested in this backend-only slice.

Technical terms: unit of work is the shared context that saves related changes together; staged entities are added before SaveChanges; scoped query restricts employee access; idempotent operation can repeat without an extra state change.

Teacher files: StackFlow.Application/Projects/ProjectService.cs, EmployeeProjectService.cs, EmployeeNotificationService.cs, IProjectService.cs, IEmployeeProjectService.cs, IProjectStore.cs and five DTOs; StackFlow.Infrastructure/Projects/EfProjectStore.cs and EfEmployeeNotificationStore.cs; stackflow-api/Program.cs; stackflow-api.Tests/ProjectArchitectureTests.cs and ProjectsControllerTests.cs.

Remaining: Dashboard/Profile read models, AuthService, EmployeeAccountService and final infrastructure/dependency cleanup. Full migration is not yet complete. Restart backend after this slice.

## Clean Architecture stage 5: Leaves — 2026-10-08

Purpose: Move employee submission and admin decision logic into Application while keeping EF operations in Infrastructure.

Changed files: LeaveRequestService.cs, EmployeeLeaveService.cs, ILeaveRequestService.cs, IEmployeeLeaveService.cs and five DTOs (SaveLeaveRequestDto, CreateEmployeeLeaveDto, LeaveRequestDto, EmployeeLeaveDto, UpdateLeaveStatusDto) moved into StackFlow.Application/Leaves. Added ILeaveStore.cs, StackFlow.Infrastructure/Leaves/EfLeaveStore.cs and stackflow-api.Tests/LeaveArchitectureTests.cs. Program.cs registers the store. Controllers, routes and frontend remain unchanged.

API examples: employee submits through the existing EmployeeLeavesController POST with {"leaveType":"SickLeave","startDate":"2026-10-20","endDate":"2026-10-22","reason":"Medical appointment"}. Admin GET /api/leaves?status=Pending lists requests; PATCH /api/leaves/{id}/status with {"status":"Approved"} or {"status":"Rejected"} makes a decision. The controller still rejects Pending as a decision. No admin request-creation route was introduced.

Request flow: Employee controller obtains employee identity; Application checks active status, overlaps and attendance, then creates Pending request; ILeaveStore persists through EfLeaveStore. Admin controller checks role, Application checks existing approval rules, then saves the decision. Employee history remains identity-scoped and ordered newest application first.

Database changes: none. Schema and migrations unchanged. PostgreSQL verification uses a rollback-only transaction; test rows are not retained, although identity sequences may advance.

Testing: baseline 117 backend tests passed before edits; 118/118 passed afterward. Added assembly/dependency test. PostgreSQL probe checks submission, trimmed reason/inclusive day count, ownership, pending overlap rejection, rejection followed by resubmission, approval persistence, final-decision locking, approved overlap rejection and attendance conflicts for submission/approval. Previous slice probes also run. EF reports no pending model changes; git diff --check passed. No browser UI or live HTTP retest in this backend-only slice.

Technical terms: overlap uses inclusive start/end comparisons; Pending is undecided; final-decision lock prevents changing approved/rejected requests; storage boundary separates business outcomes from EF queries. Existing DTO date rules still allow today through one year ahead.

Teacher files: StackFlow.Application/Leaves/LeaveRequestService.cs, EmployeeLeaveService.cs, ILeaveRequestService.cs, IEmployeeLeaveService.cs, ILeaveStore.cs and five DTOs; StackFlow.Infrastructure/Leaves/EfLeaveStore.cs; stackflow-api/Controllers/LeavesController.cs and EmployeeLeavesController.cs; stackflow-api/Program.cs; stackflow-api.Tests/LeaveArchitectureTests.cs.

Restart backend after this slice. Next: Projects/notifications. Overall migration remains incomplete.

## Clean Architecture stage 4: Attendance — 2026-10-08

Purpose: Separate admin attendance business decisions and employee read-only history from EF persistence while preserving behavior.

Changed files: AttendanceService.cs, EmployeeAttendanceService.cs, IAttendanceService.cs, IEmployeeAttendanceService.cs, AttendanceDto.cs, SaveAttendanceDto.cs and EmployeeAttendanceDto.cs moved into StackFlow.Application/Attendance. Added IAttendanceStore.cs, StackFlow.Infrastructure/Attendance/EfAttendanceStore.cs and stackflow-api.Tests/AttendanceArchitectureTests.cs. Program.cs registers the store. Controllers and frontend are unchanged.

API examples: GET /api/attendance?employeeId=1; POST /api/attendance with {"employeeId":1,"date":"2026-10-08","status":"Present"}; PUT /api/attendance/{id} changes only today's status with the existing employee/date. Employee monthly history remains the existing read-only EmployeeAttendanceController endpoint using the authenticated employee identity, not an arbitrary employee selection.

Request flow: Admin controller checks role and forwards DTOs to Application; AttendanceService selects existing business outcomes; IAttendanceStore delegates storage operations to EfAttendanceStore. Employee controller obtains identity, Application creates month boundaries and Infrastructure filters employee ID and date range. Existing status labels and descending history order remain unchanged.

Database changes: none. Existing schema and migrations retained. Rollback-only PostgreSQL probe leaves no test rows; identity sequences may advance.

Testing: baseline 116 backend tests passed before edits. After edits, 117/117 tests passed including core assembly/dependency checks. PostgreSQL probe verified creation, duplicate rejection, current-day update persistence, identity-change rejection, historical read-only rejection, monthly scoping and history order; previous feature probes also ran. EF reports no pending model changes. Frontend and live browser were not retested because no UI changed. Restart backend to load the new registration.

Technical terms: half-open monthly range includes the month's first date but excludes next month's first date; persistence boundary is Application's storage interface; ownership scope restricts queries to the authenticated employee; tracked entity supports status updates.

Teacher files: StackFlow.Application/Attendance/AttendanceService.cs, EmployeeAttendanceService.cs, IAttendanceService.cs, IEmployeeAttendanceService.cs, IAttendanceStore.cs and three DTOs; StackFlow.Infrastructure/Attendance/EfAttendanceStore.cs; stackflow-api/Controllers/AttendanceController.cs and EmployeeAttendanceController.cs; stackflow-api/Program.cs; stackflow-api.Tests/AttendanceArchitectureTests.cs.

Next slice: Leaves. Full architecture migration remains incomplete.

## Clean Architecture stage 3: Employees — 2026-10-08

Purpose: Move employee business orchestration into Application and database access into Infrastructure without changing admin workflows.

Changed files: EmployeeService.cs, IEmployeeService.cs, EmployeeDto.cs (including project history), CreateEmployeeDto.cs, UpdateEmployeeDto.cs and RelieveEmployeeDto.cs moved into StackFlow.Application/Employees. EmployeeNameAttribute.cs moved into Application/Validation because DTO validation depends on it. Added IEmployeeStore.cs, Infrastructure/Employees/EfEmployeeStore.cs and EmployeeArchitectureTests.cs. Program.cs registers the store. Existing namespaces and validation messages remain unchanged.

API examples: GET /api/employees?search=Developer&isActive=true; POST /api/employees accepts {"name":"Example Employee","email":"example@example.com","phone":"+919876543210","departmentId":1,"jobTitle":"Developer","salary":1000,"dateOfJoining":"2026-10-08"}; PUT /api/employees/{id} retains the same update contract. Existing relieve and delete endpoints retain their routes and outcomes.

Request flow: Angular sends the same payload; authorized EmployeesController calls IEmployeeService; Application validates business outcomes, trims fields and maps results; IEmployeeStore delegates queries/writes to EfEmployeeStore; AppDbContext accesses PostgreSQL. Account disable/login behavior remains in the existing account/session services, which were not modified.

Database changes: none. No migration generated. PostgreSQL probes ran inside an explicit transaction and rolled back. No test rows remain; identity sequences may advance.

Testing: baseline 115 backend tests passed before edits. Added assembly/dependency regression test. PostgreSQL probe verified creation, persistence, filtered search, updates, future/before-joining relief rejection, valid relief, repeated relief rejection, deletion and attendance-history protection. Existing Department/task/project/notification rollback checks also passed. EF reports no pending model changes. Frontend unchanged; browser UI and live login were not retested in this slice. Restart the backend after this change.

Technical terms: storage interface is the Application-owned persistence contract; dependency injection supplies EfEmployeeStore; ILike is PostgreSQL case-insensitive matching; a tracked entity allows EF to persist changed properties. Existing bulk assignment removal and subsequent employee SaveChanges remain separate operations, as before.

Teacher files: StackFlow.Application/Employees/EmployeeService.cs, IEmployeeService.cs, IEmployeeStore.cs, EmployeeDto.cs, CreateEmployeeDto.cs, UpdateEmployeeDto.cs, RelieveEmployeeDto.cs; StackFlow.Application/Validation/EmployeeNameAttribute.cs; StackFlow.Infrastructure/Employees/EfEmployeeStore.cs; stackflow-api/Controllers/EmployeesController.cs; stackflow-api/Program.cs; stackflow-api.Tests/EmployeeArchitectureTests.cs.

Next slice: Attendance. Overall Clean Architecture migration is still incomplete.

Final verification: 116/116 backend tests passed after migration; git diff --check passed.

## Clean Architecture stage 2: Departments — 2026-10-08

Purpose: Separate Department business decisions from EF/PostgreSQL without changing existing admin behavior.

Changed files: DepartmentDto.cs, SaveDepartmentDto.cs, IDepartmentService.cs and DepartmentService.cs moved from API into StackFlow.Application/Departments with existing namespaces retained. Added Application/Departments/IDepartmentStore.cs, Infrastructure/Departments/EfDepartmentStore.cs and tests/DepartmentArchitectureTests.cs. Program.cs registers the store. docs/architecture.md tracks the remaining migration.

API examples: GET /api/departments returns name, description, EmployeeCount and RelievedEmployeeCount. POST /api/departments accepts {"name":"Engineering","description":"Product team"}. PUT /api/departments/{id} uses the same payload. DELETE /api/departments/{id} retains the existing employee-history protection. Existing controller authorization and HTTP outcomes are unchanged.

Request flow: Angular Department service sends HTTP; authorized DepartmentsController calls IDepartmentService; Application trims input and makes business decisions; IDepartmentStore delegates persistence to EfDepartmentStore; AppDbContext executes PostgreSQL queries. Counts remain SQL projections, not employee-list loading.

Database changes: none. Existing migrations and model remain unchanged. PostgreSQL CRUD/count checks ran within a transaction that was rolled back; no test rows retained. Identity sequences may advance during this probe.

Testing: 115/115 backend tests passed (baseline 114); database-free service test covers trimming, duplicate names, updates, missing records and protected deletion. Real PostgreSQL probe verified counts, case-insensitive duplicates, persisted updates and deletion, plus previous task/project/notification flows. dotnet ef migrations has-pending-model-changes --no-build reports no changes. git diff --check passed. Frontend files were not changed in this slice; browser UI was not retested. Restart the backend to load the new dependency-injection registration.

Technical terms: dependency inversion means Application defines the storage interface and Infrastructure implements it; projection selects only required fields/counts in SQL; tracked entity retains EF update tracking; rollback discards transaction writes.

Teacher files: StackFlow.Application/Departments/DepartmentService.cs, IDepartmentService.cs, IDepartmentStore.cs, DepartmentDto.cs, SaveDepartmentDto.cs; StackFlow.Infrastructure/Departments/EfDepartmentStore.cs; stackflow-api/Controllers/DepartmentsController.cs; stackflow-api/Program.cs; stackflow-api.Tests/DepartmentArchitectureTests.cs; docs/architecture.md. Next slice is Employees. The overall migration is not yet complete.

## Clean Architecture stage 1: Personal To-do pilot — 2026-10-08

Purpose: Establish compiler-enforced Domain/Application/Infrastructure projects and migrate one feature end-to-end while preserving existing APIs and data. This is a completed pilot, not a completed migration of the entire codebase. Legacy services still live in API and access AppDbContext until their later slices.

Changed files: all existing Models/*.cs moved unchanged to StackFlow.Domain/Models; AppDbContext.cs moved to StackFlow.Infrastructure/Persistence; PersonalTaskService.cs moved to StackFlow.Application/PersonalTasks and now depends on IPersonalTaskStore. New three project files, IPersonalTaskService/IPersonalTaskStore contracts, Infrastructure/PersonalTasks/EfPersonalTaskStore.cs, tests PersonalTaskArchitectureTests.cs, docs/architecture.md. Existing API csproj, PersonalTasksController, Program.cs and AppDbContextFactory updated.

API examples: GET /api/employee/tasks; POST with {"title":"Prepare notes","period":"Weekly","dueDate":"2026-10-15"}; PATCH /api/employee/tasks/{id}/completion with {"isCompleted":true}; DELETE /api/employee/tasks/{id}. Employee role/claim checks, 201/204/404 responses, validation and JSON shapes remain unchanged. Controller now calls IPersonalTaskService. Application handles orchestration and checks ownership; EF store scopes every query to EmployeeId and implements the Application-owned storage contract. Domain and Application do not reference EF, PostgreSQL, ASP.NET or Infrastructure.

Database: No schema migration. EF reports no pending model changes and lists existing migrations normally. Entities retain namespaces; migrations/snapshot remain in API temporarily, explicitly selected by MigrationsAssembly in runtime and design-time configuration. User Secrets identity and API startup commands remain unchanged. EF relational 10.0.10 and Npgsql provider 10.0.3 remain the prior versions. NuGet SSL restore failed initially; restore using existing cached packages with --ignore-failed-sources succeeded.

Testing: Baseline backend 111 tests passed. Refactored backend 114 tests passed, including architecture dependency checks and database-free create/complete/reopen/delete/foreign-owner tests. Frontend 62 tests passed without source changes. Actual PostgreSQL rollback probe exercised the new Application/Infrastructure flow plus existing project/notification persistence. All probe rows rolled back; identity sequences may advance. Existing user data was not reset or deleted. Backend restart and manual HTTP/browser To-do checks remain needed to verify the running process loads the new assemblies.

Teacher source files: StackFlow.Domain/Models/PersonalTask.cs; StackFlow.Application/PersonalTasks/PersonalTaskService.cs; StackFlow.Infrastructure/PersonalTasks/EfPersonalTaskStore.cs; StackFlow.Infrastructure/Persistence/AppDbContext.cs; stackflow-api/Controllers/PersonalTasksController.cs; Program.cs; stackflow-api.Tests/PersonalTaskArchitectureTests.cs; docs/architecture.md. Technical terms: dependency inversion means Infrastructure implements an interface owned by Application; composition root registers concrete implementations; assembly boundaries enforce project reference direction; a fake store tests use cases without PostgreSQL.

Remaining migration: Departments, Employees, Attendance, Leaves, Projects/notifications, authentication/session handling, then legacy cleanup and migration/seeding ownership. Do not describe all modules as Clean Architecture yet.

## Typing-time initial capitalization across panels — 2026-10-06

Purpose: Supersedes the previous Name blur behavior. A shared appInitialCapital directive capitalizes the initial typed letter immediately in an empty normal text field. It applies to Admin employee name/job title/relieving reason, department name/description, project name/description/assignment role, and Employee leave reason/personal task title. Remaining letters follow the keyboard; there is no forced lowercase. Search, email, password, phone, dates and numbers are excluded.

Changed files: new directives/initial-capital.directive.ts and its spec; the five affected components' TypeScript imports and HTML attributes; employee-form.spec.ts. Removed EmployeeForm's old blur-only method/state. No backend, API or database changes.

Request flow: Cancelable beforeinput for insertText in an empty field is transformed with setRangeText. An input event synchronizes reactive forms, ngModel and existing assignment-role handlers. The caret remains after the inserted text. Existing nonempty text, replacements, paste and IME composition are preserved. Users can replace the initial capital with lowercase; blur never reapplies capitalization. Clearing the entire field starts another empty-field entry. Caps Lock off cannot reliably signal intent to suppress automatic capitalization; manual replacement is the supported override.

Testing: Regression coverage checks immediate display/reactive-form synchronization, ngModel synchronization in an Employee-style textarea, caret position, manual lowercase replacement, unchanged paste/IME, and excluded email. Browser keyboard interaction remains a manual check: type a name, type a leave reason and task title, replace their initial capitals with lowercase, and verify save payloads preserve chosen case. Existing spelling is not rewritten on load or focus. Teacher files: initial-capital.directive.ts/spec.ts and affected component templates explain behavior and scope.

## Employee name first-blur capitalization — 2026-10-06

Purpose: New Employee Name inputs capitalize only the first letter on the first nonempty blur. Typing is not transformed. Later lowercase edits remain unchanged, including subsequent blurs. Empty blur does not consume the first-capitalization opportunity. Edit Employee preserves stored spelling. Other words, email, passwords and other fields are unchanged. This is a convenience, not a backend uppercase requirement.

Changed files: frontend components/employee-form/employee-form.ts, employee-form.html and employee-form.spec.ts. No API or database changes. Existing save still trims the submitted name and preserves the user's chosen case.

Request flow: Reactive form captures typing. Blur invokes capitalizeNameOnce, which skips edit mode and marks the one-time opportunity consumed after a nonempty value. Later manual override is submitted through the existing Employee API without further capitalization. The one-time state lasts for the current Add Employee form instance, not across visits.

Testing: Regression tests cover empty blur, no transformation during typing, leading whitespace, first-letter-only transformation, lowercase override after another blur, existing mixed-case edit names and unchanged email. Manual check: enter kushal sharma, leave Name, verify Kushal sharma, lower the K, leave again, and verify lowercase remains before saving. Browser interaction and live save are not exercised here.

Teacher source files: employee-form.ts and employee-form.html; employee-form.spec.ts contains behavior proof. Technical terms: blur occurs when a field loses focus; reactive form stores displayed/submitted values; instance state prevents repeating the automatic change. Admin personal To-do remains a separate next feature.

## Notification bell and contained desktop scrolling — 2026-10-06

Purpose: Replace the Employee Notifications text button with an inline SVG bell and numeric unread badge, retaining accessible Notifications labeling. Keep desktop navigation stationary while main content scrolls independently. Cap shared dropdown menus by the available viewport space below their trigger; preserve below-field placement and existing overscroll containment. Mobile retains normal document scrolling.

Changed files: frontend app.html, app.css, app.spec.ts, components/shared/dropdown/dropdown.ts, dropdown.html and new dropdown.spec.ts. No backend, API or database changes.

Cause and scope: Screenshot shows navigation moving with document scrolling and a dropdown near the viewport bottom. Desktop shell now owns a fixed viewport height; main and sidebar have independent overflow. Dropdown height is calculated when opened, capped at 220 pixels, with a 60-pixel minimum. This keeps existing selection/form behavior. Extremely small available space and resizing while open still require browser verification; no claim of pixel-perfect validation was made.

Testing: Frontend regression suite passed after layout/dropdown changes. Tests verify limited menu height and bell accessibility/icon-only display. Manually refresh, scroll Create Project while navigation remains visible, scroll Assign Team options without moving the page, select employees and test mobile layout. Open Employee notifications via the bell and verify unread badge and existing panel. Browser rendering/scroll behavior was not exercised directly.

Teacher files: app.css explains scroll ownership; dropdown.ts/html explains viewport menu sizing; app.html explains accessible SVG icon markup. Technical terms: overflow creates a scroll container, dynamic viewport height follows viewport size, aria-label names an icon-only control for assistive technology.

## Final automated and live read-only checkpoint — 2026-10-06

Fresh backend build/test passed 111/111 tests using `dotnet test --no-restore -p:NuGetAudit=false`. Fresh Angular tests passed 58/58 across 21 files. Application TypeScript `--noEmit` passed. Production Angular build passed, superseding the older development-bundle failure as a current build gate; that earlier diagnostic remains historical.

Production warnings remain: initial bundle 545.59 kB against a 500 kB warning budget; leave-management CSS 6.05 kB, project-management CSS 5.41 kB and employee-form CSS 4.69 kB against 4 kB warning budgets. These are optimization warnings, not failed builds. Consider lazy route loading and focused CSS consolidation in a separate feature; budgets were not raised to hide warnings.

Live API: Admin login returns 200. Admin GET employees, departments, projects and leaves returns 200. Anonymous GET Employee tasks and notifications returns 401. Admin GET those Employee routes returns 403. This confirms restarted API exposes the new routes and enforces authentication/role separation. No passwords or tokens were logged. Employee-authenticated HTTP write flow and browser acceptance still require manual verification; earlier transaction probes verify service-level ownership, not the full browser flow.

Database: Latest applied migration is 20261006121354_AddEmployeePersonalTasks. EF reports no pending model changes. PersonalTasks and EmployeeNotifications are present with zero rows at this checkpoint. No business rows were modified by these checks. No product source edits were made during verification.

Remaining acceptance: Employee creates and refreshes a personal task, completes/reopens it, sees only their tasks; fresh project assignment produces an alert with persistent read state; Employee submits a leave and Admin decides it; browser navigation and dropdown scrolling remain correct. Do not claim full end-to-end acceptance until these pass.

## Employee personal To-do — 2026-10-06

Purpose: Employees manage private daily/weekly tasks with calendar deadlines. Pending and Completed tabs separate work. Tasks can be completed, reopened or deleted after confirmation. These are personal tasks, not Admin-assigned project tasks. Labels do not automatically repeat tasks. Due-tomorrow, due-today and overdue labels update every minute while the page is open; no email, operating-system notifications or background scheduler is included.

Changed files: backend Models/PersonalTask.cs, Services/PersonalTaskService.cs, Controllers/PersonalTasksController.cs, Data/AppDbContext.cs, Program.cs, migration 20261006121354_AddEmployeePersonalTasks and snapshot; backend tests PersonalTaskTests.cs; frontend components/employee-tasks/employee-tasks.ts, .html, .css, .spec.ts, app.routes.ts and app.html.

API examples: Employee GET /api/employee/tasks lists owned tasks in completion/deadline order. POST /api/employee/tasks with {"title":"Prepare weekly notes","period":"Weekly","dueDate":"2026-10-12"} creates a task (201); use a deadline today or later. PATCH /api/employee/tasks/{id}/completion with {"isCompleted":true} completes it; false reopens it. DELETE /api/employee/tasks/{id} removes the owned personal task. Missing or foreign IDs return 404. Admin cannot access Employee-only routes.

Request flow: Role guard opens My To-do. HttpClient uses existing authentication plumbing. Controller derives EmployeeId from authenticated claims; service filters every read/write by ownership. EF Core persists changes in PostgreSQL. Frontend reloads after successful changes and preserves input on failed creation. Validation rejects blank/overlong titles, periods other than Daily/Weekly, missing/invalid dates, deadlines before today and years outside 2000–2100. Backend uses server-local today; frontend uses browser-local today, consistent on this local installation. A future hosted deployment must define a shared business timezone.

Database changes: Additive migration applied locally, creating only PersonalTasks with an Employee foreign key and EmployeeId/DueDate index. Existing business data remains unchanged: 11 employees, 1 project, 2 assignments, 1 leave request and 14 attendance records. Rollback drops PersonalTasks and its contents; do not execute without approval.

Testing: Backend 111 tests passed. Frontend tests cover due-tomorrow, due-today, overdue, future and completed-task alerts. Development bundle and TypeScript checks passed. PostgreSQL transaction probe verified creation, reload, completion, reopening, deletion and rejection of another employee's list/write access. Probe rolled back; zero test tasks remain. Identity sequence gaps may result. No live HTTP or browser clicks were exercised. Restart backend, refresh frontend, open Employee My To-do, create a task due tomorrow, refresh, complete it and verify Completed tab; reopen and delete it. Verify another employee cannot see it.

Teacher source files: PersonalTask.cs, PersonalTaskService.cs, PersonalTasksController.cs, employee-tasks.ts/html, AppDbContext.cs and the migration. Technical terms: record ownership prevents cross-employee access; role authorization controls panel access; additive migration preserves existing tables; computed signals derive tabs and alert counts from stored tasks.

## Employee project assignment notifications — 2026-10-06

Purpose: Employees receive persistent project assignment alerts. Read/unread state survives refresh. The Employee notification panel polls every 30 seconds and opens My Projects when an alert is selected. Existing assignments are not backfilled as new alerts.

Changed files: `stackflow-api/Models/EmployeeNotification.cs`, `Data/AppDbContext.cs`, `Services/EmployeeNotificationService.cs`, `Services/ProjectService.cs`, `Controllers/EmployeeNotificationsController.cs`, `Program.cs`, migration `20261006120003_AddEmployeeAssignmentNotifications` and model snapshot; frontend `src/app/services/employee-notification.service.ts`, its spec, `src/app/app.ts`, `app.html`, `app.css`; backend `EmployeeNotificationsControllerTests.cs`.

API examples: Employee GET `/api/employee/notifications` returns unreadCount and items containing id, projectId, message, createdAt and readAt. Employee PATCH `/api/employee/notifications/{id}/read` with `{}` returns 204 for an owned notification, or 404 for a missing or another employee's notification. Employee identity comes from authenticated claims, never from the request body.

Request flow: Project creation with a team and later assignment add notifications in the same SaveChanges transaction as assignments. Duplicate assignment produces no extra alert; removal followed by reassignment creates a new alert. Employee-only API filters by authenticated EmployeeId. Selecting an alert saves read state, refreshes the inbox, closes the panel and navigates to My Projects. Polling stops after logout or role change. The inbox returns at most 100 items, unread first; unreadCount covers all owned unread items.

Database changes: Migration applied locally. New EmployeeNotifications table stores ownership, project reference, message, UTC creation/read timestamps and an ownership/read-state index. Existing business tables were preserved. Migration rollback drops the notification table and its history; do not roll it back without explicit approval.

Testing: Backend 104/104 tests passed; frontend 57/57 tests passed; application TypeScript --noEmit passed. EF reports no pending model changes. PostgreSQL rollback probe verified persistence, ownership isolation, foreign-read rejection, idempotent read updates, duplicate-assignment behavior and reassignment alerts. Probe rows were rolled back. Existing counts remain 11 employees, 1 project, 2 assignments, 1 leave request and 14 attendance rows; notification count is zero. Identity sequences may advance during rollback probes.

Manual checks: Restart the backend to load the new API. Assign a fresh project to an employee, log in as that employee, wait up to 30 seconds, open Notifications, select the alert and refresh. Verify read state persists and another employee cannot access it. Live HTTP and browser interaction were not exercised for this feature.

Technical terms: Ownership filtering enforces record-level access. Atomic transaction keeps assignment and alert consistent. Idempotent read updates safely tolerate repeated requests. Polling refreshes state periodically; it is not instant push delivery.

## Verification checkpoint: 2026-10-05

Backend: `dotnet test --no-restore` passes all 94 tests. Frontend: `ng test --watch=false` passes all 46 tests across 16 files using installed Node v24.19.0. Two stale spec files were updated: `src/app/app.spec.ts` now uses current session keys and Admin role; `src/app/services/auth.service.spec.ts` supplies the current login response shape and verifies current logout storage keys. Product behavior was not changed during this checkpoint.

Live API verification: Configured development Admin and Employee accounts both log in successfully (200). Admin GET employees, departments, projects, and leaves returns 200. Employee GET own profile, attendance, leaves, and projects returns 200. Admin access to Employee profile returns 403. Employee access to Admin employees and account-management routes returns 403. Own-profile ID matches the EmployeeId issued at login. Credentials and tokens were not logged. Latest applied database migration is AddAccountSessionVersion; four account rows remain.

Unresolved build check: Full Angular development build exits 134, sometimes with esbuild reporting `fatal error: all goroutines are asleep - deadlock!`. This also occurs with worker/parallel compilation overrides. Root cause is not established. Passing tests and template compilation are not proof that full application bundling succeeds. Do not mark deployment ready until the build failure is diagnosed and resolved.

Remaining manual acceptance: Browser layout and navigation; Admin-created normal employee login; create leave, Admin approve/reject, and Employee refresh; password reset and old-password failure; disable/enable and retained-token rejection; relieving an employee and history preservation. These write flows were not exercised against existing user records during this checkpoint. Earlier focused tests cover parts of these flows, but do not replace real database/browser acceptance.

## Feature 10: Employee leave history by month

Purpose: Employees can filter their own leave history by month and decision. Blank month means all months. History is ordered by leave start date, newest first. A request spanning multiple months appears in each relevant month. Summary counts follow the selected month, independently of the decision filter. Approved leave day totals include only days inside the selected month; these are inclusive calendar days, including weekends, not payroll or working-day calculations.

Changed files: frontend `employee-leaves.ts`, `employee-leaves.html`, `employee-leaves.css`, and `employee-leaves.spec.ts`.

API and database: Existing Employee-only `GET /api/employee/leaves` is reused. No backend endpoint, schema change, migration, or additional permissions are needed. Server still filters records using the authenticated employee ID. Browser filters only that permitted result.

Request flow: Existing service loads the employee's history. Employee selects a month and optional decision, then clicks Filter. Applied filter signals derive overlapping requests, ordered rows, and month-specific approved calendar days. Clear restores all history and totals. Draft filter changes do not alter results until Filter is clicked.

Testing: Select a previous month and verify matching requests. Check a leave spanning September 29 through October 2: four total days, two September days, two October days. Verify rejected requests do not add approved days. Clear restores all requests. Focused test verifies cross-month overlap, clipped approved days, and clear behavior.

Technical terms: Date-range overlap means the leave intersects the selected month. Computed signals derive display values from loaded data and applied filters. Calendar days include every date, regardless of work schedule.

## Feature 9: Admin login access control

Purpose: Admin/HR can disable or enable an existing Employee login from Employee Details. The UI requests confirmation before saving. Access changes do not change employment status, password, attendance, leave history, or project assignments. Relieved employees cannot have login enabled. Employee users cannot manage access. AdminSeeder now preserves the access state of existing Employee seed accounts on restart rather than forcing them active.

Changed files: `AdminUser.cs`, `AccountSession.cs`, `AuthService.cs`, `EmployeeAccountDto.cs`, `IEmployeeAccountService.cs`, `EmployeeAccountService.cs`, `EmployeeAccountsController.cs`, account/session tests, `20261005092232_AddAccountSessionVersion.cs` and designer, `AppDbContextModelSnapshot.cs`, frontend `employee-account.service.ts`, and `employee-details.ts/html/css/spec.ts`.

API: Admin-only `PUT /api/employees/7/account/access` with `{ "isActive": false }` disables login; `{ "isActive": true }` enables it. Missing isActive fails validation. Returns 200 with account state, 404 if the Employee login account is missing, and 409 if enabling a relieved employee.

Request flow: Admin confirms an access change. Backend loads only the linked Employee-role account, validates employment state, updates IsActive and increments SessionVersion when the state changes. Disabled accounts fail login and protected API session checks. Enabling permits a fresh login with the same password; old tokens remain invalid because their session version no longer matches.

Database changes: The additive migration adds a non-null integer SessionVersion to AdminUsers, default 0. Existing version-zero token stamps remain compatible. No existing rows or passwords are modified by the migration. Repeated requests for the same state are idempotent. Apply the migration before restarting the new API. Rollback requires stopping the new API, restoring previous application code, and then removing the new column with the previous migration target; this discards revocation versions, so invalidate outstanding tokens before rollback.

Testing: Disable an active employee account, confirm login fails and an existing token receives 401. Re-enable, confirm the same password works for a fresh login but the old token still fails. Verify cancellation sends no access request. Confirm employee record counts and histories remain unchanged. Verify Employee tokens cannot call account management endpoints. Focused backend tests cover response statuses and old-session invalidation after re-enable; frontend tests exercise confirmation, disable and enable payloads.

Technical terms: IsActive controls login access separately from employee employment status. SessionVersion is a persisted credential session counter. Idempotent means repeating a state-setting request does not cause further changes. Additive migration preserves existing database records.

Password authority: Employee passwords are managed only by the Admin panel used by Admin/HR. Employees have no self-service password endpoint or screen. Admin Reset Password replaces the stored hash, invalidates previous sessions, and makes old-password login return 401 with the existing "Invalid email or password." alert. The employee self-change feature was removed. No database passwords were changed during this removal.

## Feature 8: Admin password reset and session invalidation

Purpose: Admin opens Employee Details, selects Reset Password, enters a new password and matching confirmation, then saves. Password visibility is available for the new password. Cancellation clears the fields. Disabled and relieved accounts cannot be reset.

Changed files: `EmployeeAccountsController.cs`, `EmployeeAccountService.cs`, `IEmployeeAccountService.cs`, `AccountSession.cs`, `AuthService.cs`, `Program.cs`, backend account/session tests, frontend `employee-account.service.ts` and `employee-details.ts/html`.

API: Admin-only `PUT /api/employees/7/account/password` with `{ "password": "<private password of 12–128 characters>" }`. Returns 200 with account email/state, 404 when no Employee account exists, 409 for disabled or relieved accounts, and 400 for invalid password length. No stored password or hash is returned.

Request flow: Admin form confirms the new password. Server authorizes Admin, loads the Employee account, hashes the replacement password and saves it to PostgreSQL. Login now issues an account_session claim derived from the stored password hash. JWT authentication checks that claim against the current account on every protected request. Resetting the password changes the claim value and makes existing tokens return 401. Angular's existing interceptor clears the session and redirects to login on the next failed request.

Database changes: No migration; existing PasswordHash is updated. Authentication now performs one account lookup per protected request. Existing tokens from before this feature lack the session claim and require login again, including Admin tokens. No immediate browser notification occurs until an old session makes a protected API request. Development seed passwords may be restored on restart for configured seeded accounts.

Testing: Log in as Employee and retain its token. Reset from Admin with matching new passwords. Confirm old password cannot log in, old token receives 401, and new password produces a working token. Confirm mismatched confirmation prevents submission. Check disabled/relieved reset rejection and Employee-token 403. Session tests cover changed password stamps, missing stamps, wrong employee identity and relieved employee state.

Technical terms: A session stamp identifies the account's current credentials without exposing the password hash. JWT signature validation checks token authenticity before the account lookup. Token invalidation means a previously issued token can no longer authorize requests.

Learning preference: Complete implementation first. At the end, use this document to teach the complete project in order: architecture, authentication, request flow, database relationships, each feature, testing, and an explanation suitable for a senior developer. Source files and API examples below are the teacher-chat handoff.

## Feature 7: Admin creates employee login access

Password visibility: An accessible eye button toggles only the password currently being entered. Existing stored passwords cannot be retrieved because only their hashes are stored. Successful account creation clears the password and resets visibility.

Purpose: Admin can create an Employee login account from Employee Details without editing database rows or development secrets. The login email comes from the employee record. The administrator provides a 12–128 character password and shares it privately.

Changed files: backend `DTOs/EmployeeAccountDto.cs`, `Services/IEmployeeAccountService.cs`, `Services/EmployeeAccountService.cs`, `Controllers/EmployeeAccountsController.cs`, `Program.cs`, and `EmployeeAccountsControllerTests.cs`; frontend `services/employee-account.service.ts` and `components/employee-details/employee-details.ts/html/css`, plus `employee-details.spec.ts`.

Verification: Backend builds and all 88 backend tests pass. Both Employee Details tests pass, including account creation through the form and successful display of login access. Angular application template compilation passes. Real database account creation and employee login remain manual acceptance steps; tests do not create production employee accounts.

API examples: `GET /api/employees/7/account` returns the linked login email and enabled state, or no account. `POST /api/employees/7/account` with JSON `{ "password": "<12–128 character private password>" }` returns 201. Both endpoints require an Admin bearer token. Existing account/email conflicts and relieved employees return 409; missing employees return 404. Validation rejects short passwords with 400.

Request flow: Admin opens Employee Details, reviews existing access, and submits a password. The controller authorizes Admin. The service loads the employee, rejects relieved employees and duplicate account/email links, creates an Employee role account, hashes its password, and saves it. The UI clears the password after success. The employee uses the existing login endpoint and receives an Employee JWT containing the linked employee ID.

Database changes: No migration. Existing AdminUsers table stores the Employee role, EmployeeId, normalized login email, password hash, and active flag. Existing unique indexes prevent duplicate login emails and employee links. The API never returns password hashes.

Testing steps: Open an active employee without login access, create access, then log in with that employee email and chosen password. Verify the Employee panel shows only that employee's data. Repeat creation and expect 409. Attempt with a relieved employee and expect 409. Call the account endpoint with an Employee token and expect 403. Confirm short passwords fail validation. Existing development seed accounts remain controlled by development seed configuration; restarting Development can restore the configured seed password for those accounts.

Technical terms: Password hashing stores a one-way representation instead of plaintext. Role authorization protects account creation on the server. Normalization converts login emails to a consistent lowercase format. Unique constraints prevent duplicate accounts, including simultaneous requests. Account creation does not grant Admin privileges.

## Feature 1: Unified Admin and Employee authentication

### Purpose

StackFlow now authenticates both Admin and Employee accounts through one login endpoint. JWT role claims keep Admin routes separate from Employee routes. An Employee account can link to exactly one employee record.

Existing Admin behavior remains available. Existing Admin rows receive `Role = Admin` and `IsActive = true` through database defaults.

### Changed source files

Backend:

- `stackflow-api/Models/AdminUser.cs`
- `stackflow-api/Models/UserRoles.cs`
- `stackflow-api/Models/Employee.cs`
- `stackflow-api/Data/AppDbContext.cs`
- `stackflow-api/Data/AdminSeeder.cs`
- `stackflow-api/DTOs/LoginResponseDto.cs`
- `stackflow-api/Services/AuthService.cs`
- `stackflow-api/Migrations/20261004155056_AddRoleBasedUserAccounts.cs`
- `stackflow-api/Migrations/20261004155056_AddRoleBasedUserAccounts.Designer.cs`
- `stackflow-api/Migrations/AppDbContextModelSnapshot.cs`
- `stackflow-api.Tests/AuthenticationTests.cs`

Frontend:

- `stackflow-frontend/src/app/models/auth.ts`
- `stackflow-frontend/src/app/services/auth.service.ts`
- `stackflow-frontend/src/app/guards/auth.guard.ts`
- `stackflow-frontend/src/app/components/login/login.ts`
- `stackflow-frontend/src/app/components/login/login.html`
- `stackflow-frontend/src/app/components/employee-dashboard/employee-dashboard.ts`
- `stackflow-frontend/src/app/components/employee-dashboard/employee-dashboard.html`
- `stackflow-frontend/src/app/components/employee-dashboard/employee-dashboard.css`
- `stackflow-frontend/src/app/app.routes.ts`
- `stackflow-frontend/src/app/app.html`

### API example

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "employee@example.com",
  "password": "your-development-password"
}
```

Employee response:

```json
{
  "token": "JWT_TOKEN",
  "expiresAt": "2026-10-04T12:00:00Z",
  "email": "employee@example.com",
  "role": "Employee",
  "employeeId": 12
}
```

Admin response uses `"role": "Admin"` and `"employeeId": null`.

### Request flow

1. Angular submits credentials to `POST /api/auth/login`.
2. `AuthController` calls `AuthService`.
3. `AuthService` reads account from PostgreSQL and includes linked employee data.
4. Password hasher verifies password hash.
5. Login fails when account is inactive or linked employee is inactive.
6. Backend creates JWT with account ID, email, and role. Employee JWT also contains `employee_id`.
7. Angular stores token, role, email, and employee ID in session storage.
8. Admin enters `/dashboard`. Employee enters `/employee`.
9. Role guards prevent either role from opening the other role's routes.
10. `guestGuard` prevents authenticated users from reopening Login through browser history.
11. Successful login replaces Login in browser history. Logout replaces current protected page with Login.

### Database changes

Migration adds these columns to existing `AdminUsers` table:

- `Role`: required; defaults existing records to `Admin`.
- `IsActive`: required; defaults existing records to `true`.
- `EmployeeId`: optional foreign key to `Employees.Id`.

`EmployeeId` has a unique index. One employee can own at most one login account. Delete behavior is restricted so account links cannot silently delete employee data.

Rollback command:

```bash
dotnet ef database update RemoveProjectLead
```

Rollback removes only new authentication columns and link. Do not run rollback after relying on Employee accounts without first preserving account data.

### Creating a development Employee login

Choose an existing active employee email. From `stackflow-api`, set optional development secrets:

```bash
dotnet user-secrets set "EmployeeSeed:Email" "employee@example.com"
dotnet user-secrets set "EmployeeSeed:Password" "Choose-A-Strong-Password"
```

Restart API in Development. Seeder links account to employee with matching email. No password enters Git-tracked configuration.

### Testing steps

Backend:

```bash
cd stackflow-api.Tests
dotnet test
```

Frontend type check:

```bash
cd stackflow-frontend
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
```

Frontend production build requires Node.js `22.22.3+`, `24.15.0+`, or `26+` for installed Angular CLI.

Manual checks:

1. Login as Admin. Confirm `/dashboard` opens and Admin navigation remains unchanged.
2. Login as Employee. Confirm `/employee` opens and Admin navigation is hidden.
3. As Employee, enter `/employees`. Confirm redirect to `/employee`.
4. As Admin, enter `/employee`. Confirm redirect to `/dashboard`.
5. Mark account or linked employee inactive in database. Confirm Employee login returns `401`.

### Technical terms

- **Authentication:** verifies who is signing in.
- **Authorization:** decides which routes and APIs the signed-in user may access.
- **JWT:** signed token containing identity claims.
- **Role claim:** JWT value such as `Admin` or `Employee` used by authorization rules.
- **Foreign key:** database link between Employee account and Employee record.
- **Unique index:** prevents multiple accounts from linking to the same employee.
- **Additive migration:** adds schema without deleting existing columns or data.
- **Password hash:** one-way password representation stored instead of plain text.

---

## Feature 2: Employee self-profile

### Purpose

Logged-in Employees can view only their own profile. Client does not send an employee ID. Backend reads trusted `employee_id` from signed JWT and uses that ID for database query.

Admin employee-detail behavior remains unchanged.

### Changed source files

Backend:

- `stackflow-api/DTOs/EmployeeProfileDto.cs`
- `stackflow-api/Services/ICurrentUserService.cs`
- `stackflow-api/Services/CurrentUserService.cs`
- `stackflow-api/Services/IEmployeeProfileService.cs`
- `stackflow-api/Services/EmployeeProfileService.cs`
- `stackflow-api/Controllers/EmployeeProfileController.cs`
- `stackflow-api/Program.cs`
- `stackflow-api.Tests/EmployeeProfileControllerTests.cs`

Frontend:

- `stackflow-frontend/src/app/models/employee-profile.ts`
- `stackflow-frontend/src/app/services/employee-profile.service.ts`
- `stackflow-frontend/src/app/components/employee-profile/employee-profile.ts`
- `stackflow-frontend/src/app/components/employee-profile/employee-profile.html`
- `stackflow-frontend/src/app/components/employee-profile/employee-profile.css`
- `stackflow-frontend/src/app/components/employee-dashboard/employee-dashboard.html`
- `stackflow-frontend/src/app/app.routes.ts`
- `stackflow-frontend/src/app/app.html`

### API example

```http
GET /api/employee/profile
Authorization: Bearer EMPLOYEE_JWT
```

```json
{
  "id": 7,
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "phone": "+919876543210",
  "department": "Engineering",
  "jobTitle": "Developer",
  "salary": 75000,
  "dateOfJoining": "2026-01-15",
  "isActive": true
}
```

Admin JWT receives `403 Forbidden`. Employee cannot request another employee ID because endpoint has no ID parameter.

### Request flow

1. Angular `EmployeeProfileService` calls `GET /api/employee/profile`.
2. JWT interceptor adds Employee access token.
3. ASP.NET authorization requires `Employee` role.
4. `CurrentUserService` reads `employee_id` from authenticated JWT.
5. `EmployeeProfileService` queries matching employee and department.
6. Angular renders profile as read-only data.

### Database changes

No schema or data migration. Feature reads existing `Employees` and `Departments` tables.

### Testing steps

1. Run `dotnet test` from `stackflow-api.Tests`.
2. Run `./node_modules/.bin/tsc -p tsconfig.app.json --noEmit` from `stackflow-frontend`.
3. Login as Employee and open `/employee/profile`.
4. Confirm displayed employee matches Employee account link.
5. Call endpoint with Admin token and confirm `403 Forbidden`.

### Technical terms

- **Current user:** identity extracted from validated access token.
- **Ownership authorization:** server chooses data through authenticated identity, not client-supplied ID.
- **Read-only DTO:** API response designed for display without update behavior.
- **403 Forbidden:** authenticated account lacks required role.

---

## Feature 3: Employee attendance history

### Purpose

Logged-in Employees can review only their own monthly attendance. Employee view is read-only. Admin keeps existing mark and same-day edit controls.

### Changed source files

Backend:

- `stackflow-api/DTOs/EmployeeAttendanceDto.cs`
- `stackflow-api/Services/IEmployeeAttendanceService.cs`
- `stackflow-api/Services/EmployeeAttendanceService.cs`
- `stackflow-api/Controllers/EmployeeAttendanceController.cs`
- `stackflow-api/Program.cs`
- `stackflow-api.Tests/EmployeeAttendanceControllerTests.cs`

Frontend:

- `stackflow-frontend/src/app/models/employee-attendance.ts`
- `stackflow-frontend/src/app/services/employee-attendance.service.ts`
- `stackflow-frontend/src/app/components/employee-attendance/employee-attendance.ts`
- `stackflow-frontend/src/app/components/employee-attendance/employee-attendance.html`
- `stackflow-frontend/src/app/components/employee-attendance/employee-attendance.css`
- `stackflow-frontend/src/app/app.routes.ts`
- `stackflow-frontend/src/app/app.html`

### API example

```http
GET /api/employee/attendance?year=2026&month=10
Authorization: Bearer EMPLOYEE_JWT
```

```json
[
  { "date": "2026-10-04", "status": "Present" },
  { "date": "2026-10-03", "status": "Late" }
]
```

### Request flow

1. Employee selects month and optional status filter.
2. Angular sends only year and month.
3. Backend reads employee ID from signed JWT.
4. Query filters `Attendance` by trusted employee ID and month range.
5. Backend returns newest record first.
6. Angular shows summary counts and read-only history.

### Database changes

No migration. Feature reads existing `Attendance` records.

### Testing steps

1. Run `dotnet test` from `stackflow-api.Tests`.
2. Run Angular TypeScript check.
3. Login as Employee and open `/employee/attendance`.
4. Change month and verify only linked employee records appear.
5. Confirm Employee page has no create or edit controls.
6. Call endpoint with Admin JWT and confirm `403 Forbidden`.

### Technical terms

- **Month range query:** filters dates from first day inclusive to next month's first day exclusive.
- **Server ownership filter:** authenticated employee ID controls database query.
- **Read-only history:** Employee can view records but cannot create or modify them.

---

## Feature 4: Employee leave requests and history

### Purpose

Employees can submit their own leave requests and review pending, approved, and rejected decisions. Only Admin/HR keeps approval authority.

### Changed source files

Backend: `CreateEmployeeLeaveDto.cs`, `EmployeeLeaveDto.cs`, `IEmployeeLeaveService.cs`, `EmployeeLeaveService.cs`, `EmployeeLeavesController.cs`, `Program.cs`, and `EmployeeLeavesControllerTests.cs`.

Frontend: `employee-leave.ts`, `employee-leave.service.ts`, `components/employee-leaves/*`, `app.routes.ts`, and `app.html`.

### API examples

```http
GET /api/employee/leaves
Authorization: Bearer EMPLOYEE_JWT
```

```http
POST /api/employee/leaves
Authorization: Bearer EMPLOYEE_JWT
Content-Type: application/json

{
  "leaveType": "CasualLeave",
  "startDate": "2026-10-10",
  "endDate": "2026-10-11",
  "reason": "Family event"
}
```

### Request flow

1. Employee chooses type, valid date range, and reason.
2. Backend takes employee ID only from signed JWT.
3. Backend rejects inactive employees, overlapping pending/approved requests, and attendance conflicts.
4. Valid request saves as `Pending`.
5. Existing Admin leave panel receives request for approval or rejection.
6. Employee history displays updated decision after refresh.

### Database changes

No migration. Feature writes existing `LeaveRequests` table.

### Testing steps

1. Run backend tests and Angular TypeScript check.
2. Login as Employee and submit valid future leave.
3. Confirm request appears as Pending in Employee and Admin panels.
4. Approve from Admin panel.
5. Refresh Employee history and confirm Approved status and approved-day total.
6. Submit overlapping request and confirm `409 Conflict`.

### Technical terms

- **Ownership-safe command:** Employee ID comes from authenticated token, not request body.
- **Overlap check:** prevents pending or approved date ranges from intersecting.
- **Pending workflow:** request exists but requires Admin/HR decision.
## Safe data reset and cleanup — 2026-10-05

Purpose: Start fresh with user-entered business records while preserving the existing Admin account, database schema, and migrations.

Database changes: An ordered DELETE transaction removed 3 Employee accounts, 15 attendance records, 2 leave requests, 5 project assignments, 6 employees, 6 projects, and 5 departments. The single Admin account and all 12 migration-history entries remain. Identity sequences were deliberately not reset, avoiding reuse of deleted employee identities. No tables, migrations, or schema were deleted.

Recovery: Before deletion, a PostgreSQL custom-format backup was created and its archive listing verified. It is stored at `.local-backups/reset-20261005/stackflow_db-before-reset.dump`, excluded by `.gitignore`, with restricted filesystem permissions. It contains private records and password hashes and must not be shared or committed. Full restoration was not rehearsed; restore to a separate database first if recovery is required.

Configuration: Removed only `EmployeeSeed:Email` and `EmployeeSeed:Password` from .NET User Secrets. Otherwise startup would expect a deleted employee record. Admin credentials, JWT settings, and the database connection string were preserved. Newly created Employee accounts must be managed through the Admin panel.

Code changes: Removed five unreferenced generated Angular component JavaScript copies (attendance-management, dashboard, employee-list, leave-management, and project-management). Their TypeScript sources remain. Removed an unused `LeaveType` import from `services/leave-request.service.ts`. Preserved detail APIs used by `CreatedAtAction`; absence of a direct frontend call does not establish an unused API. No working API was removed.

Relieve error: The saved employee form already calls `.relieveEmployee(...)`, and EmployeeService defines that method. The screenshot displays `.relieve Employee(...)` in an unsaved editor buffer. The saved source passes compilation; the user must compare/reload that buffer without overwriting unrelated unsaved changes.

Checks: Backend 94/94 tests passed. Frontend 46/46 tests passed after removing generated copies. Production build passed with existing size warnings. After removing the unused import, TypeScript compilation with `--noUnusedLocals --noUnusedParameters` passed. Live Admin login returned 200; GET employees, departments, projects, leaves, and attendance each returned 200 with an empty array after reset. A separate temporary startup probe on port 5091 produced no listening output and was stopped; successful fresh startup is not claimed from that probe. The existing API on port 5090 remained available.

Next flow: Create a department, then an employee, then Employee login access through Admin. Add attendance, leave requests, and project assignments using new records. Repeat live write-flow acceptance checks. This cleanup is evidence-based, not a claim that every possible dead-code path has been eliminated.

## Final verification checkpoint — 2026-10-05

Purpose: Validate the existing Admin and Employee panels without changing real employee records. Changed file: this document only. No API or database schema changes were made.

Automated checks: `dotnet test --no-restore` passed 94 tests. Angular `ng test --watch=false --progress=false` with Node v24.19.0 passed 46 tests across 16 files. These include controller behavior, account session invalidation, own-identity attendance access, and frontend account controls. They are not substitutes for live write-flow integration tests.

Live API checks: Admin and seeded Employee login returned 200. Admin GET employees, departments, projects, and leaves returned 200. Employee GET the same Admin endpoints returned 403. Employee GET own profile, October 2026 attendance, leaves, and projects returned 200; Admin access to these Employee-only endpoints returned 403. Employee PATCH `/api/leaves/1/status` returned 403, POST `/api/employee/attendance` returned 405, and POST `/api/employee/password` returned 404. These blocked requests did not change records. PATCH CORS preflight from localhost:4200 returned 204 with PATCH allowed. Credentials and tokens were not recorded in the report.

Browser checks: Admin login opened the dashboard. Navigating to /login while authenticated redirected to the dashboard. Projects loaded and persisted after refresh. Completed Project History contained the existing completed project without Edit; its details opened and closed. Logout opened login without the sidebar. Browser Back after logout remained on login.

Remaining acceptance checks: Actual Admin password reset, old-password rejection after reset, disable/enable and relieved-account login on disposable records, leave submission followed by both approval and rejection with persistence, and Employee browser attendance/history interactions. Password changes through browser automation require user handoff. No real employee account passwords or leave decisions were changed during this checkpoint. Full end-to-end completion is not claimed.

Observation: Existing project records still display legacy due dates in years 4393 and 4454. This is a data-quality observation; no records were edited or deleted. Review these records separately rather than treating successful builds as proof of clean data.

Technical terms: 403 means authenticated identity lacks permission; 405 means the method is not supported; 404 means no matching endpoint was found. CORS preflight checks whether the browser may send a cross-origin method. A smoke test proves a narrow runtime path, not every workflow.

## Verification fix: Angular native build cache crash

Purpose: Restore normal frontend builds without changing application behavior or package versions.

Changed file: `stackflow-frontend/angular.json`. Angular CLI disk caching is disabled with `cli.cache.enabled: false`.

Evidence: The failing Node process aborted with a native double-free error. The macOS crash report shows `EnvWrap::closeEnv` and `EnvWrap::openEnv` in the native cache module. Selecting the alternative SQLite cache made the development build succeed. Disabling disk caching then made the normal production build succeed without environment overrides. This identifies the native cache path as the failure mechanism; it does not establish why that native module failed internally.

Request flow and API examples: Unchanged. This setting affects Angular build tooling only. No backend, authentication, endpoint, database table, or migration changes were made.

Testing: Using Node v24.19.0, production build passed and all 46 frontend tests in 16 files passed. Production build still reports existing bundle and component CSS budget warnings; these are not build failures and were not changed. Browser interaction tests for password reset, access controls, and leave decisions remain separate checks.

Tradeoff: Builds cannot reuse the Angular disk cache and may take longer. The change is reversible by removing the cache setting after the native cache issue is resolved. Do not delete application data or alter database schema for this tooling error.

Technical terms: A native module runs compiled machine code inside Node. SIGABRT means the process aborted. A disk cache stores build results for reuse. A bundle budget warning reports output size, not a runtime or authentication failure.

## Feature 6: Employee dashboard

Purpose: Replace the employee welcome placeholder with a personal dashboard. Attendance is summarized for the current month. Leave counts cover all requests. Current project counts exclude completed projects and ended assignments. Each summary links to its corresponding employee page.

Changed files: frontend `components/employee-dashboard/employee-dashboard.ts`, `employee-dashboard.html`, `employee-dashboard.css`, `employee-dashboard.spec.ts`, and `app.html`.

API examples: Authenticated `GET /api/employee/profile`, `GET /api/employee/attendance?year=2026&month=10`, `GET /api/employee/leaves`, and `GET /api/employee/projects`. Existing Employee-only endpoints derive EmployeeId from the JWT; the dashboard sends no employee ID.

Request flow: The Employee route guard opens the dashboard. Four existing Angular services fetch permitted data from existing backend services and PostgreSQL tables. Angular signals derive counts and previews. An individual request failure leaves other sections available and shows an unavailable message rather than a misleading zero count.

Database changes: None. Existing employee, attendance, leave request, and project assignment tables are reused. No new backend endpoint or migration is needed.

Testing steps: Sign in as an employee and compare the attendance count with My Attendance for the current month. Compare pending and approved request counts with My Leaves. Verify completed and removed assignments are excluded from current assignments. Click each card and the profile link. Verify only the selected sidebar page is highlighted. Stop the backend and refresh to verify unavailable states. Run the focused EmployeeDashboard tests and Angular compilation.

Technical terms: A signal stores reactive component state. A computed signal derives counts from loaded records. finalize resets loading state after success or failure. Independent subscriptions allow partial results when one endpoint fails. Exact route matching prevents the dashboard navigation item from remaining highlighted on child routes.

## Feature 5: Employee project assignments

Purpose: Employees can review their own assigned projects and assignment history. This screen is read-only.

Changed files: `EmployeeProjectsController.cs`, `EmployeeProjectService.cs`, `IEmployeeProjectService.cs`, `EmployeeProjectDto.cs`, `Program.cs`, `EmployeeProjectsControllerTests.cs`, frontend `employee-project.service.ts`, `employee-projects.ts/html/css`, `app.routes.ts`, and `app.html`.

API example: `GET /api/employee/projects` with `Authorization: Bearer <employee-token>`. The response is an array containing project name, description, status, priority, dates, and the authenticated employee's assignment role. No employee ID is accepted from the browser.

Request flow: My Projects loads through the Employee route guard. Angular sends the authenticated GET request. Backend requires the Employee role, reads EmployeeId from the token, and filters EmployeeProjects by that identity. EF Core joins the existing Projects table and returns only permitted fields.

Database changes: None. Existing EmployeeProjects and Projects tables are reused. Completed projects and removed assignments appear in Project History; remaining assignments appear in Current Projects. This exposes history already retained in these tables, not a new audit log.

Testing: Run backend tests and frontend compilation. Assign a project to employee A as Admin, log in as A, and check My Projects. Log in as employee B and confirm A's assignments do not appear. Complete the project as Admin and refresh A's page; it should move to Project History. Check View details and Close. Employee cannot edit, assign, or delete through this screen.

Technical terms: JWT claim identifies the current employee. Backend authorization enforces access independently of frontend guards. AsNoTracking avoids change tracking for read-only queries. DTO limits data exposed to the browser.

## Admin pending-leave alerts — 2026-10-06

Purpose: Make pending employee leave requests visible without requiring Admin to open Leave Management. Positive pending count shows a dashboard decision banner, highlights the Pending Leaves card, and adds a sidebar badge. All links open /leaves?tab=pending. Zero pending hides the banner/badge and removes the highlight.

Changed files: Frontend app.ts, app.html, app.css, app.spec.ts; services/dashboard.service.ts and .spec.ts; components/dashboard/dashboard.ts, .html, .css, .spec.ts; components/leave-management/leave-management.ts; this handoff. Backend unchanged.

Request flow and API example: Existing Admin GET /api/dashboard/stats returns pendingLeaveRequests from PostgreSQL LeaveRequests with Pending status. DashboardService publishes the latest stats and count. The authenticated Admin shell refreshes immediately and every 30 seconds, using exhaustMap to avoid overlapping polling requests. Logout, Employee role, or shell destruction cancels polling and clears Admin state. Poll errors hide the sidebar count rather than claiming zero; previously loaded dashboard data may remain until a successful refresh. Leave Management updates shared pending count after requests are fetched following a decision.

Database changes: None. These alerts represent outstanding work, not unread notifications. Read/unread storage and Employee assignment notifications are separate future work. No notification table, new endpoint, or package was added.

Testing: Angular tests cover positive/zero dashboard alerts, pending-page links, shared stats/count, sidebar badge visibility, periodic Admin refresh, logout cancellation, and no Admin polling for Employee sessions. Run full Angular tests and TypeScript --noEmit. Manually submit an Employee leave and wait up to 30 seconds in Admin; click the badge/banner, decide, and verify the count drops. No live browser submission was made in this step.

Technical terms: Polling periodically reads existing API state; it is not instant push delivery. A badge summarizes outstanding items. exhaustMap ignores new timer ticks while the previous request is in flight. Signal state shares updated counts across views.

## Assign employees while creating a project — 2026-10-06

Purpose: Admin can select an optional team in Create Project instead of opening details after creation. Selected names appear as removable chips. Assignments use the existing Member role; existing details still support later role-specific assignments. Planned and Active projects accept team selection; On Hold and Completed projects retain the existing team lock.

Changed files: Backend DTOs/CreateProjectDto.cs, Controllers/ProjectsController.cs, Services/IProjectService.cs, Services/ProjectService.cs, tests/ProjectsControllerTests.cs; frontend models/project.ts, components/project-management/project-management.ts, .html, .css, .spec.ts; and this handoff. CreateProjectDto extends existing field validation and adds optional employeeIds. Existing requests without employeeIds remain valid; edit payload and behavior remain unchanged.

API example: Admin POST /api/projects with {"name":"Website launch","description":"Launch work","startDate":"2026-10-06","dueDate":"2026-11-01","status":"Planned","priority":"Medium","employeeIds":[1,2]}. IDs must exist and be active. Backend returns 201 including the assigned team; nonexistent IDs return 404, relieved employees or locked status return 409 without creating a project.

Request flow: Create form collects employee IDs and sends one POST. Backend deduplicates IDs, validates employees/status, builds the Project and EmployeeProject graph, and saves once. EF Core's PostgreSQL SaveChanges transaction writes both tables atomically. A failed request preserves frontend team selection. Successful creation resets selection and reloads projects. No sequential create-then-assign calls.

Database changes: No schema migration. Existing Projects and EmployeeProjects tables are reused. Actual PostgreSQL service-flow verification saved a project with two team members inside an explicit outer transaction, reloaded its links, verified duplicate-ID handling and that an invalid employee creates no project, then rolled back. No test rows were retained. PostgreSQL identity sequences are not transactional, so a skipped project ID may result.

Testing: Backend 100/100 tests and frontend 52/52 tests passed; TypeScript --noEmit passed. Regression tests cover locked creation before staging, controller failure responses, duplicate selection, removal, same-request team payload, and selection retention on failure. The PostgreSQL rollback probe verified actual persistence. Browser clicks and live HTTP creation were not exercised. Restart backend and refresh frontend; manually create with a team, refresh, inspect team, and check Employee My Projects.

Technical terms: An object graph represents a project and its related assignments. Atomic transaction means all related writes commit or none do. Optional payload fields preserve old clients. Rollback removes transactional test rows but does not rewind identity sequences.

## Employee-submitted leave and Admin decisions only — 2026-10-06

Purpose: Employees submit their own requests; Admin/HR reviews and decides without creating or rewriting employee requests. Admin now lands on Pending Approvals. Calendar and history remain available. The Record Request form and Edit controls are removed. Invalid or expired pending requests can be rejected; the employee submits a fresh request rather than Admin changing dates.

Changed files: `stackflow-frontend/src/app/components/leave-management/leave-management.ts`, `.html`, `.css`, new `.spec.ts`, `stackflow-frontend/src/app/services/leave-request.service.ts`, `stackflow-api/Controllers/LeavesController.cs`, `stackflow-api/Services/LeaveRequestService.cs`, `stackflow-api.Tests/LeaveRequestTests.cs`, and this handoff.

API examples: Employee POST /api/employee/leaves with {"leaveType":"CasualLeave","startDate":"2026-10-10","endDate":"2026-10-11","reason":"Family event"}; dates must be valid at submission time. Employee identity comes from the authenticated claim, not the payload. Admin GET /api/leaves?status=Pending reviews requests; PATCH /api/leaves/{id}/status with {"status":"Approved"} or {"status":"Rejected"} decides. Admin POST /api/leaves and PUT /api/leaves/{id} no longer have routes. Backend rejects repeat decisions on non-pending records with 409. Existing approval date, attendance, active-employment, and overlap checks remain.

Request flow: Employee API validates and stores Pending leave. Admin fetches requests, submits a status decision, and reloads. Approved leave appears in the calendar and history; rejected leave appears in history. Existing internal Admin create/update service methods are not exposed by routes; removing all obsolete internal DTOs and helpers is outside this focused change.

Database changes: None. No migration or live record modifications. Restart the backend to load changed routes; a previously running process still uses its older assembly.

Testing: Backend 95/95 tests and frontend 51/51 tests passed. Angular test compilation passed; TypeScript --noEmit passed. Regression coverage checks absence of Admin POST/PUT route attributes, no Record/Edit UI, approval availability, and conflict response mapping for decided requests. A new live submission/approval/rejection and database-backed repeat-decision test were not performed. Manually test after backend restart using fresh employee requests and confirm Employee cannot call Admin decision routes.

Technical terms: Backend routes define exposed operations; hiding a button alone is not authorization. Role authorization separates Employee submission and Admin decisions. A Pending-to-decision transition prevents rewriting finalized history.

## StackFlow favicon — 2026-10-06

Purpose: Replace the Angular tab icon with a compact SF mark using the existing sidebar blue-indigo branding.

Changed files: `stackflow-frontend/public/stackflow-icon.svg`, `stackflow-frontend/src/index.html`, and this handoff. The original favicon.ico remains unmodified but is no longer referenced by the page.

Request flow: Browser reads the icon link in index.html and loads /stackflow-icon.svg from the frontend public assets. No API, backend, or database changes.

Testing: Development build passed. Generated index.html references stackflow-icon.svg and the generated browser assets include that file. Refresh the browser tab to check the visible SF mark; hard refresh if an old icon is cached. Native browser tab appearance was not verified.

Technical terms: Favicon identifies a browser tab. SVG is a scalable vector asset. Public assets are copied into the frontend build.

## Attendance history read-only explanations — 2026-10-06

Purpose: Replace the ambiguous History only action label with a reason. Active employees' non-today records show Read-only · Not today's record; relieved employees show Read-only · Relieved employee. Active employees' current-day records retain Edit Status. Explanatory text and tooltips clarify the existing rule.

Changed files: `stackflow-frontend/src/app/components/attendance-management/attendance-management.html`, new `attendance-management.spec.ts`, and this document. No permission, backend, API, or database changes.

Request flow and API example: Existing GET /api/attendance and GET /api/employees populate attendance history and employment state. The template compares the record date with the existing local-today helper and reads the employee's active status. Only display labels changed; no additional requests.

Database changes: None. History remains preserved. No attendance was modified during verification.

Testing: Focused Angular test passed, verifying current-day active records keep Edit Status, old active records explain the date restriction, and relieved records explain employment restriction. TypeScript --noEmit passed. Manually refresh Attendance History and compare those three cases. No live browser check was performed.

Technical terms: Read-only means the record remains visible without an edit action. Conditional rendering selects an action label from existing state. Local date comparison determines the current-day UI rule; backend authorization remains unchanged.

## Project assignment dropdown performance — 2026-10-06

Purpose: Remove repeated assignment-option filtering and array allocation during Angular change checks. The original template called a method that rebuilt options each time, changing the input reference of the OnPush dropdown. Live Chrome scroll latency was not profiled, so this is a verified repeated-work fix, not proof that all reported lag is eliminated.

Changed files: Project management TypeScript, HTML, new project-management.spec.ts, shared dropdown CSS, and this handoff. Options now use a memoized computed signal for the selected project. Menu overscroll is contained so reaching its boundary does not scroll the surrounding page.

Request flow and API examples: Existing GET /api/projects and GET /api/employees populate signals. Opening project details computes available employee options, excluding current team members. Existing POST /api/projects/{id}/employees remains unchanged. Assignment reloads projects, invalidating cached options. No API or database changes; no live assignments were created.

Testing: Regression test checks reference reuse across unrelated busy-state changes, exclusion of assigned employees, refresh after removal, and renamed employees. Run Angular tests and TypeScript --noEmit. Manually open an assignment dropdown with many employees, scroll to both boundaries, select an employee, and verify selection and refreshed options. Browser scroll smoothness remains a manual verification item.

Technical terms: Computed signals memoize derived values until dependencies change. OnPush avoids checking unchanged inputs. Overscroll containment prevents scroll chaining to ancestor containers.

## Database verification and digits-only phone input — 2026-10-06

Purpose: Verify the running API uses the existing PostgreSQL data, then prevent non-digit national phone input without changing country selection or validation.

Changed files: `stackflow-frontend/src/app/components/employee-form/employee-form.ts`, `employee-form.html`, `employee-form.spec.ts`, and this handoff. No backend, database, secrets, or Git changes.

API examples and verification: Authenticated Admin GET `/api/employees`, `/api/departments`, and `/api/projects` returned 11, 5, and 1 records respectively. Sorted IDs matched read-only SQL results from the corresponding PostgreSQL tables. Unauthenticated GET `/api/employees` returned 401. Login tokens were not printed.

Request flow: The phone field cancels invalid typed text through `beforeinput`. The `input` handler removes non-digits from pasted or other inserted text and synchronizes the reactive form value. Existing required and country-length validators remain. Save still combines the separately selected country code with the national number and uses the existing employee API.

Database changes: None. No records were created, updated, or deleted during these checks.

Testing: Employee form tests passed 16/16; TypeScript application check with `--noEmit` passed. Regression tests cover blocked letters/symbols, allowed digits, mixed pasted text, required empty input, and India's 10-digit validation. For manual verification, type letters and symbols into Phone, paste mixed text, use Backspace, and switch country. Country code remains separate. Browser interaction and a new employee save were not performed in this checkpoint.

Technical terms: `inputmode` is a keyboard hint, not input enforcement. `beforeinput` can cancel typed insertion. Sanitization removes unwanted characters. Reactive form synchronization keeps displayed and submitted values consistent.

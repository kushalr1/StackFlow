# StackFlow Mentor Guide

## Two-Minute Project Explanation

StackFlow is a full-stack employee management system built with Angular, ASP.NET Core Web API, Entity Framework Core, and PostgreSQL.

The Angular frontend provides a dashboard and pages to list, search, filter, view, add, edit, and delete employees. It uses Angular Router for navigation, Reactive Forms for validated employee forms, and HttpClient for communication with the backend.

The ASP.NET Core backend exposes REST endpoints for employee CRUD operations. Controllers handle HTTP requests and status codes, DTOs define validated request and response data, and the employee service contains the application operations. Entity Framework Core maps the C# Employee entity to the PostgreSQL `Employees` table and generates SQL for database operations.

The project validates data in both Angular and .NET. Angular provides immediate feedback, while backend validation protects the API when requests do not come from the browser. The connection string is stored in .NET User Secrets so credentials are not committed to Git.

The project also includes xUnit backend tests, Angular tests, a manual test checklist, responsive styling, error states, and complete setup documentation.

## Five-Minute Project Explanation

### 1. Purpose

StackFlow manages a simple employee directory. Each employee has a name, email, phone, department, job title, salary, date of joining, and active status.

The main features are:

- Dashboard statistics
- Employee listing
- Search and department filtering
- Employee details
- Add, edit, and delete operations
- Frontend and backend validation
- Loading, empty, success, and error feedback

### 2. Frontend

The frontend is an Angular standalone application. Angular Router maps URLs such as `/dashboard`, `/employees`, `/employees/add`, and `/employees/:id` to components.

`EmployeeService` is the frontend API layer. Components do not create HTTP requests manually; they call service methods such as `getEmployees`, `createEmployee`, `updateEmployee`, and `deleteEmployee`. The service uses Angular HttpClient and returns Observables.

Components call `subscribe` to receive successful responses or handle errors. Signals store local UI state such as employees, loading status, selected filters, and error messages. Computed signals calculate dashboard totals from employee data.

The add and edit pages reuse one Reactive Form. In add mode the form sends POST, and in edit mode it loads the employee and sends PUT.

### 3. Backend

The backend is an ASP.NET Core Web API. `Program.cs` registers controllers, the employee service, Entity Framework Core, PostgreSQL, CORS, and OpenAPI support through dependency injection.

`EmployeesController` defines the REST endpoints and selects appropriate HTTP responses:

- `200 OK` for successful GET requests
- `201 Created` after creating an employee
- `204 No Content` after successful update or deletion
- `400 Bad Request` for invalid input or IDs
- `404 Not Found` when an employee does not exist

DTOs keep API input separate from the database entity. Data-annotation rules validate required fields, email format, phone format, lengths, salary, and joining date.

`EmployeeService` performs CRUD, search, and filter operations. The controller depends on the `IEmployeeService` interface instead of constructing the service directly.

### 4. Database

PostgreSQL stores employee rows permanently. `AppDbContext` represents the database session, while `DbSet<Employee>` represents the Employees table.

Entity Framework Core translates LINQ expressions into SQL. For example, a C# `Where` expression becomes a SQL `WHERE` condition. `SaveChangesAsync` sends insert, update, or delete statements to PostgreSQL.

The initial EF Core migration records how to create the Employees table. `dotnet ef database update` applies that migration.

### 5. Security and Configuration

The PostgreSQL connection string is stored in .NET User Secrets and is not committed. CORS allows the Angular development origin to call the API. Both frontend and backend validation are used because browser validation can be bypassed.

Version 1 intentionally excludes authentication and authorization. Those belong in a later version.

### 6. Testing

The backend uses xUnit unit tests with a fake employee service. The tests check validation, status codes, CRUD behavior, search, and filtering without changing the real database.

Angular tests use HttpTestingController to inspect fake GET, POST, PUT, and DELETE requests without starting the real backend. Form validation and component initialization are also tested.

Manual test cases cover the complete browser experience and failure situations that automated unit tests do not fully demonstrate.

## Architecture Flow

```text
User action
   ↓
Angular component
   ↓ calls
Angular EmployeeService
   ↓ uses HttpClient
HTTP request containing JSON
   ↓
EmployeesController
   ↓ calls through dependency injection
IEmployeeService / EmployeeService
   ↓ uses
AppDbContext and Entity Framework Core
   ↓ generates SQL
PostgreSQL Employees table
```

The response returns through the reverse path:

```text
PostgreSQL row
   ↓
Entity Framework Core object
   ↓
EmployeeDto
   ↓ serialized as JSON
HTTP response and status code
   ↓
Angular EmployeeService Observable
   ↓
Component updates its signals
   ↓
Screen updates
```

## Suggested Demo Order

1. Show the dashboard statistics.
2. Open the employee list.
3. Demonstrate search and department filtering.
4. Create an employee and show validation first.
5. Open the created employee's details.
6. Edit the employee and show the updated list and dashboard.
7. Delete the test employee and explain the confirmation step.
8. Show the API controller and service briefly.
9. Show the migration and PostgreSQL table.
10. Run backend and frontend automated tests.

Use a clearly named test employee during the demonstration and remove it afterward.

## Concepts to Explain Clearly

### REST API

A REST API exposes resources through URLs and standard HTTP methods. StackFlow uses GET to read, POST to create, PUT to update, and DELETE to remove employees.

### JSON

JSON is the text format used to transfer employee data between Angular and .NET. Angular objects are serialized into JSON requests, and .NET DTOs are serialized into JSON responses.

### Dependency Injection

Dependency injection supplies a class with the dependencies it needs. ASP.NET Core supplies `IEmployeeService` to the controller and `AppDbContext` to the service. Angular supplies HttpClient to `EmployeeService`.

### DTO

A DTO defines data crossing the API boundary. It prevents the database entity from becoming the public API contract and provides a clear place for request validation.

### DbContext

`AppDbContext` is EF Core's connection between C# code and the database. It tracks entity changes and saves them as SQL operations.

### Migration

A migration is version-controlled database schema history. It describes how the database structure should change as the application evolves.

### Observable and Subscribe

HttpClient returns an Observable because HTTP work completes later. `subscribe` provides handlers for the successful result and an error result.

### CORS

The browser treats Angular on port 4200 and the API on port 5090 as different origins. CORS is the backend policy that explicitly permits the Angular origin to call the API.

## Likely Mentor Questions

### Why validate in Angular and .NET?

Angular validation improves the user experience, but it can be bypassed. Backend validation protects the API and database regardless of which client sends the request.

### Why use DTOs instead of exposing Employee directly?

DTOs separate the public API contract from the database entity, control accepted and returned fields, and keep validation near request models.

### Why use an interface for EmployeeService?

The interface reduces coupling between the controller and implementation. It also makes controller unit tests easy because a fake service can be supplied.

### Why use `AsNoTracking` for GET operations?

Read-only queries do not need EF Core change tracking. `AsNoTracking` avoids that unnecessary tracking work.

### Why are User Secrets used?

They store development credentials outside the repository. This prevents connection details from being pushed to GitHub.

### What is the difference between unit and integration tests?

A unit test isolates one class or layer using controlled dependencies. An integration test runs multiple real layers together, such as the API, EF Core, and a test database.

### What would you add next?

Reasonable next features include pagination, sorting, authentication, roles, attendance, leave management, and deployment. Authentication and authorization should be designed before adding private employee data for real users.

## Final Demonstration Checklist

- PostgreSQL is accepting connections.
- The connection string exists in User Secrets.
- Migrations are applied.
- Backend starts on port 5090.
- Frontend starts on port 4200.
- Add, view, edit, search, filter, and delete work.
- Dashboard totals update correctly.
- Backend tests pass.
- Frontend tests pass.
- No credentials appear in source control.

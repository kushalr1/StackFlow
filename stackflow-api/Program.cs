using System.Text;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using stackflow_api.Data;
using stackflow_api.Models;
using stackflow_api.Services;
using StackFlow.Infrastructure.PersonalTasks;
using StackFlow.Infrastructure.Departments;
using StackFlow.Infrastructure.Employees;
using StackFlow.Infrastructure.Attendance;
using StackFlow.Infrastructure.Leaves;
using StackFlow.Infrastructure.Projects;
using StackFlow.Infrastructure.Dashboard;
using StackFlow.Infrastructure.Profiles;
using StackFlow.Infrastructure.Accounts;
using stackflow_api.Security;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

const string AngularFrontendPolicy = "AngularFrontend";

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, postgres => postgres.MigrationsAssembly("stackflow-api")));

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT signing key was not configured.");

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("JWT signing key must be at least 32 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                if (!int.TryParse(principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var accountId))
                {
                    context.Fail("Invalid account identity.");
                    return;
                }
                var store = context.HttpContext.RequestServices.GetRequiredService<IAccountStore>();
                var account = await store.FindByIdAsync(accountId);
                if (!AccountSession.IsValid(account, principal?.FindFirstValue(AccountSession.ClaimName),
                    principal?.FindFirstValue(ClaimTypes.Role), principal?.FindFirstValue("employee_id")))
                    context.Fail("Account session is no longer valid.");
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IPasswordHasher<AdminUser>, PasswordHasher<AdminUser>>();

builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IEmployeeStore, EfEmployeeStore>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IDepartmentStore, EfDepartmentStore>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountStore, EfAccountStore>();
builder.Services.AddScoped<IAccountPasswordHasher, AccountPasswordHasher>();
builder.Services.AddScoped<ITokenIssuer, JwtTokenIssuer>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IAttendanceStore, EfAttendanceStore>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
builder.Services.AddScoped<ILeaveStore, EfLeaveStore>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProjectStore, EfProjectStore>();
builder.Services.AddScoped<IEmployeeNotificationStore, EfEmployeeNotificationStore>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IDashboardStore, EfDashboardStore>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IEmployeeProfileService, EmployeeProfileService>();
builder.Services.AddScoped<IEmployeeProfileStore, EfEmployeeProfileStore>();
builder.Services.AddScoped<IEmployeeAttendanceService, EmployeeAttendanceService>();
builder.Services.AddScoped<IEmployeeLeaveService, EmployeeLeaveService>();
builder.Services.AddScoped<IEmployeeProjectService, EmployeeProjectService>();
builder.Services.AddScoped<IEmployeeNotificationService, EmployeeNotificationService>();
builder.Services.AddScoped<IPersonalTaskService, PersonalTaskService>();
builder.Services.AddScoped<IPersonalTaskStore, EfPersonalTaskStore>();
builder.Services.AddScoped<IEmployeeAccountService, EmployeeAccountService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularFrontendPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(AngularFrontendPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await AdminSeeder.SeedAsync(app.Services, app.Configuration, app.Environment);

app.Run();

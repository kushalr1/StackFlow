using Microsoft.EntityFrameworkCore;
using stackflow_api.Data;
using stackflow_api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

const string AngularFrontendPolicy = "AngularFrontend";

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

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

builder.Services.AddControllers();
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

app.UseAuthorization();

app.MapControllers();

app.Run();

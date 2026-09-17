using Microsoft.EntityFrameworkCore;
using stackflow_api.Models;

namespace stackflow_api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    public DbSet<Attendance> AttendanceRecords => Set<Attendance>();

    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<EmployeeProject> EmployeeProjects => Set<EmployeeProject>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var adminUser = modelBuilder.Entity<AdminUser>();

        adminUser.ToTable("AdminUsers");
        adminUser.HasKey(admin => admin.Id);

        adminUser.Property(admin => admin.Email)
            .IsRequired()
            .HasMaxLength(255);

        adminUser.HasIndex(admin => admin.Email)
            .IsUnique();

        adminUser.Property(admin => admin.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        var department = modelBuilder.Entity<Department>();

        department.ToTable("Departments");
        department.HasKey(d => d.Id);

        department.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);

        department.HasIndex(d => d.Name)
            .IsUnique();

        department.Property(d => d.Description)
            .HasMaxLength(500);

        var employee = modelBuilder.Entity<Employee>();

        employee.ToTable("Employees");
        employee.HasKey(e => e.Id);

        employee.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        employee.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(255);

        employee.Property(e => e.Phone)
            .IsRequired()
            .HasMaxLength(15);

        employee.HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        employee.Property(e => e.JobTitle)
            .IsRequired()
            .HasMaxLength(100);

        employee.Property(e => e.Salary)
            .HasPrecision(12, 2);

        employee.Property(e => e.DateOfJoining)
            .HasColumnType("date");

        employee.Property(e => e.IsActive)
            .HasDefaultValue(true);

        var attendance = modelBuilder.Entity<Attendance>();

        attendance.ToTable("Attendance");
        attendance.HasKey(record => record.Id);

        attendance.Property(record => record.Date)
            .HasColumnType("date");

        attendance.Property(record => record.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        attendance.HasOne(record => record.Employee)
            .WithMany(employee => employee.AttendanceRecords)
            .HasForeignKey(record => record.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        attendance.HasIndex(record => new { record.EmployeeId, record.Date })
            .IsUnique();

        var leaveRequest = modelBuilder.Entity<LeaveRequest>();

        leaveRequest.ToTable("LeaveRequests");
        leaveRequest.HasKey(request => request.Id);

        leaveRequest.Property(request => request.LeaveType)
            .HasConversion<string>()
            .HasMaxLength(30);

        leaveRequest.Property(request => request.StartDate).HasColumnType("date");
        leaveRequest.Property(request => request.EndDate).HasColumnType("date");

        leaveRequest.Property(request => request.Reason)
            .IsRequired()
            .HasMaxLength(500);

        leaveRequest.Property(request => request.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        leaveRequest.Property(request => request.AppliedOn)
            .HasColumnType("timestamp with time zone");

        leaveRequest.HasOne(request => request.Employee)
            .WithMany(employee => employee.LeaveRequests)
            .HasForeignKey(request => request.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        var project = modelBuilder.Entity<Project>();
        project.ToTable("Projects");
        project.HasKey(item => item.Id);
        project.Property(item => item.Name).IsRequired().HasMaxLength(100);
        project.Property(item => item.Description).HasMaxLength(500);
        project.Property(item => item.StartDate).HasColumnType("date");
        project.Property(item => item.EndDate).HasColumnType("date");
        project.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);

        var employeeProject = modelBuilder.Entity<EmployeeProject>();
        employeeProject.ToTable("EmployeeProjects");
        employeeProject.HasKey(link => new { link.EmployeeId, link.ProjectId });
        employeeProject.HasOne(link => link.Employee)
            .WithMany(employee => employee.EmployeeProjects)
            .HasForeignKey(link => link.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        employeeProject.HasOne(link => link.Project)
            .WithMany(item => item.EmployeeProjects)
            .HasForeignKey(link => link.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

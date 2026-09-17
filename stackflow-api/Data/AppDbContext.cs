using Microsoft.EntityFrameworkCore;
using stackflow_api.Models;

namespace stackflow_api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<Department> Departments => Set<Department>();

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

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
    }
}

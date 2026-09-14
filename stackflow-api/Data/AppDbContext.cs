using Microsoft.EntityFrameworkCore;
using stackflow_api.Models;

namespace stackflow_api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        employee.Property(e => e.Department)
            .IsRequired()
            .HasMaxLength(100);

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

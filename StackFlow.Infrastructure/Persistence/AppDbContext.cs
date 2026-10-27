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
    public DbSet<EmployeeNotification> EmployeeNotifications => Set<EmployeeNotification>();
    public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<ChatToolInvocation> ChatToolInvocations => Set<ChatToolInvocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var personalTask = modelBuilder.Entity<PersonalTask>();
        personalTask.ToTable("PersonalTasks");
        personalTask.Property(t => t.Title).IsRequired().HasMaxLength(150);
        personalTask.Property(t => t.Period).IsRequired().HasMaxLength(10);
        personalTask.HasIndex(t => new { t.EmployeeId, t.DueDate });
        personalTask.HasOne(t => t.Employee).WithMany().HasForeignKey(t => t.EmployeeId).OnDelete(DeleteBehavior.Cascade);

        var notification = modelBuilder.Entity<EmployeeNotification>();
        notification.ToTable("EmployeeNotifications");
        notification.HasKey(item => item.Id);
        notification.Property(item => item.Message).IsRequired().HasMaxLength(250);
        notification.HasIndex(item => new { item.EmployeeId, item.ReadAt });
        notification.HasOne(item => item.Employee).WithMany().HasForeignKey(item => item.EmployeeId).OnDelete(DeleteBehavior.Cascade);
        notification.HasOne(item => item.Project).WithMany().HasForeignKey(item => item.ProjectId).OnDelete(DeleteBehavior.Cascade);

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

        adminUser.Property(admin => admin.Role)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue(UserRoles.Admin);

        adminUser.Property(admin => admin.IsActive)
            .HasDefaultValue(true);

        adminUser.HasOne(admin => admin.Employee)
            .WithOne(employee => employee.UserAccount)
            .HasForeignKey<AdminUser>(admin => admin.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

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

        employee.Property(e => e.RelievedDate)
            .HasColumnType("date");

        employee.Property(e => e.RelievingReason)
            .HasMaxLength(500);

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
        project.Property(item => item.DueDate).HasColumnType("date");
        project.Property(item => item.CompletedOn).HasColumnType("date");
        project.Property(item => item.Status).HasConversion<string>().HasMaxLength(20);
        project.Property(item => item.Priority).HasConversion<string>().HasMaxLength(20);

        var employeeProject = modelBuilder.Entity<EmployeeProject>();
        employeeProject.ToTable("EmployeeProjects");
        employeeProject.HasKey(link => new { link.EmployeeId, link.ProjectId });
        employeeProject.Property(link => link.Role).IsRequired().HasMaxLength(50);
        employeeProject.Property(link => link.AssignedOn).HasColumnType("date");
        employeeProject.Property(link => link.RemovedOn).HasColumnType("date");
        employeeProject.HasOne(link => link.Employee)
            .WithMany(employee => employee.EmployeeProjects)
            .HasForeignKey(link => link.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
        employeeProject.HasOne(link => link.Project)
            .WithMany(item => item.EmployeeProjects)
            .HasForeignKey(link => link.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        var chatConversation = modelBuilder.Entity<ChatConversation>();
        chatConversation.ToTable("ChatConversations");
        chatConversation.HasOne(conversation => conversation.Account)
            .WithMany()
            .HasForeignKey(conversation => conversation.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
        // Enforces "one ongoing conversation per account" at the data layer, not just in
        // EfChatConversationStore's check-then-insert logic, which alone can't be made atomic
        // against two concurrent requests from the same account.
        chatConversation.HasIndex(conversation => conversation.AccountId).IsUnique();

        var chatMessage = modelBuilder.Entity<ChatMessage>();
        chatMessage.ToTable("ChatMessages");
        chatMessage.Property(message => message.Role).IsRequired().HasMaxLength(10);
        chatMessage.HasIndex(message => new { message.ConversationId, message.CreatedAt });
        chatMessage.HasOne(message => message.Conversation)
            .WithMany()
            .HasForeignKey(message => message.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        var chatToolInvocation = modelBuilder.Entity<ChatToolInvocation>();
        chatToolInvocation.ToTable("ChatToolInvocations");
        chatToolInvocation.Property(invocation => invocation.ToolName).IsRequired().HasMaxLength(100);
        chatToolInvocation.HasOne(invocation => invocation.ChatMessage)
            .WithMany()
            .HasForeignKey(invocation => invocation.ChatMessageId)
            .OnDelete(DeleteBehavior.Cascade);
        // TargetEmployeeId is intentionally not configured as a foreign key (see ChatToolInvocation).
    }
}

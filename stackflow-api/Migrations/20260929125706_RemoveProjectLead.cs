using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProjectLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLead",
                table: "EmployeeProjects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLead",
                table: "EmployeeProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectAssignmentHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "AssignedOn",
                table: "EmployeeProjects",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLead",
                table: "EmployeeProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "RemovedOn",
                table: "EmployeeProjects",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "EmployeeProjects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Member");

            migrationBuilder.Sql(
                """
                UPDATE "EmployeeProjects" AS assignment
                SET "AssignedOn" = project."StartDate"
                FROM "Projects" AS project
                WHERE assignment."ProjectId" = project."Id"
                  AND assignment."AssignedOn" IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedOn",
                table: "EmployeeProjects");

            migrationBuilder.DropColumn(
                name: "IsLead",
                table: "EmployeeProjects");

            migrationBuilder.DropColumn(
                name: "RemovedOn",
                table: "EmployeeProjects");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "EmployeeProjects");
        }
    }
}

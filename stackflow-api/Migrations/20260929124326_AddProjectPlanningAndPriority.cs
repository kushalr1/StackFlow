using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectPlanningAndPriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Projects",
                newName: "DueDate");

            migrationBuilder.AddColumn<DateOnly>(
                name: "CompletedOn",
                table: "Projects",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Projects",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Medium");

            migrationBuilder.Sql(
                """
                UPDATE "Projects"
                SET "CompletedOn" = CASE
                    WHEN "DueDate" IS NOT NULL AND "DueDate" <= CURRENT_DATE THEN "DueDate"
                    ELSE CURRENT_DATE
                END
                WHERE "Status" = 'Completed' AND "CompletedOn" IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedOn",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Projects");

            migrationBuilder.RenameColumn(
                name: "DueDate",
                table: "Projects",
                newName: "EndDate");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeRelieving : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "RelievedDate",
                table: "Employees",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelievingReason",
                table: "Employees",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelievedDate",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "RelievingReason",
                table: "Employees");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class AddChatMessageLists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ListsJson",
                table: "ChatMessages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ListsJson",
                table: "ChatMessages");
        }
    }
}

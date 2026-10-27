using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace stackflow_api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueChatConversationPerAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ChatConversations_AccountId",
                table: "ChatConversations");

            migrationBuilder.CreateIndex(
                name: "IX_ChatConversations_AccountId",
                table: "ChatConversations",
                column: "AccountId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ChatConversations_AccountId",
                table: "ChatConversations");

            migrationBuilder.CreateIndex(
                name: "IX_ChatConversations_AccountId",
                table: "ChatConversations",
                column: "AccountId");
        }
    }
}

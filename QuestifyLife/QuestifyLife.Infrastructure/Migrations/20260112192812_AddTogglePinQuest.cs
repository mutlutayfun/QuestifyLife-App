using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestifyLife.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTogglePinQuest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPinned",
                table: "Quests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPinned",
                table: "Quests");
        }
    }
}

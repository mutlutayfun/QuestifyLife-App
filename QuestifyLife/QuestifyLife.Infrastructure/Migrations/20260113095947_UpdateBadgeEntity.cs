using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestifyLife.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBadgeEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rarity",
                table: "Badges",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TargetContext",
                table: "Badges",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rarity",
                table: "Badges");

            migrationBuilder.DropColumn(
                name: "TargetContext",
                table: "Badges");
        }
    }
}

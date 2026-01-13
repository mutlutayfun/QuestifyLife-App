using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestifyLife.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBadgeEntity_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MonthlyTargetPoints",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WeeklyTargetPoints",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "YearlyTargetPoints",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyTargetPoints",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WeeklyTargetPoints",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "YearlyTargetPoints",
                table: "Users");
        }
    }
}

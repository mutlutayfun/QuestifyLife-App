using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestifyLife.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderDate",
                table: "Quests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderDate",
                table: "Quests");
        }
    }
}

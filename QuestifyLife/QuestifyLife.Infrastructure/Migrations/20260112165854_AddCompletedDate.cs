using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuestifyLife.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Quests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Quests");
        }
    }
}

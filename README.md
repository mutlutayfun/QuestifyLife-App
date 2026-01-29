🦊 QuestifyLife

QuestifyLife is a gamified productivity application designed to turn your daily tasks into an exciting RPG adventure. Complete quests, earn XP, level up, unlock badges, and compete with friends on the leaderboard!

✨ Features

Gamification: Turn tasks into quests with difficulty levels. Earn XP and level up your character.

Avatar System: Unlock and choose from various cute fox avatars as you progress.

Badges & Achievements: Earn unique badges (e.g., "Early Bird", "Social Butterfly") based on your performance.

Social Interaction: Add friends, accept requests, and view their profiles.

Leaderboard: Compete with friends and see who is the most productive.

Performance Tracking: Visualize your daily productivity with calendar heatmaps and charts.

PWA Support: Installable on mobile devices with offline capabilities.

Secure Authentication: JWT-based secure login and registration system.

🛠️ Tech Stack

Backend (.NET 8)

Framework: ASP.NET Core Web API

Language: C#

Database: SQL Server (Entity Framework Core)

Architecture: Clean Architecture (Domain, Application, Infrastructure, API layers)

Authentication: JWT (JSON Web Tokens)

Frontend (React)

Framework: React.js (Vite)

Styling: Tailwind CSS

HTTP Client: Axios

State Management: React Context API

PWA: Vite PWA Plugin

Charts: Recharts / React-Calendar

Notifications: React-Toastify

🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

Prerequisites

.NET 8 SDK

Node.js (v18 or higher)

SQL Server (LocalDB or Express)

1. Backend Setup

Navigate to the API directory:

cd QuestifyLife/QuestifyLife.API


Update the connection string in appsettings.json if necessary, then run migrations to create the database:

dotnet ef database update --project ../QuestifyLife.Infrastructure --startup-project .


Start the API:

dotnet run


The API will typically run on https://localhost:7099.

2. Frontend Setup

Navigate to the Web directory:

cd QuestifyLife.Web


Install dependencies:

npm install


Start the development server:

npm run dev


The application will launch in your browser (usually at http://localhost:5173).

📂 Project Structure

QuestifyLife/
├── QuestifyLife.API/            # API Controllers & Entry point
├── QuestifyLife.Application/    # Business Logic, DTOs, Interfaces
├── QuestifyLife.Domain/         # Entities & Enums
├── QuestifyLife.Infrastructure/ # Database Context, Migrations, Repositories
└── QuestifyLife.Web/            # React Frontend Application


🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📧 Contact

Mutlu Tayfun - [GitHub Profile](https://github.com/mutlutayfun)

Made with ❤️ and 🦊 Cuteness.
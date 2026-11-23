🧠 MEMORA — Beyond Memory

Every flip, a spark. Every match, a memory.

A sharper mind begins with one move.

MEMORA is an interactive brain-training and memory game platform designed to challenge your mind, improve memory, sharpen focus, and make learning through play more engaging.

Featuring multiple game modes, dynamic scoring, XP progression, achievements, and performance tracking, MEMORA transforms simple memory exercises into an immersive gaming experience.

🌐 Live Demo

Live Application: https://memora-game.vercel.app/

Repository: https://github.com/abdul-kadar-imran/memora-game

✨ About MEMORA

MEMORA is more than a traditional memory matching game. It is a browser-based cognitive gaming experience that encourages players to improve their memory, concentration, observation, and reaction speed.

Players can explore different challenges, earn experience points, unlock achievements, track their progress, and compete against their own previous performance.

The application combines interactive gameplay with a modern user interface, smooth animations, and persistent player statistics.

🎮 Game Modes

MEMORA features three unique game modes.

1. Normal Memory Match

Test your visual memory by finding matching pairs hidden inside a shuffled card grid.

Features:

Multiple difficulty levels.

Easy, Medium, and Hard challenges.

Interactive card-flipping animations.

Match detection and feedback.

Move counter and game timer.

Accuracy and score tracking.

Final performance summary.

2. Time Attack

How many matching pairs can you discover before time runs out?

Features:

Countdown-based gameplay.

60-second challenge.

Score-based progression.

Combo multiplier system.

Consecutive match rewards.

Highest combo tracking.

Final score and accuracy summary.

3. Disappearing Memory

Observe, memorize, and recall.

Players are shown a collection of symbols for a limited time. Once the symbols disappear, they must identify the original items from a larger selection.

Features:

Multiple difficulty levels.

Limited memorization time.

Randomized symbols and distractors.

Interactive selection system.

Correct, incorrect, and missed answer tracking.

Accuracy and performance scoring.

🏆 Player Progression

MEMORA makes every completed challenge count.

XP & Level System

Earn XP through completed games.

Accumulate experience points.

Progress through player levels.

Track total XP and level progression.

Achievements

Unlock achievements by reaching gameplay milestones.

Examples include:

Achievement

Objective

First Match

Complete your first game

Memory Starter

Play 5 games

Perfect Recall

Achieve perfect accuracy

Speed Master

Complete a speed challenge

Combo King

Reach a 5-match combo

Daily Thinker

Maintain a 3-day streak

Brain Explorer

Play all three game modes

Memory Legend

Reach 2,500 XP

Player Dashboard

The dashboard provides an overview of player performance.

Statistics include:

Total games played.

Total XP earned.

Current player level.

Best score.

Average accuracy.

Total matched pairs.

Total playtime.

Best completion time.

Highest combo.

Recent game history.

Achievement progress.

Charts and statistics help players understand their progress over time.

🎨 Design & User Experience

MEMORA follows a modern, minimal, and futuristic gaming aesthetic.

Visual Identity

Clean and responsive interface.

Premium card-based layouts.

Smooth transitions and micro-interactions.

Interactive game animations.

Modern typography.

Accessible visual hierarchy.

Theme System

MEMORA supports two visual themes.

Light Theme

Soft lavender backgrounds.

White card surfaces.

Vibrant purple and electric blue accents.

Cyan highlights.

Clean and minimal appearance.

Dark Theme

Deep navy backgrounds.

Dark layered surfaces.

Purple and blue gradients.

Neon-inspired highlights.

Immersive gaming atmosphere.

Players can switch between themes, with their preference saved locally.

Responsive Design

MEMORA is designed to work across:

Desktop computers.

Laptops.

Tablets.

Mobile devices.

🛠️ Technology Stack

Technology

Purpose

React

User interface development

Vite

Development server and build tooling

TypeScript

Type safety and maintainable code

Tailwind CSS

Responsive styling

Framer Motion / Motion

Animations and transitions

Lucide React

Interface icons

LocalStorage

Persistent player data

Recharts

Data visualization

📂 Project Structure

The project follows a minimal and organized structure.

memora/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── MemoryCard.tsx
│   │   ├── GameArena.tsx
│   │   ├── Dashboard.tsx
│   │   └── GameResult.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── gameLogic.ts
│   └── storage.ts
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js

The structure above represents the intended minimal architecture; individual files may vary in the current implementation.

⚙️ Getting Started

Follow these steps to run MEMORA locally.

Prerequisites

Make sure you have installed:

Node.js

npm

Git

A code editor such as Visual Studio Code

1. Clone the Repository

git clone YOUR_REPOSITORY_URL

2. Navigate to the Project

cd memora

3. Install Dependencies

npm install

4. Start the Development Server

npm run dev

Open the local URL displayed in your terminal.

5. Build for Production

npm run build

6. Preview the Production Build

npm run preview

💾 Data Persistence

MEMORA uses browser LocalStorage for client-side persistence.

Player information and supported gameplay data can be retained between visits, including:

Player profile.

XP and level progression.

Game history.

Best scores.

Achievements.

Theme preferences.

Gameplay statistics.

Note: LocalStorage is browser-specific. Data is not automatically synchronized across devices or browsers. Clearing browser storage can remove locally saved progress.

🚀 Deployment

MEMORA can be deployed as a frontend application using platforms such as Vercel.

Deploy using Vercel

Push the project to GitHub.

Open Vercel.

Import your GitHub repository.

Select Vite as the framework preset.

Set the build command to npm run build.

Set the output directory to dist.

Deploy your application.

No backend server is required for the LocalStorage-based implementation.

🎯 Project Goals

MEMORA aims to:

Make memory training interactive and enjoyable.

Encourage consistent cognitive practice.

Improve visual recognition and recall.

Challenge players through different difficulty levels.

Reward progress through achievements and XP.

Provide an engaging and accessible gaming experience.

🔮 Future Enhancements

Potential features for future versions include:

Global leaderboards.

Multiplayer memory challenges.

Daily brain-training missions.

Additional memory game modes.

Cloud-based player accounts.

Cross-device progress synchronization.

Advanced player analytics.

Custom player profiles and avatars.

Weekly challenges and competitions.

👨‍💻 Developer

Abdul Kadar (Imran)

Full-Stack Developer | UI/UX Designer

Portfolio: https://imran-desktop.vercel.app/

📄 License

This project is currently a personal development project.

Add an appropriate open-source license before allowing others to reuse, modify, or distribute the project.

<p align="center">

MEMORA — BEYOND MEMORY

Every flip, a spark. Every match, a memory.

A sharper mind begins with one move.

</p>
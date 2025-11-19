# 🏖️ TravelSplit - Vacation Expense Splitter

A beautiful, vacation-themed expense splitting app that makes tracking shared costs fun and easy! Built with a tropical aesthetic perfect for group trips, vacations, and shared adventures.

![TravelSplit](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Features

- **Smart Expense Management** - Create groups, track expenses with categories, and split costs flexibly
- **Automatic Balance Calculation** - Real-time balance tracking with minimized settlement transactions
- **Category Icons** - Beautiful icons for Food, Transport, Accommodation, Entertainment, and more
- **Dark Mode** - Full light/dark theme support with smooth transitions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Tropical UI** - Vacation vibes with turquoise, coral colors and playful typography

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS

**Backend:** Express.js, PostgreSQL (Neon), Drizzle ORM, bcryptjs, express-session

**Auth:** Simple email/password authentication with secure session management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. **Clone and install**
```bash
git clone https://github.com/KarunyaKalk/TravelSplit.git
cd TravelSplit
npm install
```

2. **Set up environment variables**
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_key
```

3. **Initialize database and start**
```bash
npm run db:push
npm run dev
```

App runs at `http://localhost:5000`

## 📁 Project Structure

```
TravelSplit/
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn/ui)
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks (useAuth, etc.)
│   └── lib/             # Utilities and helpers
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   ├── auth.ts          # Authentication logic
│   └── index.ts         # Server setup
└── shared/schema.ts     # Database schema & validators
```

## 🎮 Usage

### Getting Started
1. **Sign up** with email and password
2. **Create a group** for your trip or event
3. **Add expenses** with category, amount, and split options
4. **View balances** to see who owes whom
5. **Settle up** using the minimized payment instructions

### Adding an Expense
1. Open a group and click "Add Expense"
2. Enter title, amount, and select category
3. Choose who paid and who to split with
4. Submit - balances update automatically!

## 🎨 Design System

**Colors:** Turquoise primary, Coral accents, with vacation-themed gradients

**Typography:** Poppins (headings) and Quicksand (body) for that tropical feel

**Components:** shadcn/ui with custom theming and elevation states

## 🔒 Security

- Bcrypt password hashing
- Session-based authentication with HTTP-only cookies
- Protected API routes with middleware
- Input validation with Zod schemas
- PostgreSQL session storage

## 🤝 Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR.

## 📝 License

MIT License - Open source and free to use

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Database powered by [Neon](https://neon.tech)

---

Made with 🏝️ for vacation vibes and easy expense splitting!

# 🏖️ TravelSplit - Vacation Expense Splitter

A beautiful, vacation-themed expense splitting app that makes tracking shared costs fun and easy! Built with a tropical aesthetic perfect for group trips, vacations, and shared adventures.

![TravelSplit](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Features

### 💰 Smart Expense Management
- **Create Groups** - Organize expenses by trip, event, or group of friends
- **Add Expenses** - Track who paid and split costs equally or custom amounts
- **Category Icons** - Categorize expenses with beautiful icons (Food, Transport, Accommodation, Entertainment, Other)
- **Real-time Balance Tracking** - See who owes whom at a glance

### 🎯 Smart Settlement Algorithm
- **Minimized Transactions** - Automatically calculates the minimum number of payments needed to settle all balances
- **Clear Settlement Instructions** - Visual breakdown showing exactly who should pay whom
- **Balance Summary Page** - Dedicated page with comprehensive settlement details

### 🎨 Beautiful UI/UX
- **Tropical Theme** - Vacation vibes with turquoise, coral, and playful typography
- **Dark Mode** - Full support for light and dark themes with smooth transitions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Custom Fonts** - Poppins and Quicksand for that vacation feel

### 👥 User Management
- **Replit Auth** - Secure authentication with Google, GitHub, and email support
- **Contact Management** - Add friends and contacts for easy group creation
- **Profile Integration** - User profiles with avatars and names

### 🚀 Next Phase Features (Coming Soon)
- **Expense Editing & Deletion** - Modify or remove expenses after creation
- **Interactive Charts** - Pie charts showing expense breakdown by category or member
- **Advanced Filters** - Search and filter expenses by date, amount, or category
- **PDF Export** - Download complete expense reports and settlement summaries

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for lightning-fast development and builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for powerful server state management
- **shadcn/ui** component library built on Radix UI
- **Tailwind CSS** for utility-first styling

### Backend
- **Express.js** for RESTful API server
- **PostgreSQL** via Neon serverless for data persistence
- **Drizzle ORM** for type-safe database queries
- **Passport.js** with Replit Auth for authentication
- **Session-based auth** with PostgreSQL session storage

### Development
- **TypeScript** throughout for end-to-end type safety
- **Zod** for runtime validation and schema parsing
- **ESBuild** for production server bundling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Replit's built-in database)
- Replit account for authentication setup

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KarunyaKalk/TravelSplit.git
cd TravelSplit
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file or use Replit Secrets with:
```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_secret_key
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📁 Project Structure

```
TravelSplit/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, GroupDetail, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app component
│   └── index.html
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations layer
│   ├── replitAuth.ts       # Authentication setup
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schema + Zod validators
└── package.json
```

## 🎮 Usage

### Creating Your First Group

1. **Sign In** - Use Google, GitHub, or email via Replit Auth
2. **Add Contacts** - Search for friends by email and add them
3. **Create a Group** - Click "Create Group" and give it a name
4. **Add Members** - Add your contacts to the group
5. **Add Expenses** - Start tracking shared costs!

### Adding an Expense

1. Click **"Add Expense"** in a group
2. Enter the expense title (e.g., "Dinner at Beach Restaurant")
3. Enter the amount
4. Select a category (Food, Transport, etc.)
5. Choose who paid
6. Select who to split with
7. Submit and watch balances update automatically!

### Settling Up

1. Click **"View All Balances"** in a group
2. See your personal balance (owed or owing)
3. View settlement instructions showing minimum payments needed
4. Follow the payment flow: Person A → Person B: ₹X

## 🎨 Design System

### Colors
- **Primary**: Turquoise/Teal (`#14B8A6`)
- **Accent**: Coral/Orange (`#FB923C`)
- **Background**: Light gradients with tropical hints
- **Text**: Hierarchical with muted-foreground for secondary info

### Typography
- **Display**: Poppins (headings, important text)
- **Body**: Quicksand (general content)
- **Spacing**: Consistent small/medium/large scale

### Components
All components follow shadcn/ui patterns with custom tropical theming and hover/active elevation states for interactive elements.

## 🔒 Security

- **Session-based authentication** with secure HTTP-only cookies
- **PostgreSQL session storage** for scalable session management
- **Protected API routes** with authentication middleware
- **Input validation** using Zod schemas on both client and server
- **CSRF protection** via session middleware

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Database powered by [Neon](https://neon.tech)

## 📧 Contact

Karunya Kalk - [@KarunyaKalk](https://github.com/KarunyaKalk)

Project Link: [https://github.com/KarunyaKalk/TravelSplit](https://github.com/KarunyaKalk/TravelSplit)

---

Made with 🏝️ for vacation vibes and easy expense splitting!

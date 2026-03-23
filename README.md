# RSS Reader

A modern, full-stack RSS reader web application. Subscribe to RSS feeds, organize them into folders, and read articles in a clean list view.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Prisma ORM with SQLite (upgradeable to PostgreSQL)
- **State Management**: TanStack React Query + React Context API

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd rss
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your secrets (JWT_SECRET, Google OAuth credentials)
   ```

3. **Set up the database**
   ```bash
   npm run db:push              # Create database tables
   npm run db:seed              # Seed with demo data
   ```

4. **Start development servers**
   ```bash
   npm run dev                  # Starts both backend (:3001) and frontend (:5173)
   ```

5. **Open** [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | demo@example.com   |
| Password | password123        |

## Project Structure

```
rss/
├── server/                 # Express backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed script
│   └── src/
│       ├── index.ts        # App entry point
│       ├── middleware/      # Auth middleware
│       ├── routes/          # API routes (auth, feeds, folders, articles)
│       ├── services/        # Feed parser & refresher
│       ├── lib/             # Prisma client
│       └── __tests__/       # Backend tests
├── web/                    # React frontend
│   └── src/
│       ├── api/            # Axios client & API functions
│       ├── components/     # UI components
│       ├── contexts/       # Auth context
│       ├── hooks/          # React Query hooks
│       └── __tests__/      # Frontend tests
├── docs/
│   └── TESTS.md            # Test documentation
├── package.json            # Root workspace config
└── README.md
```

## Key Features

- 📧 Email/password & Google OAuth authentication
- 📁 Organize feeds into folders
- 📰 Expandable article list view with inline reading
- 🔍 Search articles
- ✅ Mark as read/unread, mark all read
- 🔄 Automatic feed refresh (every 15 minutes)
- 📱 Mobile responsive

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers in development mode |
| `npm test` | Run all tests |
| `npm run build` | Build for production |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with demo data |

## Upgrading to PostgreSQL

1. Update `server/prisma/schema.prisma`:
   ```diff
   datasource db {
   -  provider = "sqlite"
   +  provider = "postgresql"
      url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string.
3. Run `npm run db:push` to apply.

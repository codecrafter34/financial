# 🏦 Intelligent Finance Control System (IFCS)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

> A production-grade financial data processing and access control dashboard featuring **event-driven architecture**, **AI-powered insights**, **role-based intelligence**, and a **modern glassmorphism UI**.

---

## 🎯 Overview

IFCS is not a typical CRUD dashboard. It's designed as an **intelligent financial control system** that:

- **Behaves differently per role** - API responses and UI adapt based on user permissions
- **Detects anomalies automatically** - Rule-based AI flags unusual spending patterns
- **Tracks every action as an event** - Enabling a rich activity timeline
- **Calculates financial health scores** - Quantifies user financial habits

---

## ✨ Key Features

### 🔐 Advanced Role-Based Access Control (RBAC++)

| Role | Capabilities |
|------|-------------|
| **Viewer** | Read-only access to transactions, basic summary |
| **Analyst** | Full analytics, insights, trends, health scores |
| **Admin** | Full CRUD, user management, "View As" mode |

### 🤖 AI Insight Engine (Rule-Based)

- **Anomaly Detection**: Uses z-score and percentile analysis
- **Spending Insights**: "Your expenses increased 18% this week"
- **Category Analysis**: Identifies highest spending categories
- **Trend Prediction**: Compares weekly/monthly patterns

### 📊 Financial Health Score (0-100)

Calculated based on:
- **Income/Expense Ratio** (40% weight)
- **Spending Consistency** (30% weight)
- **Anomaly Frequency** (30% weight)

### 📜 Event-Driven Activity Timeline

Every action is stored as an immutable event:
```
USER_LOGIN → TRANSACTION_CREATED → ANOMALY_DETECTED → INSIGHT_GENERATED
```

### 🎭 Permission Simulation Mode

Admins can preview the system as any role:
```
Header: X-View-As-Role: VIEWER
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Dashboard │ │ Timeline │ │ Insights │ │ Admin Panel      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ API
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Middleware Layer                      │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │    │
│  │  │ Auth Guard │ │ RBAC Guard │ │ Rate Limiter       │   │    │
│  │  └────────────┘ └────────────┘ └────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Service Layer                         │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │    │
│  │  │ User Svc   │ │ Transaction│ │ Analytics Service  │   │    │
│  │  │            │ │ Service    │ │ + AI Engine        │   │    │
│  │  └────────────┘ └────────────┘ └────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL + Prisma                        │
│  ┌────────┐ ┌─────────────┐ ┌────────┐ ┌──────────────────┐    │
│  │ Users  │ │ Transactions│ │ Events │ │ Permissions      │    │
│  └────────┘ └─────────────┘ └────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
finance-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── transactions/  # Transactions page
│   │   │   ├── analytics/     # Analytics page
│   │   │   ├── timeline/      # Activity timeline
│   │   │   └── admin/         # Admin panel
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── transactions/  # Transaction CRUD
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   └── events/        # Event timeline
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   └── charts/            # Chart components
│   ├── lib/
│   │   ├── auth.ts            # Auth utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── store.ts           # Zustand store
│   │   ├── api.ts             # React Query hooks
│   │   └── utils.ts           # Utilities
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT verification
│   │   └── rbac.middleware.ts # Role-based access
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── transaction.service.ts
│   │   ├── analytics.service.ts
│   │   ├── event.service.ts
│   │   └── ai-engine.service.ts
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── validations/
│       └── schemas.ts         # Zod schemas
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## 🗃️ Database Schema

### User Model
```prisma
model User {
  id           String      @id @default(cuid())
  email        String      @unique
  password     String
  name         String
  role         Role        @default(VIEWER)
  status       UserStatus  @default(ACTIVE)
  lastActiveAt DateTime?
  lastAction   String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

enum Role {
  VIEWER
  ANALYST
  ADMIN
}
```

### Transaction Model
```prisma
model Transaction {
  id            String          @id @default(cuid())
  userId        String
  amount        Float
  type          TransactionType
  category      Category
  date          DateTime        @default(now())
  notes         String?
  tags          String[]        @default([])
  isAnomaly     Boolean         @default(false)
  anomalyReason String?
  anomalyScore  Float?
  isDeleted     Boolean         @default(false)
  deletedAt     DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

enum Category {
  SALARY, FREELANCE, INVESTMENT, FOOD, TRANSPORT,
  UTILITIES, ENTERTAINMENT, HEALTHCARE, SHOPPING,
  EDUCATION, TRAVEL, OTHER
}
```

### Event Model (Event Sourcing)
```prisma
model Event {
  id         String      @id @default(cuid())
  userId     String
  entityType String
  entityId   String
  action     EventAction
  payload    Json?
  metadata   Json?
  createdAt  DateTime    @default(now())
}

enum EventAction {
  USER_REGISTERED, USER_LOGIN, USER_LOGOUT,
  TRANSACTION_CREATED, TRANSACTION_UPDATED, TRANSACTION_DELETED,
  ANOMALY_DETECTED, INSIGHT_GENERATED
}
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Transactions

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/transactions` | VIEWER+ | List transactions |
| POST | `/api/transactions` | ADMIN | Create transaction |
| GET | `/api/transactions/:id` | VIEWER+ | Get transaction |
| PATCH | `/api/transactions/:id` | ADMIN | Update transaction |
| DELETE | `/api/transactions/:id` | ADMIN | Soft delete |

### Analytics

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/analytics/summary` | VIEWER+ | Get summary (role-filtered) |
| GET | `/api/analytics/trends` | ANALYST+ | Get trend data |
| GET | `/api/analytics/health-score` | ANALYST+ | Get health score |
| GET | `/api/analytics/insights` | ANALYST+ | Get AI insights |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get activity timeline |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Edit .env with your database credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/ifcs?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

4. **Setup database**
```bash
# Create database (if using psql)
createdb ifcs

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ifcs.com | Admin123! |
| Analyst | analyst@ifcs.com | Analyst123! |
| Viewer | viewer@ifcs.com | Viewer123! |

---

## 🎨 UI/UX Highlights

### Dark Theme Glassmorphism

- Semi-transparent glass cards with blur effects
- Subtle gradient backgrounds
- Smooth hover animations
- Consistent color palette

### Story-Driven Interface

- Timeline-based activity feed (like GitHub)
- Insight cards with AI-generated text
- Interactive charts with Recharts
- Real-time health score visualization

### Responsive Design

- Mobile-first approach
- Collapsible sidebar navigation
- Adaptive grid layouts

---

## 🔒 Security Features

- **JWT Authentication** - Stateless, secure tokens
- **Password Hashing** - bcrypt with 12 rounds
- **Input Validation** - Zod schemas on all endpoints
- **RBAC Middleware** - Permission-based route protection
- **Soft Delete** - Data recovery capability
- **XSS Prevention** - Input sanitization

---

## 📚 API Examples

### Login Request
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ifcs.com", "password": "Admin123!"}'
```

### Get Summary (with role simulation)
```bash
curl http://localhost:3000/api/analytics/summary \
  -H "Authorization: Bearer <token>" \
  -H "X-View-As-Role: VIEWER"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "type": "EXPENSE",
    "category": "FOOD",
    "notes": "Grocery shopping",
    "tags": ["essential", "recurring"]
  }'
```

---

## 🤔 Design Decisions

### Why Event Sourcing Lite?

Instead of just storing current state, every mutation creates an event. This enables:
- Complete audit trail
- Activity timeline reconstruction
- Easy debugging
- Future analytics possibilities

### Why Role-Aware API Responses?

Different roles need different data:
- **Viewer**: Only sees totals, no detailed breakdown
- **Analyst**: Full analytics but no user management
- **Admin**: Everything + "View As" capability

### Why Rule-Based AI Instead of LLM?

- **Predictable**: Same inputs → same outputs
- **Fast**: No API latency
- **Free**: No token costs
- **Transparent**: Rules are explainable

---

## 📈 Performance Considerations

- **Prisma Query Optimization** - Selective includes, pagination
- **React Query Caching** - Stale-while-revalidate
- **Zustand Persistence** - LocalStorage for auth state
- **Dynamic Imports** - Code splitting for charts

---

## 🔮 Future Enhancements

- [ ] Natural language query ("Show food expenses last week")
- [ ] Export to PDF/CSV
- [ ] Budget tracking and alerts
- [ ] Multi-currency support
- [ ] Dark/Light theme toggle
- [ ] WebSocket real-time updates

---

## 📄 License

MIT License

---

<div align="center">
  <strong>Built with ❤️ for the Backend Internship Assignment</strong>
  <br>
  <em>Designed to stand out from 100 identical submissions</em>
</div>

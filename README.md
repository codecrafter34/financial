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

## 🤔 Technical Decisions and Trade-offs

### **1. Event Sourcing Lite**

**Decision**: Store every state change as an immutable event in the Event table

**Rationale**:
- ✅ Complete audit trail for compliance and debugging
- ✅ Enables activity timeline reconstruction (like GitHub)
- ✅ Separates concerns: mutations create events, queries read projections
- ✅ Future-proof for analytics and behavioral analysis

**Trade-off**: 
- ⚠️ Extra database writes per transaction
- ⚠️ Event table grows indefinitely (requires archival strategy)

**When to use**: Systems requiring compliance, detailed audit trails, or complex business intelligence

---

### **2. Role-Aware API Responses**

**Decision**: Different roles receive different data structures from the same endpoint

```javascript
// Same endpoint, different responses based on role
GET /api/analytics/summary
- VIEWER: { total_income, total_expense }
- ANALYST: { total_income, total_expense, by_category, trends }
- ADMIN: { all of above + user_id, audit_metadata }
```

**Rationale**:
- ✅ Single source of truth (one endpoint per resource)
- ✅ Seamless role transitions (no client-side filtering needed)
- ✅ Reduces frontend complexity
- ✅ Enforces authorization at API level (more secure)

**Trade-off**: 
- ⚠️ More complex backend logic (conditional field inclusion)
- ⚠️ Harder to document (responses vary)

**When to use**: Multi-tenant systems with strict role separations

---

### **3. Rule-Based AI Over LLMs**

**Decision**: Use statistical anomaly detection (z-score, percentiles) instead of calling external AI APIs

```javascript
// Rule-based: Fast, free, explainable
anomalyScore = zscore(transaction_amount, category_mean, category_std)
if (zscore > 2.5) flag as anomaly

// vs. LLM approach: "Describe this spending pattern..."
```

**Rationale**:
- ✅ **Predictable**: Same inputs always produce same outputs
- ✅ **Fast**: <5ms vs. 500ms+ for LLM API
- ✅ **Free**: No token costs
- ✅ **Transparent**: Non-technical users understand "3 standard deviations"
- ✅ **Offline**: Works without external dependencies

**Trade-off**: 
- ⚠️ Less sophisticated insights (no natural language generation)
- ⚠️ Limited to statistical patterns (misses context)

**When to use**: Real-time applications, cost-sensitive systems, or when explainability > accuracy

---

### **4. MongoDB Over PostgreSQL**

**Decision**: Using MongoDB (originally was PostgreSQL in docs, now using MongoDB Atlas)

**Rationale**:
- ✅ **Flexible schema**: Categories and tags stored as arrays natively
- ✅ **JSON native**: Analytics cache and event payload stored as native JSON
- ✅ **Scalability**: Horizontal scaling easier for event streams
- ✅ **Nested data**: Event metadata with complex structures

**Trade-off**: 
- ⚠️ No ACID transactions (less strict consistency)
- ⚠️ No foreign key constraints (data integrity depends on app logic)
- ⚠️ Higher storage (denormalization)

**When to use**: Content-heavy apps, event systems, or when schema flexibility matters

---

### **5. Zustand + LocalStorage for Auth State**

**Decision**: Persist JWT tokens to browser localStorage with Zustand middleware

```javascript
// Token persists across page reloads
const token = useAuthStore(state => state.token)
// Loaded from localStorage on app start
```

**Rationale**:
- ✅ **Simpler**: No session backend needed
- ✅ **Stateless**: Server doesn't track sessions
- ✅ **Mobile-friendly**: Works with PWAs
- ✅ **Faster SSR**: No server session lookup

**Trade-off**: 
- ⚠️ **XSS vulnerability**: Token exposed to JavaScript (use httpOnly in production)
- ⚠️ **Manual refresh**: No automatic token refresh on expiry
- ⚠️ **No logout force**: Old tokens remain valid until expiry

**Mitigation**: 
- Use `sameSite: strict` and CSP headers
- Implement token rotation on refresh
- Short JWT expiry (15 min), long refresh token (7 days)

**When to use**: SPAs, mobile apps, or when session backend is unavailable

---

### **6. Prisma ORM with MongoDB**

**Decision**: Use Prisma for type-safe database access to MongoDB

```prisma
model User {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  transactions Transaction[]
}
```

**Rationale**:
- ✅ **Type safety**: Full TypeScript inference
- ✅ **Migrations**: Schema versioning with Prisma Migrate
- ✅ **Query builder**: No raw MongoDB queries needed
- ✅ **Relations**: Automatic JOIN simulation

**Trade-off**: 
- ⚠️ **Performance**: Extra abstraction layer (slower than native drivers)
- ⚠️ **Limited aggregations**: Can't use MongoDB's full $group/$facet
- ⚠️ **N+1 queries**: Eager loading needed for relations

**When to use**: Rapid development, small-to-medium scale apps, or team consistency

---

### **7. Soft Deletes (isDeleted, deletedAt)**

**Decision**: Mark records as deleted instead of removing them

```prisma
// Don't delete: 
DELETE FROM transactions WHERE id = '123'

// Instead:
UPDATE transactions SET isDeleted = true, deletedAt = NOW() WHERE id = '123'
```

**Rationale**:
- ✅ **Data recovery**: Restore deleted transactions if needed
- ✅ **Audit**: Know when and by whom data was deleted
- ✅ **Cascading safety**: Prevent orphaned records

**Trade-off**: 
- ⚠️ **Query complexity**: Every query needs `WHERE isDeleted = false`
- ⚠️ **Storage overhead**: Keeps deleted data forever
- ⚠️ **Privacy issues**: Can't truly delete user data (GDPR)

**Mitigation**: 
- Add archival process: Move old deleted records to separate table
- Implement hard delete for GDPR compliance
- Use database views to hide soft-deleted rows

**When to use**: Systems requiring audit trails or frequent accidental deletions

---

### **8. Tailwind CSS with CSS Variables**

**Decision**: Use Tailwind with CSS custom properties for theming

```css
/* globals.css */
:root {
  --primary: rgb(139, 92, 246);
  --background: rgb(17, 24, 39);
}

/* JSX */
<div className="bg-[var(--background)] text-[var(--primary)]" />
```

**Rationale**:
- ✅ **Easy theming**: Change colors in CSS, not JSX
- ✅ **Runtime switching**: Dark/Light mode toggle works
- ✅ **Utility-first**: Keeps Tailwind benefits
- ✅ **Glassmorphism**: Semi-transparent effects work better with CSS vars

**Trade-off**: 
- ⚠️ **Build complexity**: Mixing utility classes + vars
- ⚠️ **Bundle size**: Extra CSS for theme support
- ⚠️ **Browser support**: Variables not IE 11

**When to use**: Modern browsers, apps needing dark mode, or design system consistency

---

### **9. "View As Role" Admin Feature**

**Decision**: Allow admins to preview the system as any role

```javascript
// Admin can send header:
X-View-As-Role: VIEWER

// API responses adapt:
// Same data structure as VIEWER sees
```

**Rationale**:
- ✅ **Empathy testing**: Admins understand user experience
- ✅ **Debugging**: Reproduce role-specific bugs
- ✅ **Demo mode**: Show stakeholders what users see
- ✅ **No new code**: Reuses existing RBAC logic

**Trade-off**: 
- ⚠️ **Security**: Could be abused if not properly logged
- ⚠️ **Testing burden**: Must verify all role transitions

**Mitigation**: 
- Log all "View As" requests to audit trail
- Only allow ADMIN role to use this feature
- Require explicit confirmation

**When to use**: Admin dashboards, multi-tenant systems, or complex UX testing

---

### **Summary Table**

| Decision | Benefit | Risk | Alternative |
|----------|---------|------|-------------|
| Event Sourcing | Audit trail | DB bloat | Direct updates |
| Role-aware API | Simplicity | Complex logic | Separate endpoints |
| Rule-based AI | Speed | Less sophisticated | LLM API |
| MongoDB | Flexibility | Consistency | PostgreSQL |
| JWT + LocalStorage | Stateless | XSS risk | Session cookies |
| Prisma ORM | Type safety | Performance | Raw queries |
| Soft deletes | Recovery | Storage | Hard deletes |
| Tailwind + CSS vars | Easy theming | Build complexity | Styled-components |
| View As Role | Better UX | Security | Role-specific UI |

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

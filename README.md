# Buyer Lead Intake App 🏠

A comprehensive real estate buyer lead management system built with Next.js 14, TypeScript, and Supabase. This application allows users to capture, manage, and track buyer leads with advanced features like CSV import/export, server-side filtering, and complete audit history.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)

### Local Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd buyer-lead-app
   npm install
   ```

2. **Database Setup (Supabase)**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → Database → Connection String
   - Copy the URI connection string

3. **Environment Variables**
   ```bash
   # Create .env.local file with:
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   RUN_MIGRATIONS="false"
   ```

4. **Database Migration & Seeding**
   ```bash
   # Push schema to database
   npx drizzle-kit push
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Use demo login (any email/password works)
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode

# Database commands
npm run db:generate  # Generate new migration
npm run db:seed      # Seed database with sample data
npx drizzle-kit push # Push schema changes to database
```

## 🏗 Architecture & Design Decisions

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL via Supabase, Drizzle ORM
- **Validation**: Zod (client + server-side)
- **Forms**: React Hook Form with Zod resolver
- **UI Components**: Radix UI primitives
- **Testing**: Jest with unit tests

### Validation Strategy
**Dual validation approach for maximum reliability:**
- **Client-side**: React Hook Form + Zod for instant feedback
- **Server-side**: Zod schemas in API routes for security
- **Shared schemas**: Reused between client and server
- **Business rules**: BHK required for Apartment/Villa, budgetMax ≥ budgetMin

### SSR vs Client Architecture
**Server-Side Rendering (SSR) Implementation:**
- **Real pagination**: Server-side filtering and pagination (10 items per page)
- **URL synchronization**: All filters, search, and pagination reflected in URL
- **SEO-friendly**: Shareable filtered views
- **Performance**: Efficient database queries with proper indexing

**Client-side interactions:**
- Form validation and submission
- Optimistic UI updates
- Interactive filtering (debounced search)

### Ownership Enforcement
**Multi-level security approach:**
- **Database level**: Foreign key constraints
- **API level**: Server-side ownership checks on all mutations
- **UI level**: Conditional rendering based on ownership
- **Role-based**: Users edit own leads, admins can edit all

### Data Flow
1. **Client**: React Hook Form validates input immediately
2. **API Routes**: Server validates with Zod before database operations
3. **Database**: Drizzle ORM ensures type-safe queries
4. **Audit Trail**: Automatic change tracking in buyer_history table
5. **Response**: Proper error handling and user feedback

## 📊 Database Schema

### Buyers Table
```sql
CREATE TABLE buyers (
  id UUID PRIMARY KEY,
  fullName VARCHAR(80) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,
  city ENUM('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'),
  propertyType ENUM('Apartment', 'Villa', 'Plot', 'Office', 'Retail'),
  bhk ENUM('1', '2', '3', '4', 'Studio'),
  purpose ENUM('Buy', 'Rent'),
  budgetMin INTEGER,
  budgetMax INTEGER,
  timeline ENUM('0-3m', '3-6m', '>6m', 'Exploring'),
  source ENUM('Website', 'Referral', 'Walk-in', 'Call', 'Other'),
  status ENUM('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'),
  notes TEXT(1000),
  tags JSON,
  ownerId VARCHAR(50),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Buyer History Table
```sql
CREATE TABLE buyer_history (
  id UUID PRIMARY KEY,
  buyerId UUID REFERENCES buyers(id),
  changedBy VARCHAR(50),
  changedAt TIMESTAMP DEFAULT NOW(),
  diff JSON
);
```

## 🔒 Security Features

- **Input Validation**: All inputs validated on both client and server
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Rate Limiting**: Prevents abuse of create/update endpoints (5 requests/minute)
- **Ownership Checks**: Users can only access their own data
- **XSS Prevention**: Proper data escaping in CSV exports
- **Concurrency Control**: Optimistic locking prevents data conflicts

## 📈 Features Overview

### Core Functionality
✅ **CRUD Operations**: Complete create, read, update, delete for buyer leads
✅ **Advanced Search**: Filter by city, property type, status, timeline, and text search
✅ **Real Pagination**: Server-side pagination with URL synchronization
✅ **CSV Import/Export**: Bulk operations with validation and error reporting
✅ **Audit History**: Complete change tracking with diff visualization
✅ **Concurrency Control**: Optimistic locking prevents data conflicts

### Technical Features
✅ **Server-Side Rendering**: Real pagination and filtering
✅ **URL-Synced Filters**: Shareable filtered views
✅ **Form Validation**: Real-time client + server validation
✅ **Rate Limiting**: API protection against abuse
✅ **Error Boundaries**: Graceful error handling
✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
✅ **Responsive Design**: Works on desktop, tablet, and mobile

### Authentication & Authorization
✅ **Demo Authentication**: Simple email/password for easy evaluation
✅ **Role-based Access**: Owner-based permissions
✅ **Session Management**: Secure login/logout flow

## 🧪 Testing

**Unit Tests Coverage:**
- Validation schemas and business rules
- CSV import/export logic
- Budget validation edge cases
- BHK requirement logic

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode for development
```

## 📁 CSV Import/Export

### Import Features
- **Batch Processing**: Up to 200 rows per import
- **Row-by-row Validation**: Shows specific errors for each invalid row
- **Transactional**: All-or-nothing import (fails if any row is invalid)
- **Error Reporting**: Detailed validation messages with row numbers

### Export Features
- **Filtered Export**: Respects current search and filter settings
- **Proper CSV Format**: RFC 4180 compliant
- **Data Integrity**: Proper escaping of special characters

### CSV Format
```csv
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
John Doe,john@example.com,9876543210,Chandigarh,Apartment,2,Buy,4500000,5500000,3-6m,Website,Looking for 2BHK,"urgent,family",New
```

## ♿ Accessibility

- **ARIA Labels**: All form fields properly labeled
- **Keyboard Navigation**: Full keyboard accessibility throughout
- **Screen Reader Support**: Form errors announced properly
- **Focus Management**: Logical tab order and focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Color Contrast**: WCAG AA compliant color schemes

## 🚀 Production Deployment

### Vercel Deployment

1. **Environment Variables in Vercel Dashboard:**
   ```
   DATABASE_URL=your-supabase-connection-string
   RUN_MIGRATIONS=false
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### Database Setup for Production
- Supabase automatically handles connection pooling and scaling
- No additional migration steps needed (schema already applied)
- Production database uses the same connection string format

## 📋 Assignment Compliance

### ✅ All Must-Have Requirements Completed

**Stack Requirements:**
- ✅ Next.js 14 (App Router) + TypeScript
- ✅ PostgreSQL/Supabase with Drizzle ORM + migrations
- ✅ Zod validation (client + server)
- ✅ Demo authentication system
- ✅ Meaningful Git commits

**Data Model:**
- ✅ Complete buyers table with all required fields
- ✅ buyer_history table with change tracking
- ✅ All enum constraints and validation rules

**Core Functionality:**
- ✅ Create Lead (`/buyers/new`) with conditional BHK validation
- ✅ List & Search (`/buyers`) with SSR pagination and URL-synced filters
- ✅ View & Edit (`/buyers/[id]`) with concurrency control
- ✅ CSV Import/Export with transaction support and error reporting

**Quality Standards:**
- ✅ Unit tests for validation logic
- ✅ Rate limiting on create/update operations
- ✅ Error boundaries and empty states
- ✅ Accessibility basics (ARIA, keyboard, focus management)
- ✅ Ownership enforcement at API level

### 🎯 Nice-to-Haves Implemented

- ✅ **Tag chips with typeahead**: Dynamic tag input with suggestions
- ✅ **Status quick-actions**: Dropdown status updates in table view with ownership validation
- ✅ **Full-text search**: Search across fullName, email, and notes with debounced input
- ✅ **Optimistic updates**: Immediate UI feedback with rollback
- ✅ **Ownership indicators**: "Mine"/"Other" badges for lead ownership visibility
- ✅ **Input field bug fixes**: Resolved controlled component issues with number inputs

## 🔄 What's Implemented vs Skipped

### ✅ Fully Implemented
- **Core CRUD**: All create, read, update, delete operations
- **Advanced Filtering**: Multi-field filters with URL synchronization
- **CSV Operations**: Import/export with comprehensive validation
- **Real-time Validation**: Instant feedback on form inputs
- **Concurrency Control**: Optimistic locking prevents conflicts
- **Complete Audit Trail**: Full change history with diffs
- **Responsive Design**: Mobile-first approach
- **Accessibility Features**: WCAG guidelines compliance
- **Server-side Rendering**: SEO-friendly with real pagination
- **Rate Limiting**: API protection
- **Error Handling**: Comprehensive error boundaries

### 🎯 Simplified for Demo (Production-Ready Alternatives Available)
- **Authentication**: Demo login instead of magic links
  - *Why*: Easier for evaluation, but production would use NextAuth.js or Supabase Auth
- **File Storage**: In-memory CSV processing
  - *Why*: Demo simplicity, production would use cloud storage
- **Rate Limiting**: Basic in-memory implementation
  - *Why*: Production would use Redis with sliding window

### 🚀 Future Enhancements (Out of Scope)
- Magic link authentication with email verification
- Real-time notifications and updates
- Advanced analytics dashboard
- File attachment support
- Email notification system
- Bulk operations (edit multiple leads)
- Advanced reporting and charts
- Integration with CRM systems

## 🛠 Development Notes

### Project Structure
```
/app                 # Next.js App Router pages
  /api               # API routes with validation
  /buyers            # Buyer management pages
/lib                 # Shared utilities
  /db                # Database schema and seed data
  /validations       # Zod schemas
/components          # Reusable UI components
/drizzle             # Database migrations
```

### Code Quality
- **TypeScript**: Strict mode enabled throughout
- **ESLint**: Next.js recommended rules + custom rules
- **Prettier**: Consistent code formatting
- **Git**: Meaningful commit messages with conventional commits format
- **Error Handling**: Comprehensive try-catch with user-friendly messages

---

**Built with ❤️ for modern real estate lead management**

*This project demonstrates full-stack TypeScript development with modern best practices, comprehensive validation, and production-ready architecture.*

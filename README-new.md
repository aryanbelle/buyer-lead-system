# Buyer Lead Intake App

A comprehensive buyer lead management system built with Next.js, TypeScript, and SQLite. This application allows users to capture, manage, and track real estate buyer leads with advanced features like CSV import/export, filtering, and audit history.

## 🚀 Features

### Core Functionality
- **Lead Management**: Create, view, edit, and delete buyer leads
- **Advanced Search & Filtering**: Filter by city, property type, status, timeline, and more
- **CSV Import/Export**: Bulk import up to 200 leads with validation, export filtered results
- **Audit History**: Track all changes to buyer records with timestamps
- **Authentication**: Demo login system with role-based access
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Server-Side Rendering (SSR)**: Real pagination and filtering on the server
- **URL-Synced Filters**: Shareable filtered views
- **Concurrency Control**: Optimistic locking to prevent data conflicts
- **Rate Limiting**: Prevents abuse of create/update operations
- **Data Validation**: Comprehensive client and server-side validation with Zod
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Better-SQLite3
- **ORM**: Drizzle ORM with migrations
- **Validation**: Zod schemas
- **UI**: Radix UI components with Tailwind CSS
- **Forms**: React Hook Form with Zod resolver
- **Testing**: Jest with unit tests

## 🏗 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buyer-lead-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Database Setup**
   ```bash
   # Generate database schema
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000
   - Use demo login (any email/password will work)

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run Jest tests
npm run test:watch # Run tests in watch mode

# Database commands
npm run db:generate # Generate new migration
npm run db:migrate  # Apply migrations
npm run db:seed     # Seed database with sample data
```

## 📊 Database Schema

### Buyers Table
- `id`: UUID primary key
- `fullName`: String (2-80 chars)
- `email`: Optional email
- `phone`: String (10-15 digits)
- `city`: Enum (Chandigarh|Mohali|Zirakpur|Panchkula|Other)
- `propertyType`: Enum (Apartment|Villa|Plot|Office|Retail)
- `bhk`: Optional enum (1|2|3|4|Studio) - required for Apartment/Villa
- `purpose`: Enum (Buy|Rent)
- `budgetMin/budgetMax`: Optional integers
- `timeline`: Enum (0-3m|3-6m|>6m|Exploring)
- `source`: Enum (Website|Referral|Walk-in|Call|Other)
- `status`: Enum (New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
- `notes`: Optional text (≤1000 chars)
- `tags`: JSON array of strings
- `ownerId`: User ID
- `updatedAt`: Timestamp

### Buyer History Table
- `id`: UUID primary key
- `buyerId`: Foreign key to buyers
- `changedBy`: User ID who made changes
- `changedAt`: Timestamp
- `diff`: JSON object tracking field changes

## 🏛 Architecture & Design Decisions

### Validation Strategy
- **Dual Validation**: Client-side with React Hook Form + Zod, server-side with Zod schemas
- **Schema Reuse**: Shared validation schemas between client and server
- **Business Rules**: BHK required for Apartment/Villa, budgetMax ≥ budgetMin

### Data Flow
1. **Client**: React Hook Form validates on input
2. **API Routes**: Server validates with Zod before database operations
3. **Database**: SQLite with Drizzle ORM for type-safe queries
4. **History**: Automatic change tracking for audit trail

### Authentication & Authorization
- **Demo System**: Simple email/password (development friendly)
- **Role-based**: Users can only edit their own leads (admins can edit all)
- **Ownership Enforcement**: Server-side checks on all mutations

### SSR Implementation
- **Real Pagination**: Server-side filtering and pagination (page size 10)
- **URL Synchronization**: Filters and search terms reflected in URL
- **SEO Friendly**: Server-rendered content with proper meta tags

### Concurrency Control
- **Optimistic Locking**: Uses `updatedAt` timestamp
- **Conflict Resolution**: Returns 409 status with user-friendly message
- **Data Integrity**: Prevents lost updates in multi-user scenarios

### CSV Operations
- **Import**: Validates each row, shows errors by row number, transactional inserts
- **Export**: Respects current filters, properly escaped CSV format
- **Error Handling**: Comprehensive validation messages for import failures

## 🧪 Testing

- **Unit Tests**: Validation logic, business rules
- **Coverage**: Critical validation paths and edge cases
- **Run Tests**: `npm run test`

## 🔒 Security Features

- **Input Validation**: All inputs validated on client and server
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM  
- **Rate Limiting**: Prevents abuse of create/update endpoints
- **Ownership Checks**: Users can only access their own data
- **XSS Prevention**: Proper data escaping in CSV exports

## ♿ Accessibility

- **ARIA Labels**: All form fields properly labeled
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Form errors announced properly
- **Focus Management**: Logical tab order throughout app
- **Semantic HTML**: Proper heading hierarchy and landmarks

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
No external environment variables required - uses SQLite file database.

### Database Persistence
- Database file: `sqlite.db` in project root
- Automatically created on first run
- Includes migrations for schema evolution

## 📋 Assignment Compliance

✅ **Must Haves Completed**:
- Next.js App Router + TypeScript
- SQLite + Drizzle with migrations
- Zod validation (client & server)
- Demo authentication
- Complete CRUD operations
- URL-synced filters & search
- Real server-side pagination
- CSV import/export with validation
- Concurrency control
- Audit history
- Unit tests
- Rate limiting
- Error boundaries
- Accessibility basics

✅ **Quality Standards Met**:
- Meaningful Git commits
- TypeScript throughout
- Proper error handling
- Data validation on both sides
- Ownership enforcement

## 🔄 What's Implemented vs Skipped

### Fully Implemented
- All core CRUD operations
- Advanced filtering and search
- CSV import/export with row-by-row validation
- Real-time form validation
- Concurrency control with optimistic locking
- Complete audit trail
- Responsive design
- Accessibility features

### Simplified for Demo
- **Authentication**: Demo login instead of magic links (easier for evaluation)
- **Rate Limiting**: Basic implementation (production would use Redis)
- **File Storage**: In-memory for demo (production would use cloud storage)

### Future Enhancements
- Magic link authentication
- Email notifications
- Advanced analytics dashboard
- Bulk operations
- Real-time notifications
- File attachments

---

**Built with ❤️ for the buyer lead management assignment**

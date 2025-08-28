# Overview

EduPlan is a comprehensive academic planning and transfer pathway management system designed for community college students. The application helps students track their educational progress, plan course sequences, manage transfer requirements, and integrate with California's Assist.org transfer articulation system. Built as a full-stack web application, it provides tools for transcript management, course planning, prerequisite tracking, and deadline management to streamline the transfer process from community colleges to four-year universities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a simple, lightweight approach
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming, using a neutral color scheme with CSS variables
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Layout**: Dashboard-style interface with sidebar navigation and header, responsive design for mobile and desktop

## Backend Architecture
- **Server**: Express.js with TypeScript running in ESM mode
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Pattern**: Abstract storage interface (IStorage) with in-memory implementation, designed for easy database integration
- **API Design**: RESTful endpoints with consistent error handling and request/response logging
- **File Handling**: Multer middleware for document uploads (PDF, CSV, TXT) with size and type validation
- **Development**: Vite integration for hot module replacement and development server

## Data Architecture
- **Database Schema**: Comprehensive schema covering users, institutions, courses, education plans, planned semesters, documents, articulation agreements, deadlines, and activity logs
- **Type Safety**: Zod schemas for runtime validation with TypeScript types generated from Drizzle schema
- **Data Relationships**: Foreign key relationships between users and their academic data with proper referential integrity
- **Course Management**: Support for course prerequisites, transfer articulation, completion tracking, and categorization

## Authentication & Authorization
- **Current State**: Mock authentication system with demo user for development
- **Planned**: Session-based authentication with user account management
- **Data Isolation**: User-scoped data access patterns throughout the application

## Integration Architecture
- **Assist.org Integration**: API client for California's transfer articulation system with institution lookup and agreement fetching
- **Document Processing**: File upload system for transcripts and academic documents with metadata extraction
- **External APIs**: Designed to integrate with California Community College and UC/CSU systems

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL database driver for serverless deployment
- **drizzle-orm**: Type-safe PostgreSQL ORM with schema migrations
- **drizzle-kit**: Database migration and introspection tools
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Frontend Libraries  
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility
- **@hookform/resolvers**: React Hook Form integration with validation libraries
- **wouter**: Lightweight React router
- **axios**: HTTP client for API requests
- **date-fns**: Date manipulation and formatting utilities

## Development & Build Tools
- **vite**: Frontend build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Styling & UI
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **tailwind-merge**: Utility for merging Tailwind classes
- **cmdk**: Command palette component for search and navigation

## File Processing
- **multer**: Multipart form data handling for file uploads with security validation
- **File type restrictions**: PDF, CSV, and plain text files only with 10MB size limit

## Assist.org API Integration
- **Limited Access**: Educational institution API access required for live data
- **Fallback Strategy**: Mock data and manual entry options for development and testing
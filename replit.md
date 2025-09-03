# Replit.md

## Overview

SportbikeFL is a modern e-commerce platform for a motorcycle dealership specializing in sportbikes, parts, and accessories. The application features a customer-facing storefront with product catalog, shopping cart, and checkout functionality, alongside an owner dashboard for inventory management. Built with React, TypeScript, Express.js, and Drizzle ORM, it provides a complete solution for online motorcycle retail with real-time inventory tracking and discount management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Single-page application built with React 18 and TypeScript
- **Routing**: Client-side routing using Wouter for lightweight navigation
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for session management
- **Session Management**: Express-session with configurable storage for user authentication
- **In-Memory Storage**: Development storage layer with interface for easy database migration
- **File Organization**: Modular route handlers with separation of concerns between storage, routes, and server setup

### Database Schema
- **Products Table**: Core inventory with title, description, pricing, discounts, categories (motorcycles/parts/accessories), stock management, and image arrays
- **Users Table**: Owner authentication with username/password (currently hardcoded as ronnie123/ronnie123)
- **Cart Items Table**: Session-based shopping cart with product relationships and quantity tracking
- **Stock Management**: Real-time inventory tracking with status indicators (in_stock, sold, out_of_stock)

### Authentication & Authorization
- **Session-Based Auth**: Express sessions with configurable security settings
- **Owner Dashboard**: Protected routes requiring authentication for inventory management
- **Public Storefront**: Open access for browsing and cart functionality
- **Security Headers**: Configured for production with httpOnly cookies and CSRF protection

### Key Features
- **Product Catalog**: Category-based browsing with search, filtering, and sorting capabilities
- **Shopping Cart**: Persistent session-based cart with real-time price calculations
- **Discount System**: Flexible discount management with percentage or flat-rate discounts
- **Inventory Management**: Real-time stock tracking with sold/available status updates
- **Responsive Design**: Mobile-first design with adaptive layouts

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for production deployment
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant management for component styling
- **embla-carousel-react**: Touch-friendly carousel component for product galleries

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Form validation integration with Zod schemas

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **esbuild**: Fast JavaScript bundler for production builds
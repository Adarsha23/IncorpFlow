# Company Incorporation Tool

A professional, multi-step company incorporation platform designed for seamless onboarding and equity distribution management. This tool features a robust drafting system, persistence-first architecture, and a secured administrator dashboard.

## Overview

The platform allows users to initiate the incorporation process by providing primary company details. The platform automatically persists progress as a draft, allowing for recovery if the session is interrupted. The second phase involves dynamic equity distribution among shareholders, followed by finalization. Administrators can monitor all applications and metrics via a separate, password-protected portal.

## Technology Stack

### Backend

- Framework: FastAPI (Python 3.11+)
- ORM: SQLAlchemy 2.0
- Database: PostgreSQL (via Supabase)
- Validation: Pydantic v2
- Integration: Python-Dotenv

### Frontend

- Framework: React 18 with TypeScript
- Build Tool: Vite
- Styling: Plain CSS3 (Minimalist SaaS Design System)
- State Management: React Hooks (useState, useCallback, useEffect)
- Notifications: React Hot Toast
- HTTP Client: Axios

## Project Architecture

The project follows a modular layered architecture to ensure maintainability and scalability:

- Routers: Handle API endpoints and request/response serialization.
- Services: Contain the business logic and coordinate between repositories.
- Repositories: Direct data access layer for database operations.
- Models: SQLAlchemy database definitions.
- Schemas: Pydantic models for type safety and data validation.

## Setup Instructions

### 1. Database Configuration

The project is optimized for PostgreSQL.

1. Create a PostgreSQL database (e.g., via Supabase or local instance).
2. Execute the initialization script located at `backend/schema.sql` to create the required tables and triggers.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # For Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (refer to Environment Variables section).
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (refer to Environment Variables section).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

For local development, create a .env file in both the backend and frontend directories as described below.

### Backend (.env)

- DATABASE_URL: Your PostgreSQL connection string.

### Frontend (.env)

- VITE_API_URL: The base URL of your backend API (e.g., http://localhost:8000).
- VITE_ADMIN_PASSWORD: The password required to access the admin dashboard.

## Key Features

- Persistence System: State is automatically saved to the database after the first step.
- Draft Recovery: The application uses localStorage and API checks to resume incomplete sessions on refresh.
- Dynamic Forms: The shareholder input list is automatically generated based on the user's initial input.
- Equity Validation: Real-time calculation ensures total equity distribution equals 100%.
- Admin Portal: A secure dashboard displaying company metrics, total capital, and status filtering.
- Design System: A dedicated CSS implementation focused on premium, dark-mode SaaS aesthetics with custom outlined input fields.

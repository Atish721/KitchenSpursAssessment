# Restaurant Analytics Dashboard

A full-stack analytics dashboard for restaurant order trends built with Laravel backend and React frontend (Vite).

## Features

- View and search restaurants with filtering and sorting
- Restaurant-specific analytics with date range selection
- Daily orders, revenue, average order value, and peak hour trends
- Top 3 restaurants by revenue
- Advanced filtering capabilities

## Tech Stack

**Backend:** Laravel 10, PHP 8.1+
**Frontend:** React 18, Vite, Chart.js, Fetch API
**Database:** SQLite

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

4. Create SQLite database:
```bash
touch database/database.sqlite
```

5. Update .env file:
```bash
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/restaurant-analytics/database/database.sqlite
```

6. Run migrations and seed data:
```bash
php artisan migrate
php artisan db:seed
```

7. Start development server:
```bash
php artisan serve
```

Backend will run on http://localhost:8000

### Frontend Setup (Vite)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

### API Endpoints

- **GET /api/restaurants -** List restaurants with search/filter
- **GET /api/restaurants/{id} -** Get restaurant details
- **GET /api/analytics/restaurant/{id}/trends -** Restaurant order trends
- **GET /api/analytics/top-restaurants -** Top 3 restaurants by revenue
- **GET /api/analytics/filtered -** Filtered analytics data
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

4. Update .env file:
```bash
DB_CONNECTION=mysql
DB_HOST=im56gv.h.filess.io
DB_PORT=61002
DB_DATABASE=KitchenSpurs_prettyyes
DB_USERNAME=KitchenSpurs_prettyyes
DB_PASSWORD=4dc3ad94833cdf7123b945f31e73761d05b3beb2
SESSION_DRIVER=file
```

5. Start development server:
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


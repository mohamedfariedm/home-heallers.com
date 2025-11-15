# Statistics Dashboard Implementation

This document describes the complete implementation of the Statistics Dashboard with filtering capabilities for the Home Healers application.

## Overview

The statistics dashboard provides comprehensive analytics and reporting for reservations with advanced filtering options. It includes aggregate statistics, monthly trends, weekly trends, and visual breakdowns by status and support type.

## Features

- **Aggregate Statistics**: View total reservations, revenue, and average amounts
- **Advanced Filtering**: Filter by date range, doctor ID, client ID, reservation status, and support type
- **Monthly Trends**: Line chart showing monthly reservation and revenue trends
- **Weekly Trends**: Area chart showing weekly reservation and revenue trends
- **Status Breakdown**: Pie chart showing reservations by status
- **Support Type Breakdown**: Bar chart showing reservations by support type
- **Real-time Updates**: Dashboard updates automatically when filters are applied

## API Endpoints

### 1. GET /api/statistics/aggregates

Returns aggregate statistics for reservations.

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `reservation_statuses[]` (optional, multiple): Filter by reservation status IDs (1-5)
- `customer_support_types[]` (optional, multiple): Filter by support type (operation, maintenance, consultation, emergency)

**Examples:**
```
GET /api/statistics/aggregates
GET /api/statistics/aggregates?date_from=2024-01-01&date_to=2024-12-31
GET /api/statistics/aggregates?reservation_statuses[]=1&reservation_statuses[]=3
GET /api/statistics/aggregates?date_from=2024-01-01&customer_support_types[]=operation
GET /api/statistics/aggregates?date_from=2024-06-01&date_to=2024-06-30&reservation_statuses[]=3&reservation_statuses[]=5
```

**Response:**
```json
{
  "data": {
    "total_reservations": 25,
    "total_revenue": 13280.00,
    "average_amount": 531.20,
    "by_status": {
      "1": 2,
      "3": 18,
      "5": 5
    },
    "by_support_type": {
      "operation": 10,
      "maintenance": 6,
      "consultation": 4,
      "emergency": 5
    },
    "date_range": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
  },
  "message": "Statistics aggregates fetched successfully"
}
```

### 2. GET /api/statistics/reservations/monthly

Returns monthly reservation statistics.

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `doctor_id` (optional): Filter by doctor ID
- `client_id` (optional): Filter by client ID
- `reservation_statuses[]` (optional, multiple): Filter by reservation status IDs (1-5)

**Examples:**
```
GET /api/statistics/reservations/monthly?date_from=2024-01-01&date_to=2024-12-31
GET /api/statistics/reservations/monthly?doctor_id=5
GET /api/statistics/reservations/monthly?client_id=10&date_from=2024-01-01
GET /api/statistics/reservations/monthly?reservation_statuses[]=3&reservation_statuses[]=5
GET /api/statistics/reservations/monthly?doctor_id=5&date_from=2024-01-01&date_to=2024-06-30&reservation_statuses[]=3
```

**Response:**
```json
{
  "data": [
    {
      "period": "2024-01",
      "month": "January",
      "year": 2024,
      "total_reservations": 2,
      "total_revenue": 800.00,
      "average_amount": 400.00
    },
    ...
  ],
  "filters": {
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "doctor_id": null,
    "client_id": null,
    "reservation_statuses": null
  },
  "message": "Monthly reservations statistics fetched successfully"
}
```

### 3. GET /api/statistics/reservations/weekly

Returns weekly reservation statistics.

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `doctor_id` (optional): Filter by doctor ID
- `client_id` (optional): Filter by client ID
- `reservation_statuses[]` (optional, multiple): Filter by reservation status IDs (1-5)

**Examples:**
```
GET /api/statistics/reservations/weekly?date_from=2024-01-01&date_to=2024-12-31
GET /api/statistics/reservations/weekly?doctor_id=5
GET /api/statistics/reservations/weekly?client_id=10&reservation_statuses[]=3
GET /api/statistics/reservations/weekly?date_from=2024-11-01&date_to=2024-11-30
GET /api/statistics/reservations/weekly?doctor_id=5&date_from=2024-01-01&reservation_statuses[]=3&reservation_statuses[]=5
```

**Response:**
```json
{
  "data": [
    {
      "period": "2024-W03",
      "week": 3,
      "year": 2024,
      "week_start_date": "2024-01-15",
      "total_reservations": 1,
      "total_revenue": 500.00,
      "average_amount": 500.00
    },
    ...
  ],
  "filters": {
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "doctor_id": 5,
    "client_id": null,
    "reservation_statuses": [3, 5]
  },
  "message": "Weekly reservations statistics fetched successfully"
}
```

## Files Created

### API Routes
1. `/src/app/api/statistics/aggregates/route.ts` - Aggregate statistics endpoint
2. `/src/app/api/statistics/reservations/monthly/route.ts` - Monthly statistics endpoint
3. `/src/app/api/statistics/reservations/weekly/route.ts` - Weekly statistics endpoint

### Data
4. `/src/data/statistics-data.ts` - Mock data for reservations and constants

### Components
5. `/src/app/shared/statistics/dashboard/filters.tsx` - Filter component with all filtering options
6. `/src/app/shared/statistics/dashboard/stat-cards.tsx` - Stat cards for key metrics
7. `/src/app/shared/statistics/dashboard/status-breakdown.tsx` - Pie chart for status breakdown
8. `/src/app/shared/statistics/dashboard/support-type-breakdown.tsx` - Bar chart for support type breakdown
9. `/src/app/shared/statistics/dashboard/monthly-chart.tsx` - Line chart for monthly trends
10. `/src/app/shared/statistics/dashboard/weekly-chart.tsx` - Area chart for weekly trends
11. `/src/app/shared/statistics/dashboard/index.tsx` - Main dashboard component

### Pages
12. `/src/app/[locale]/(hydrogen)/statistics/page.tsx` - Statistics page route

### Configuration
13. `/src/config/routes.ts` - Added statistics route

## Component Architecture

```
StatisticsPage
  └── StatisticsDashboard
      ├── StatisticsFiltersComponent
      ├── StatCards
      ├── StatusBreakdown (Pie Chart)
      ├── SupportTypeBreakdown (Bar Chart)
      ├── MonthlyChart (Line Chart)
      └── WeeklyChart (Area Chart)
```

## Data Models

### Reservation Status Types
- 1: Pending
- 2: Confirmed
- 3: Completed
- 4: Cancelled
- 5: In Progress

### Customer Support Types
- operation: Operation
- maintenance: Maintenance
- consultation: Consultation
- emergency: Emergency

## Usage

### Accessing the Dashboard

Navigate to `/statistics` in your application to access the statistics dashboard.

Or use the route from the config:
```typescript
import { routes } from '@/config/routes';

// Navigate to statistics
router.push(routes.statistics.index); // '/statistics'
```

### Using Filters

1. **Date Range**: Select start and/or end dates to filter by date range
2. **Doctor ID**: Enter a doctor ID to filter reservations by specific doctor
3. **Client ID**: Enter a client ID to filter reservations by specific client
4. **Reservation Status**: Click status buttons to toggle multiple statuses
5. **Support Type**: Click support type buttons to toggle multiple types
6. **Apply Filters**: Click "Apply Filters" to update the dashboard
7. **Reset**: Click "Reset" to clear all filters

### API Integration

The dashboard automatically fetches data from all three endpoints in parallel when filters are applied. The data is then displayed in various charts and cards.

Example API call from the dashboard:
```typescript
const params = new URLSearchParams();
params.append('date_from', '2024-01-01');
params.append('date_to', '2024-12-31');
params.append('reservation_statuses[]', '3');
params.append('reservation_statuses[]', '5');

const response = await fetch(`/api/statistics/aggregates?${params.toString()}`);
const data = await response.json();
```

## Customization

### Adding New Filters

To add a new filter:

1. Add the filter parameter to the `StatisticsFilters` interface in `filters.tsx`
2. Add a form control in the `StatisticsFiltersComponent`
3. Update the `handleApplyFilters` function to include the new filter
4. Update the API route to handle the new filter parameter

### Adding New Charts

To add a new chart:

1. Create a new component in `/src/app/shared/statistics/dashboard/`
2. Import and use Recharts components
3. Add the component to the main dashboard in `index.tsx`
4. Pass the necessary data from the API response

### Styling

All components use Tailwind CSS for styling and follow the existing design patterns in the application. The dashboard is fully responsive and works on all screen sizes.

## Dependencies

The implementation uses the following libraries (already in your project):
- React & Next.js 14
- Recharts (for charts)
- Tailwind CSS (for styling)
- TypeScript

## Notes

- The current implementation uses mock data from `/src/data/statistics-data.ts`
- Replace the mock data with actual API calls to your backend when ready
- All API routes follow Next.js App Router conventions
- The dashboard is optimized for performance with parallel data fetching
- Charts are responsive and adapt to different screen sizes

## Testing

To test the implementation:

1. Start your development server: `npm run dev`
2. Navigate to `/statistics`
3. Try different filter combinations
4. Verify that charts update correctly
5. Test on different screen sizes

## Future Enhancements

Potential improvements:
- Export data to CSV/PDF
- Date range presets (Last 7 days, Last 30 days, etc.)
- Comparison mode (compare two time periods)
- Real-time updates with WebSocket
- Drill-down capabilities on charts
- Custom date grouping (daily, quarterly, yearly)
- Save filter presets

## Support

For questions or issues, please refer to the main project documentation or contact the development team.


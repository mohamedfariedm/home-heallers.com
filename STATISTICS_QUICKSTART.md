# Statistics Dashboard - Quick Start Guide

## Access the Dashboard

After starting your development server, navigate to:

```
http://localhost:3000/statistics
```

Or in your locale-specific route:
```
http://localhost:3000/en/statistics
http://localhost:3000/ar/statistics
```

## Quick Test Examples

### 1. View All Statistics
Simply navigate to `/statistics` - you'll see all data without filters.

### 2. Filter by Date Range
1. Set "Date From": `2024-01-01`
2. Set "Date To": `2024-12-31`
3. Click "Apply Filters"

### 3. Filter by Doctor
1. Enter "Doctor ID": `5`
2. Click "Apply Filters"
- You'll see only reservations for doctor with ID 5

### 4. Filter by Client
1. Enter "Client ID": `10`
2. Click "Apply Filters"
- You'll see only reservations for client with ID 10

### 5. Filter by Status
1. Click on "Completed" and "In Progress" status buttons
2. Click "Apply Filters"
- You'll see only completed and in-progress reservations

### 6. Filter by Support Type
1. Click on "Operation" and "Emergency" buttons
2. Click "Apply Filters"
- You'll see only operation and emergency support types

### 7. Combined Filters
Try combining multiple filters:
1. Date From: `2024-06-01`
2. Date To: `2024-06-30`
3. Select Status: "Completed" and "In Progress"
4. Click "Apply Filters"
- You'll see June data filtered by selected statuses

## API Testing

You can also test the APIs directly:

### Test Aggregates API
```bash
# All data
curl http://localhost:3000/api/statistics/aggregates

# With date range
curl "http://localhost:3000/api/statistics/aggregates?date_from=2024-01-01&date_to=2024-12-31"

# With status filter
curl "http://localhost:3000/api/statistics/aggregates?reservation_statuses[]=3&reservation_statuses[]=5"

# With support type filter
curl "http://localhost:3000/api/statistics/aggregates?customer_support_types[]=operation"
```

### Test Monthly API
```bash
# All months
curl http://localhost:3000/api/statistics/reservations/monthly

# Filter by doctor
curl "http://localhost:3000/api/statistics/reservations/monthly?doctor_id=5"

# Filter by client and date
curl "http://localhost:3000/api/statistics/reservations/monthly?client_id=10&date_from=2024-01-01"
```

### Test Weekly API
```bash
# All weeks
curl http://localhost:3000/api/statistics/reservations/weekly

# Filter by date range
curl "http://localhost:3000/api/statistics/reservations/weekly?date_from=2024-11-01&date_to=2024-11-30"

# Filter by doctor and status
curl "http://localhost:3000/api/statistics/reservations/weekly?doctor_id=5&reservation_statuses[]=3"
```

## What You'll See

### Stat Cards (Top)
- **Total Reservations**: Count of all reservations
- **Total Revenue**: Sum of all reservation amounts
- **Average Amount**: Average revenue per reservation

### Charts

#### Status Breakdown (Pie Chart)
Shows distribution of reservations by status:
- Pending (Blue)
- Confirmed (Green)
- Completed (Orange)
- Cancelled (Red)
- In Progress (Purple)

#### Support Type Breakdown (Bar Chart)
Shows count of reservations by support type:
- Operation
- Maintenance
- Consultation
- Emergency

#### Monthly Trend (Line Chart)
- Blue line: Number of reservations per month
- Green line: Revenue per month

#### Weekly Trend (Area Chart)
- Purple area: Number of reservations per week
- Orange area: Revenue per week

## Mock Data

The implementation includes 25 sample reservations spanning all of 2024:
- Various doctors (IDs: 3, 5, 7)
- Various clients (IDs: 8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32)
- All support types represented
- All statuses represented
- Amounts ranging from $200 to $920

## Tips

1. **Reset Filters**: Click the "Reset" button to clear all filters
2. **Responsive Design**: The dashboard works on mobile, tablet, and desktop
3. **Loading States**: A loader appears while fetching data
4. **Empty State**: If no data matches your filters, you'll see a helpful message
5. **Real-time Updates**: Charts update immediately when you apply filters

## Next Steps

### Replace Mock Data
To connect to your real backend:

1. Open `/src/app/api/statistics/aggregates/route.ts`
2. Replace the mock data import with your actual API call:
   ```typescript
   // Instead of: import { mockReservations } from '@/data/statistics-data';
   // Fetch from your backend:
   const response = await fetch('https://your-backend-api.com/reservations');
   const filteredData = await response.json();
   ```

3. Do the same for monthly and weekly routes

### Add to Navigation
Add the statistics link to your sidebar navigation:

```typescript
{
  name: 'Statistics',
  href: routes.statistics.index,
  icon: <ChartIcon />,
}
```

## Troubleshooting

### Dashboard is blank
- Check browser console for errors
- Ensure the API routes are accessible
- Verify mock data is properly imported

### Charts not updating
- Click "Apply Filters" after changing filter values
- Check network tab to see if API calls are being made

### Build errors
- Run `npm run build` to check for TypeScript errors
- Run `npm run lint` to check for linting issues

## Support

For detailed documentation, see `STATISTICS_IMPLEMENTATION.md`


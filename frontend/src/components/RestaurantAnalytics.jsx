import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { apiService } from '../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const RestaurantAnalytics = () => {
    const { restaurantId } = useParams();
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('2025-06-22');
    const [endDate, setEndDate] = useState('2025-06-28');

    useEffect(() => {
        fetchAnalytics();
    }, [restaurantId, startDate, endDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiService.getRestaurantTrends(restaurantId, startDate, endDate);
            setTrends(response);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (!trends) return <div>No data found</div>;

    const chartData = {
        labels: trends.trends.map(t => t.date),
        datasets: [
            {
                label: 'Daily Orders',
                data: trends.trends.map(t => t.orders_count),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
            {
                label: 'Daily Revenue',
                data: trends.trends.map(t => t.revenue),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y1',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return (
        <div>
            <h1>Analytics for {trends.restaurant.name}</h1>

            {/* Date Range Selector */}
            <div className="date-range">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {/* Summary */}
            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total Orders</h3>
                    <p>{trends.summary.total_orders}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p>₹{trends.summary.total_revenue?.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Avg Order Value</h3>
                    <p>₹{trends.summary.avg_order_value?.toFixed(2)}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="charts">
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Detailed Table */}
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Avg Order Value</th>
                        <th>Peak Hour</th>
                    </tr>
                </thead>
                <tbody>
                    {trends.trends.map((day, index) => (
                        <tr key={index}>
                            <td>{day.date}</td>
                            <td>{day.orders_count}</td>
                            <td>₹{day.revenue?.toFixed(2)}</td>
                            <td>₹{day.avg_order_value?.toFixed(2)}</td>
                            <td>{day.peak_hour}:00</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RestaurantAnalytics;
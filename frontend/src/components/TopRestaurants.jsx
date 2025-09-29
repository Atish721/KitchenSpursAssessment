import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { apiService } from '../services/api';

const TopRestaurants = () => {
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('2025-06-22');
    const [endDate, setEndDate] = useState('2025-06-28');

    useEffect(() => {
        fetchTopRestaurants();
    }, [startDate, endDate]);

    const fetchTopRestaurants = async () => {
        setLoading(true);
        try {
            const response = await apiService.getTopRestaurants(startDate, endDate);
            setTopRestaurants(response);
        } catch (error) {
            console.error('Error fetching top restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: topRestaurants.map(r => r.restaurant.name),
        datasets: [
            {
                label: 'Total Revenue',
                data: topRestaurants.map(r => r.total_revenue),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }
        ]
    };

    return (
        <div>
            <h1>Top 3 Restaurants by Revenue</h1>

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

            {loading && <div className="loading">Loading...</div>}

            {topRestaurants.length > 0 && (
                <div className="chart-container">
                    <Bar data={chartData} />
                </div>
            )}

            <div className="top-restaurants-list">
                {topRestaurants.map((item, index) => (
                    <div key={item.restaurant.id} className="top-restaurant-card">
                        <h3>#{index + 1} - {item.restaurant.name}</h3>
                        <p><strong>Revenue:</strong> ₹{item.total_revenue?.toFixed(2)}</p>
                        <p><strong>Total Orders:</strong> {item.total_orders}</p>
                        <p><strong>Avg Order Value:</strong> ₹{item.avg_order_value?.toFixed(2)}</p>
                    </div>
                ))}
            </div>

            {!loading && topRestaurants.length === 0 && (
                <div className="no-data">No data found for the selected date range</div>
            )}
        </div>
    );
};

export default TopRestaurants;
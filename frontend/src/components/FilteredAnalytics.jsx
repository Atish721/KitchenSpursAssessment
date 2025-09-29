import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const FilteredAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        restaurant_id: '',
        start_date: '2025-06-22',
        end_date: '2025-06-28',
        min_amount: '',
        max_amount: '',
        start_hour: '',
        end_hour: ''
    });

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiService.getFilteredAnalytics(filters);
            setAnalytics(response.data || response);
        } catch (error) {
            console.error('Error fetching filtered analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div>
            <h1>Filtered Analytics</h1>

            {/* Filters */}
            <div className="filters-grid">
                <select
                    value={filters.restaurant_id}
                    onChange={(e) => handleFilterChange('restaurant_id', e.target.value)}
                >
                    <option value="">All Restaurants</option>
                    <option value="101">Tandoori Treats</option>
                    <option value="102">Sushi Bay</option>
                    <option value="103">Pasta Palace</option>
                    <option value="104">Burger Hub</option>
                </select>

                <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
                <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.min_amount}
                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.max_amount}
                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Start Hour (0-23)"
                    min="0"
                    max="23"
                    value={filters.start_hour}
                    onChange={(e) => handleFilterChange('start_hour', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="End Hour (0-23)"
                    min="0"
                    max="23"
                    value={filters.end_hour}
                    onChange={(e) => handleFilterChange('end_hour', e.target.value)}
                />
            </div>

            {loading && <div className="loading">Loading...</div>}

            {/* Results */}
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Restaurant</th>
                        <th>Amount</th>
                        <th>Order Time</th>
                        <th>Hour</th>
                    </tr>
                </thead>
                <tbody>
                    {analytics.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.restaurant?.name}</td>
                            <td>₹{order.order_amount}</td>
                            <td>{new Date(order.order_time).toLocaleString()}</td>
                            <td>{new Date(order.order_time).getHours()}:00</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!loading && analytics.length === 0 && (
                <div className="no-data">No orders found for the selected filters</div>
            )}
        </div>
    );
};

export default FilteredAnalytics;
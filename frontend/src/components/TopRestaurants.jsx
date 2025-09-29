import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { apiService } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

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

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Top Restaurants by Revenue',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Revenue: ₹${context.raw.toLocaleString('en-IN')}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '₹' + value.toLocaleString('en-IN');
                    }
                }
            }
        }
    };

    const chartData = {
        labels: topRestaurants.map(r => r.restaurant.name),
        datasets: [
            {
                label: 'Total Revenue',
                data: topRestaurants.map(r => r.total_revenue),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            }
        ]
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Top 3 Restaurants by Revenue</h1>

            {/* Date Range Selector */}
            <div className="date-range" style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>
                    Start Date:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ marginLeft: '5px', padding: '5px' }}
                    />
                </label>
                <label style={{ marginRight: '10px' }}>
                    End Date:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ marginLeft: '5px', padding: '5px' }}
                    />
                </label>
                <button 
                    onClick={fetchTopRestaurants}
                    style={{ padding: '5px 10px', marginLeft: '10px' }}
                >
                    Refresh
                </button>
            </div>

            {loading && <div className="loading">Loading top restaurants...</div>}

            {/* Chart Section */}
            {topRestaurants.length > 0 && (
                <div className="chart-container" style={{ marginBottom: '40px', height: '400px' }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            )}

            {/* Restaurants List */}
            <div className="top-restaurants-list" style={{ display: 'grid', gap: '20px' }}>
                {topRestaurants.map((item, index) => (
                    <div 
                        key={item.restaurant.id} 
                        className="top-restaurant-card"
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: index === 0 ? '#fff3cd' : '#f8f9fa'
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '15px' 
                        }}>
                            <div style={{
                                backgroundColor: index === 0 ? '#ffc107' : index === 1 ? '#6c757d' : '#fd7e14',
                                color: 'white',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                marginRight: '15px'
                            }}>
                                #{index + 1}
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{item.restaurant.name}</h3>
                                <p style={{ margin: 0, color: '#666' }}>{item.restaurant.location}</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div>
                                <strong>Revenue</strong>
                                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745', margin: '5px 0' }}>
                                    ₹{item.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <strong>Total Orders</strong>
                                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#007bff', margin: '5px 0' }}>
                                    {item.total_orders}
                                </p>
                            </div>
                            <div>
                                <strong>Avg Order Value</strong>
                                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#6f42c1', margin: '5px 0' }}>
                                    ₹{item.avg_order_value.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && topRestaurants.length === 0 && (
                <div className="no-data" style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#666',
                    fontSize: '1.1em'
                }}>
                    No restaurant data found for the selected date range
                </div>
            )}
        </div>
    );
};

export default TopRestaurants;
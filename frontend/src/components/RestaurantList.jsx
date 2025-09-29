import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        fetchRestaurants();
    }, [search, cuisine, location, sortBy]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (cuisine) params.cuisine = cuisine;
            if (location) params.location = location;
            params.sort_by = sortBy;

            const response = await apiService.getRestaurants(params);
            setRestaurants(response.data || response);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Restaurants</h1>

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search restaurants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                    <option value="">All Cuisines</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Italian">Italian</option>
                    <option value="American">American</option>
                </select>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">All Locations</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="location">Location</option>
                    <option value="cuisine">Cuisine</option>
                </select>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {/* Restaurant List */}
            <div className="restaurant-grid">
                {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="restaurant-card">
                        <h3>{restaurant.name}</h3>
                        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                        <p><strong>Location:</strong> {restaurant.location}</p>
                        <p><strong>Total Orders:</strong> {restaurant.orders_count}</p>
                        <Link
                            to={`/analytics/${restaurant.id}`}
                            className="btn btn-primary"
                        >
                            View Analytics
                        </Link>
                    </div>
                ))}
            </div>

            {!loading && restaurants.length === 0 && (
                <div className="no-data">No restaurants found</div>
            )}
        </div>
    );
};

export default RestaurantList;
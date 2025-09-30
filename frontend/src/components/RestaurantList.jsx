import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('name');


    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedCuisine = useDebounce(cuisine, 500);
    const debouncedLocation = useDebounce(location, 500);
    const debouncedSortBy = useDebounce(sortBy, 500);

    useEffect(() => {
        setCurrentPage(1);

    }, [debouncedSearch, debouncedCuisine, debouncedLocation, debouncedSortBy]);

    useEffect(() => {
        fetchRestaurants();
    }, [debouncedSearch, debouncedCuisine, debouncedLocation, debouncedSortBy, currentPage, perPage]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: perPage
            };

            if (search) params.search = search;
            if (cuisine) params.cuisine = cuisine;
            if (location) params.location = location;
            params.sort_by = sortBy;

            const response = await apiService.getRestaurants(params);
            setRestaurants(response.data || []);



            if (response.pagination) {
                setTotal(response.pagination.total);
                setLastPage(response.pagination.last_page);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(parseInt(newPerPage));
        setCurrentPage(1);
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }


        buttons.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                &laquo; Prev
            </button>
        );


        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="pagination-btn"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
            }
        }


        for (let page = startPage; page <= endPage; page++) {
            buttons.push(
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                >
                    {page}
                </button>
            );
        }


        if (endPage < lastPage) {
            if (endPage < lastPage - 1) {
                buttons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
            }
            buttons.push(
                <button
                    key={lastPage}
                    onClick={() => handlePageChange(lastPage)}
                    className="pagination-btn"
                >
                    {lastPage}
                </button>
            );
        }


        buttons.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="pagination-btn"
            >
                Next &raquo;
            </button>
        );

        return buttons;
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

                {/* Items per page selector */}
                <select value={perPage} onChange={(e) => handlePerPageChange(e.target.value)}>
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {/* Results info */}
            {!loading && restaurants.length > 0 && (
                <div className="pagination-info">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} restaurants
                </div>
            )}

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

            {/* Pagination */}
            {!loading && restaurants.length > 0 && (
                <div className="pagination">
                    {renderPaginationButtons()}
                </div>
            )}

            {!loading && restaurants.length === 0 && (
                <div className="no-data">No restaurants found</div>
            )}
        </div>
    );
};

export default RestaurantList;
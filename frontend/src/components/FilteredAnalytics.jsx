import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

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


    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        setCurrentPage(1);

    }, [debouncedFilters]);

    useEffect(() => {
        fetchAnalytics();
    }, [debouncedFilters, currentPage, perPage]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = {
                ...debouncedFilters,
                page: currentPage,
                per_page: perPage
            };

            const response = await apiService.getFilteredAnalytics(params);
            setAnalytics(response.data || []);



            setTotal(response.total || 0);
            setLastPage(response.last_page || 1);
        } catch (error) {
            console.error('Error fetching filtered analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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

                {/* Items per page selector */}
                <select value={perPage} onChange={(e) => handlePerPageChange(e.target.value)}>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
            </div>

            {loading && (
                <div className="loading">
                    Loading...
                </div>
            )}

            {/* Results info */}
            {!loading && analytics.length > 0 && (
                <div className="pagination-info">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} orders
                </div>
            )}

            {/* Results Table */}
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

            {/* Pagination */}
            {!loading && analytics.length > 0 && (
                <div className="pagination">
                    {renderPaginationButtons()}
                </div>
            )}

            {!loading && analytics.length === 0 && (
                <div className="no-data">No orders found for the selected filters</div>
            )}
        </div>
    );
};

export default FilteredAnalytics;
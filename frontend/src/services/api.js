const API_BASE_URL = 'http://localhost:8000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Network response was not ok');
  }
  return response.json();
};

export const apiService = {
  // Restaurant endpoints
  getRestaurants: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/restaurants?${queryString}`)
      .then(handleResponse);
  },

  getRestaurant: (id) => {
    return fetch(`${API_BASE_URL}/restaurants/${id}`)
      .then(handleResponse);
  },

  // Analytics endpoints
  getRestaurantTrends: (restaurantId, startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    return fetch(`${API_BASE_URL}/analytics/restaurant/${restaurantId}/trends?${params}`)
      .then(handleResponse);
  },

  getTopRestaurants: (startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    return fetch(`${API_BASE_URL}/analytics/top-restaurants?${params}`)
      .then(handleResponse);
  },

  getFilteredAnalytics: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return fetch(`${API_BASE_URL}/analytics/filtered?${params}`)
      .then(handleResponse);
  }
};
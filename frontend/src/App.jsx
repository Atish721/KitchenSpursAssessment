import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantAnalytics from './components/RestaurantAnalytics';
import TopRestaurants from './components/TopRestaurants';
import FilteredAnalytics from './components/FilteredAnalytics';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/analytics/:restaurantId" element={<RestaurantAnalytics />} />
            <Route path="/top-restaurants" element={<TopRestaurants />} />
            <Route path="/filtered-analytics" element={<FilteredAnalytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
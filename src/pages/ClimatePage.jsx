import React, { useState } from 'react';
import { Search, Thermometer, Droplets, Wind, Sun, Cloud, Waves, AlertCircle } from 'lucide-react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ClimatePage = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [climateData, setClimateData] = useState(null);

  const fetchClimateData = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/climate?city=${encodeURIComponent(cityName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch climate data');
      }
      const data = await response.json();
      setClimateData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchClimateData(city.trim());
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    return 'text-purple-500';
  };

  const getAQIDescription = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Cloud className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Climate Analytics</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Search for any city to view detailed climate and environmental data
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name..."
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Search
            </button>
          </form>
        </div>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {climateData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Temperature */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Thermometer className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">Temperature</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{climateData.temperature}°C</div>
              <div className="text-sm text-slate-400">Feels like {climateData.feels_like}°C</div>
            </div>

            {/* Precipitation */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Droplets className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Precipitation</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{climateData.precipitation} mm</div>
              <div className="text-sm text-slate-400">Humidity: {climateData.humidity}%</div>
            </div>

            {/* Wind */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Wind className="h-6 w-6 text-cyan-500" />
                <h3 className="text-lg font-semibold text-white">Wind</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{climateData.wind_speed} km/h</div>
              <div className="text-sm text-slate-400">Direction: {climateData.wind_direction}°</div>
            </div>

            {/* Air Quality */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">Air Quality</h3>
              </div>
              <div className={`text-3xl font-bold mb-2 ${getAQIColor(climateData.aqi)}`}>
                {climateData.aqi}
              </div>
              <div className="text-sm text-slate-400">{getAQIDescription(climateData.aqi)}</div>
            </div>

            {/* Solar Radiation */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Sun className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-white">Solar Radiation</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{climateData.solar_radiation} W/m²</div>
              <div className="text-sm text-slate-400">UV Index: {climateData.uv_index}</div>
            </div>

            {/* Ocean pH */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Waves className="h-6 w-6 text-emerald-500" />
                <h3 className="text-lg font-semibold text-white">Ocean pH</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{climateData.ocean_ph}</div>
              <div className="text-sm text-slate-400">Last updated: {new Date(climateData.last_update).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClimatePage;
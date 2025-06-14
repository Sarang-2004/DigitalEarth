import React, { useState, useEffect } from 'react';
import { Flame, MapPin, Thermometer, Wind, Calendar, AlertCircle } from 'lucide-react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Globe3D from '../components/Globe3D';

const FiresPage = () => {
  const [fires, setFires] = useState([]);
  const [selectedFire, setSelectedFire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getLocationDisplay = (fire, allFires) => {
    // Count how many fires are in the same location
    const sameLocationFires = allFires.filter(f => 
      f.city === fire.city && 
      f.state === fire.state && 
      f.country === fire.country
    );
    
    const locationCount = sameLocationFires.findIndex(f => f.id === fire.id) + 1;
    const totalInLocation = sameLocationFires.length;
    
    let locationName = fire.city || fire.state || fire.country || 'Unknown Location';
    
    // If there are multiple fires in the same location, add a count
    if (totalInLocation > 1) {
      locationName = `${locationName} #${locationCount}`;
    }
    
    return locationName;
  };

  useEffect(() => {
    const fetchFires = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fires');
        if (!response.ok) {
          throw new Error('Failed to fetch fire data');
        }
        const data = await response.json();
        setFires(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFires();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchFires, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-red-500';
      case 'Contained': return 'bg-yellow-500';
      case 'Monitoring': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Global Fire Monitoring</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Real-time tracking of active wildfires worldwide with interactive 3D visualization
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Globe */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Interactive Fire Globe</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
              
              <div className="relative h-96 flex items-center justify-center bg-gradient-to-b from-blue-900/20 to-slate-900/20 rounded-xl overflow-hidden">
                <Globe3D
                  fireData={fires}
                  selectedFire={selectedFire}
                  onFireSelect={setSelectedFire}
                />
              </div>
            </div>
          </div>

          {/* Fire Details Panel */}
          <div className="space-y-6">
            {/* Selected Fire Details */}
            {selectedFire && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Fire Details</h3>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(selectedFire.status)}`}>
                    {selectedFire.status}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedFire.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Size</div>
                      <div className="text-white font-medium">{selectedFire.size}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Intensity</div>
                      <div className={`font-medium ${getIntensityColor(selectedFire.intensity)}`}>
                        {selectedFire.intensity}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Temperature</div>
                      <div className="text-white font-medium">{selectedFire.temperature}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Wind Speed</div>
                      <div className="text-white font-medium">{selectedFire.windSpeed}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-slate-400 text-sm mb-2">Threat Assessment</div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-white text-sm">{selectedFire.threat}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Statistics */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Live Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Fires</span>
                  <span className="text-red-500 font-bold text-lg">{fires.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">High Risk Areas</span>
                  <span className="text-orange-500 font-bold text-lg">
                    {fires.filter(f => f.intensity === 'High').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Affected Area</span>
                  <span className="text-yellow-500 font-bold text-lg">
                    {fires.reduce((acc, fire) => {
                      const size = parseFloat(fire.size);
                      return acc + (isNaN(size) ? 0 : size);
                    }, 0).toFixed(1)} km²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Update</span>
                  <span className="text-green-500 font-bold text-lg">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fire List */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Current Active Fires</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {fires
              .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
              .slice(0, 10)
              .map((fire) => (
              <div
                key={fire.id}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer ${
                  selectedFire?.id === fire.id
                    ? 'border-orange-500 transform scale-105'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedFire(fire)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {fire.city ? (
                            `${fire.city} (${fire.latitude.toFixed(2)}°N, ${fire.longitude.toFixed(2)}°E)`
                          ) : (
                            fire.state || fire.country || 'Unknown Location'
                          )}
                        </span>
                        {fire.city && fire.state && (
                          <span className="text-xs text-slate-400">
                            {fire.state}, {fire.country}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(fire.status)}`}></div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-slate-300">
                      <Thermometer className="h-4 w-4 mr-2" />
                      <span>{fire.temperature}</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Wind className="h-4 w-4 mr-2" />
                      <span>{fire.wind_speed}</span>
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(fire.last_update)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Size</span>
                      <span className="text-white font-medium">{fire.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiresPage;
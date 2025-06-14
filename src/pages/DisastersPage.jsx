import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Globe3D from '../components/Globe3D';

const DisastersPage = () => {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
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

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/disasters');
        if (!response.ok) {
          throw new Error('Failed to fetch disaster data');
        }
        const data = await response.json();
        setDisasters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchDisasters, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'earthquake':
        return '🌋';
      case 'tsunami':
        return '🌊';
      case 'hurricane':
        return '🌀';
      case 'flood':
        return '💧';
      case 'wildfire':
        return '🔥';
      case 'tornado':
        return '🌪️';
      case 'landslide':
        return '⛰️';
      case 'avalanche':
        return '🏔️';
      default:
        return '⚠️';
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
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Global Disaster Monitoring</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Real-time tracking of natural disasters and emergencies worldwide
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Globe */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Interactive Disaster Globe</h2>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
              
              <div className="relative h-96 flex items-center justify-center bg-gradient-to-b from-blue-900/20 to-slate-900/20 rounded-xl overflow-hidden">
                <Globe3D
                  disasterData={disasters}
                  selectedDisaster={selectedDisaster}
                  onDisasterSelect={setSelectedDisaster}
                />
              </div>
              </div>
            </div>

          {/* Disaster Details Panel */}
          <div className="space-y-6">
            {/* Selected Disaster Details */}
            {selectedDisaster && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Disaster Details</h3>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${
                    selectedDisaster.severity === 'High' ? 'bg-red-500' :
                    selectedDisaster.severity === 'Medium' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}>
                    {selectedDisaster.severity} Severity
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{selectedDisaster.location || 'Location Unknown'}</span>
                  </div>
                  
                  <div className="text-sm text-slate-300">
                    {selectedDisaster.description || selectedDisaster.text}
                  </div>
                  
                  <div className="flex items-center text-slate-400 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(selectedDisaster.created_at)}</span>
                  </div>
                  
                  {selectedDisaster.url && (
                    <a
                      href={selectedDisaster.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View Details
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Live Statistics */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Live Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Disasters</span>
                  <span className="text-red-500 font-bold text-lg">{disasters.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">High Severity</span>
                  <span className="text-orange-500 font-bold text-lg">
                    {disasters.filter(d => d.severity === 'High').length}
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

            {/* Disaster List */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Disasters</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {disasters
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 12)
              .map((disaster) => (
                <div
                  key={disaster.id}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer ${
                    selectedDisaster?.id === disaster.id
                    ? 'border-yellow-500 transform scale-105'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedDisaster(disaster)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(disaster.type)}</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {disaster.title || disaster.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {disaster.location || 'Location Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      disaster.severity === 'High' ? 'bg-red-500' :
                      disaster.severity === 'Medium' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}></div>
                    </div>
                    
                  <div className="space-y-3 text-sm">
                    <div className="text-slate-300 line-clamp-2">
                      {disaster.description || disaster.text}
                        </div>
                        <div className="flex items-center text-slate-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(disaster.created_at)}</span>
                        </div>
                      </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Severity</span>
                      <span className={`font-medium ${getSeverityColor(disaster.severity)}`}>
                        {disaster.severity}
                      </span>
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

export default DisastersPage;
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Satellite, TrendingUp, Shield, ArrowRight, Flame, AlertTriangle, CloudRain } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Flame,
      title: 'Real-time Fire Monitoring',
      description: 'Track active wildfires worldwide with our interactive 3D globe visualization and real-time satellite data.',
      link: '/fires',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: AlertTriangle,
      title: 'Natural Disaster Tracking',
      description: 'Monitor earthquakes, hurricanes, floods, and other natural disasters as they happen globally.',
      link: '/disasters',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: CloudRain,
      title: 'Climate Analytics',
      description: 'Analyze climate patterns, temperature trends, and environmental changes with advanced data visualization.',
      link: '/climate',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  const stats = [
    { label: 'Active Monitoring Points', value: '12,847' },
    { label: 'Countries Covered', value: '195' },
    { label: 'Data Updates/Hour', value: '2,400' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22rgba(59,130,246,0.05)%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Globe className="h-24 w-24 text-blue-500 animate-pulse" />
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                  <div className="h-24 w-24 border-4 border-transparent border-t-emerald-500 border-r-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Monitor Our
              <span className="block bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Living Planet
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time monitoring of wildfires, natural disasters, and climate changes. 
              Powered by satellite data and advanced analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/fires"
                className="group bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 hover:from-blue-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
              >
                <span>Explore Live Data</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group text-slate-300 px-8 py-4 rounded-full border border-slate-600 hover:border-slate-400 hover:text-white font-semibold text-lg flex items-center space-x-2 transition-all duration-200">
                <Satellite className="h-5 w-5" />
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Comprehensive Earth Monitoring
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Access real-time data on environmental changes, natural disasters, and climate patterns from around the globe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 font-medium">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Powered by Advanced Technology
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Our platform combines satellite imagery and real time API fetching 
                to provide the most accurate and up-to-date environmental monitoring available.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Satellite className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-semibold text-white">Satellite Data</div>
                    <div className="text-slate-400 text-sm">Real-time imagery</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-cyan-500" />
                  <div>
                    <div className="font-semibold text-white">Global Coverage</div>
                    <div className="text-slate-400 text-sm">Worldwide Monitoring</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="font-semibold text-white">Secure Platform</div>
                    <div className="text-slate-400 text-sm">Enterprise-grade</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-2xl p-8 backdrop-blur-sm border border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">24/7</div>
                    <div className="text-slate-300 text-sm">Monitoring</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-400">1TB+</div>
                    <div className="text-slate-300 text-sm">Daily Data</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">50ms</div>
                    <div className="text-slate-300 text-sm">Response Time</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                    <div className="text-slate-300 text-sm">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchTrips();
  }, []);
  
  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getTrips({ page: 1, limit: 20 });
      setTrips(response.data.trips);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTrips();
      return;
    }
    
    setLoading(true);
    try {
      const response = await tripAPI.searchTrips(searchQuery);
      setTrips(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <PublicPageShell
      eyebrow="Weekend Mojo"
      title="Explore amazing destinations"
      subtitle="Discover curated trips, smooth booking, and a travel experience that feels premium from the first click."
    >
      <div className="dashboard-panel mb-8">
        <div className="dashboard-panel-body">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search trips</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search destinations, trips..."
                className="input-field"
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary lg:self-end"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Popular Trips</h2>
        <Link to="/trips" className="text-orange-600 font-semibold hover:text-orange-700">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, index) => (
            <motion.div
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.thumbnail || trip.images[0]?.url}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-orange-600">
                  ₹{trip.price}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {trip.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {trip.shortDescription || trip.description}
                </p>
                
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <FiMapPin className="mr-1" />
                  <span>{trip.location}</span>
                  <FiClock className="ml-3 mr-1" />
                  <span>{trip.duration}</span>
                </div>
                
                <Link
                  to={`/trip/${trip._id}`}
                  className="mt-4 btn-primary w-full text-center block"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        {trips.length === 0 && (
          <div className="dashboard-panel p-12 text-center mt-8">
            <p className="text-slate-500">No trips found. Try a different search.</p>
          </div>
        )}
    </PublicPageShell>
  );
}
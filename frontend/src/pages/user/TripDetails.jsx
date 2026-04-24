import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import { FiMapPin, FiClock, FiCalendar, FiUsers, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  
  useEffect(() => {
    fetchTripDetails();
  }, [id]);
  
  const fetchTripDetails = async () => {
    try {
      const response = await tripAPI.getTripById(id);
      setTrip(response.data.trip);
      if (response.data.availableBuses?.length > 0) {
        setSelectedBus(response.data.availableBuses[0]);
      }
    } catch (error) {
      toast.error('Failed to load trip details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookNow = () => {
    if (!selectedBus) {
      toast.error('Please select a bus');
      return;
    }
    navigate(`/booking/${id}`, {
      state: { trip, bus: selectedBus, selectedDate }
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!trip) return null;
  
  return (
    <PublicPageShell
      eyebrow="Trip Overview"
      title={trip.title}
      subtitle={`${trip.location} • ${trip.duration} • ${trip.rating || 0} rating`}
      className="pb-12"
    >
      <div className="dashboard-panel overflow-hidden">
        <div className="relative h-80 md:h-96">
          <img
            src={trip.images?.[0]?.url || trip.thumbnail}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
            <div className="flex flex-wrap gap-3 text-sm text-slate-100">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <FiMapPin /> {trip.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <FiClock /> {trip.duration}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                <FiStar className="text-amber-300" /> {trip.rating} ({trip.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel-body">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2 className="dashboard-panel-title">About This Trip</h2>
                </div>
                <div className="dashboard-panel-body">
                  <p className="text-slate-600 leading-7">{trip.description}</p>
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2 className="dashboard-panel-title">Itinerary</h2>
                </div>
                <div className="dashboard-panel-body space-y-4">
                  {trip.itinerary?.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                    >
                      <h3 className="font-semibold text-lg text-slate-900">Day {day.day}</h3>
                      {day.title && <p className="text-slate-700 mt-1">{day.title}</p>}
                      {day.places?.length > 0 && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-800">Places: </span>
                          {day.places.join(', ')}
                        </div>
                      )}
                      {day.activities?.length > 0 && (
                        <div className="mt-1 text-sm text-slate-600">
                          <span className="font-medium text-slate-800">Activities: </span>
                          {day.activities.join(', ')}
                        </div>
                      )}
                      {day.dining && (
                        <div className="mt-2 text-sm text-slate-500">
                          <div>Breakfast: {day.dining.breakfast}</div>
                          <div>Lunch: {day.dining.lunch}</div>
                          <div>Dinner: {day.dining.dinner}</div>
                        </div>
                      )}
                      {day.stay && (
                        <div className="mt-1 text-sm text-slate-500">
                          Stay: {day.stay.name} ({day.stay.type})
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {trip.inclusions?.length > 0 && (
                  <div className="dashboard-panel">
                    <div className="dashboard-panel-header">
                      <h3 className="dashboard-panel-title text-green-600">Inclusions</h3>
                    </div>
                    <div className="dashboard-panel-body">
                      <ul className="space-y-2">
                        {trip.inclusions.map((item, i) => (
                          <li key={i} className="flex items-center text-slate-600">
                            <span className="text-green-500 mr-2">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {trip.exclusions?.length > 0 && (
                  <div className="dashboard-panel">
                    <div className="dashboard-panel-header">
                      <h3 className="dashboard-panel-title text-red-600">Exclusions</h3>
                    </div>
                    <div className="dashboard-panel-body">
                      <ul className="space-y-2">
                        {trip.exclusions.map((item, i) => (
                          <li key={i} className="flex items-center text-slate-600">
                            <span className="text-red-500 mr-2">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="dashboard-panel sticky top-24">
                <div className="dashboard-panel-body">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-orange-500">₹{trip.price}</div>
                    <div className="text-slate-500 text-sm">per person</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                    <select
                      className="input-field"
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      <option value="">Select a date</option>
                      {trip.availableDates?.map((date, i) => (
                        <option key={i} value={date}>
                          {new Date(date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Bus</label>
                    <select
                      className="input-field"
                      value={selectedBus?._id || ''}
                      onChange={(e) => setSelectedBus(JSON.parse(e.target.value))}
                    >
                      <option value="">Select a bus</option>
                      {trip.availableBuses?.map((bus) => (
                        <option key={bus._id} value={JSON.stringify(bus)}>
                          {bus.busNumber} - {bus.type} ({bus.operatorName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleBookNow}
                    disabled={!selectedDate || !selectedBus}
                    className="btn-primary w-full"
                  >
                    Book Now
                  </button>

                  <button
                    onClick={() => navigate('/')}
                    className="btn-secondary w-full mt-3"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
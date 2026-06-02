import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import { FiMapPin, FiClock, FiCalendar, FiUsers, FiStar, FiCheckCircle, FiXCircle, FiArrowRight, FiArrowLeft, FiHeart, FiMenu, FiBell, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

const heroImageFallback = '/banner-fallback.svg';

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const response = await tripAPI.getTripById(id);
      const tripData = response.data.trip;
      setTrip(tripData);
      setAvailableBuses(response.data.availableBuses || []);

      if (tripData?.availableDates?.length > 0) {
        setSelectedDate(tripData.availableDates[0]);
      }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) return null;

  const heroImage = trip.images?.[0]?.url || trip.thumbnail;
  const heroCopy = trip.shortDescription || trip.description;
  const selectedBusFare = selectedBus?.assignedTrips?.[0]?.price || trip.price;

  return (
    <PublicPageShell mobileFrame showHeader={false} className="pb-24">
      <div className="mobile-app-shell">
        <div className="mobile-app-screen pb-24">
          <div className="mobile-app-statusbar">
            <button className="btn-circle" onClick={() => navigate(-1)} aria-label="go back">
              <FiArrowLeft className="icon" />
            </button>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Trip Overview</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate('/')} className="btn-icon" aria-label="menu">
                <FiMenu className="icon" />
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} className="relative btn-icon" aria-label="notifications">
                <FiBell className="icon" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
              </button>
            </div>
          </div>

          <section className="mobile-app-card overflow-hidden">
            <div className="relative h-80 md:h-96">
              <img src={heroImage} alt={trip.title} loading="lazy" className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = heroImageFallback; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-100">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <FiMapPin className="icon" /> {trip.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <FiClock className="icon" /> {trip.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <FiUsers className="icon" /> {trip.maxCapacity || 0} seats
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      <FiStar className="icon text-amber-300" /> {trip.rating || 0} ({trip.totalReviews || 0} reviews)
                    </span>
                  </div>

                  <div>
                    <h1 className="mobile-app-heading text-4xl sm:text-5xl">
                      <span className="block text-sm font-medium uppercase tracking-[0.35em] text-amber-200/90">Weekend Mojo</span>
                      <span className="block mt-2">{trip.title}</span>
                    </h1>
                    <p className="mt-3 max-w-[20rem] text-sm leading-6 text-slate-100/95">
                      {heroCopy}
                    </p>
                  </div>

                  {trip.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trip.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 space-y-5 pb-6">
            <section className="mobile-app-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="mobile-app-section-title">Itinerary</h2>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{trip.itinerary?.length || 0} days</span>
              </div>

              <div className="space-y-4">
                {trip.itinerary?.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white">
                          Day {day.day}
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-slate-900">{day.title || `Day ${day.day}`}</h3>
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-secondary shadow-sm">
                        <FiArrowRight className="icon -rotate-45" />
                      </div>
                    </div>

                    {day.places?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {day.places.map((place) => (
                          <span key={place} className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">
                            {place}
                          </span>
                        ))}
                      </div>
                    )}

                    {day.activities?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {day.activities.map((activity) => (
                          <span key={activity} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                            {activity}
                          </span>
                        ))}
                      </div>
                    )}

                    {day.stay?.name && (
                      <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-800">Stay</div>
                        <div className="mt-1">{day.stay.name}{day.stay.type ? ` • ${day.stay.type}` : ''}</div>
                        {day.stay.address && <div className="mt-1 text-slate-500">{day.stay.address}</div>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {trip.inclusions?.length > 0 && (
                <section className="mobile-app-card p-4">
                  <h3 className="mobile-app-section-title text-green-600">Inclusions</h3>
                  <ul className="mt-4 space-y-3">
                    {trip.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start text-slate-600">
                        <FiCheckCircle className="mr-2 mt-0.5 shrink-0 icon text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {trip.exclusions?.length > 0 && (
                <section className="mobile-app-card p-4">
                  <h3 className="mobile-app-section-title text-red-600">Exclusions</h3>
                  <ul className="mt-4 space-y-3">
                    {trip.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start text-slate-600">
                        <FiXCircle className="mr-2 mt-0.5 shrink-0 icon text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <section className="mobile-app-card p-4">
              <div className="rounded-[1.5rem] bg-slate-900 p-5 text-white shadow-2xl shadow-slate-900/10">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Starting from</div>
                <div className="mt-2 text-4xl font-bold text-orange-400">₹{selectedBusFare}</div>
                <div className="mt-1 text-sm text-slate-300">per person</div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-200">
                  <FiCalendar className="icon text-orange-300" />
                  {selectedDate ? formatDate(selectedDate) : 'Choose a departure date'}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Select Date</label>
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

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Select Bus</label>
                  <span className="text-xs text-slate-500">{availableBuses.length || 0} options</span>
                </div>

                <div className="space-y-3">
                  {availableBuses.map((bus) => {
                    const isSelected = selectedBus?._id === bus._id;
                    const busPrice = bus.assignedTrips?.[0]?.price || trip.price;

                    return (
                      <button
                        type="button"
                        key={bus._id}
                        onClick={() => setSelectedBus(bus)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${isSelected ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{bus.busNumber}</div>
                            <div className="text-sm text-slate-600">{bus.operatorName} • {bus.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-orange-500">₹{busPrice}</div>
                            <div className="text-xs text-slate-500">{bus.totalSeats} seats</div>
                          </div>
                        </div>
                        {bus.amenities?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {bus.amenities.slice(0, 4).map((amenity) => (
                              <span key={amenity} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                        {bus.assignedTrips?.[0]?.boardingPoints?.length > 0 && (
                          <div className="mt-3 flex items-center text-xs text-slate-500">
                            <FiArrowRight className="mr-1 icon" />
                            {bus.assignedTrips[0].boardingPoints.length} boarding point{bus.assignedTrips[0].boardingPoints.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {!availableBuses.length && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No buses are assigned yet. Check back soon or ask management to publish a bus assignment.
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedBus}
                className="btn-primary mt-4 w-full"
              >
                Book Now
              </button>

              <button
                onClick={() => navigate('/')}
                className="btn-secondary mt-3 w-full"
              >
                Go Back
              </button>
            </section>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
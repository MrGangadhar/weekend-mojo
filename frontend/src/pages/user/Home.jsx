import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiFilter,
  FiGrid,
  FiHeart,
  FiHome,
  FiMap,
  FiMapPin,
  FiMic,
  FiMoon,
  FiSearch,
  FiShield,
  FiStar,
  FiSun,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiWifi,
  FiNavigation,
  FiZap,
} from 'react-icons/fi';
import { tripAPI } from '../../services/api';
import FiltersPanel from '../../components/common/FiltersPanel';
import BrandLogo from '../../components/common/BrandLogo';
import { PublicPageShell } from '../../components/common/PublicPageShell';

const heroImageFallback = '/banner-fallback.svg';

const categoryCards = [
  { key: 'flights', label: 'Flights', icon: FiNavigation, accent: 'from-sky-500 to-blue-600', note: 'Instant fare scans' },
  { key: 'bus', label: 'Bus', icon: FiTruck, accent: 'from-orange-500 to-amber-500', note: 'Flexible seats' },
  { key: 'train', label: 'Train', icon: FiMap, accent: 'from-cyan-500 to-sky-600', note: 'Smart routes' },
  { key: 'hotels', label: 'Hotels', icon: FiHome, accent: 'from-indigo-500 to-sky-500', note: 'Luxury stays' },
  { key: 'resorts', label: 'Resorts', icon: FiSun, accent: 'from-amber-500 to-orange-500', note: 'Relax stays' },
  { key: 'vehicles', label: 'Vehicle Rental', icon: FiCreditCard, accent: 'from-slate-700 to-slate-950', note: 'Self drive' },
  { key: 'trips', label: 'Trips', icon: FiMapPin, accent: 'from-emerald-500 to-teal-500', note: 'Trips near you' },
  { key: 'packages', label: 'Packages', icon: FiCalendar, accent: 'from-violet-500 to-indigo-600', note: 'Curated bundles' },
  { key: 'influencer', label: 'Influencer Trips', icon: FiZap, accent: 'from-rose-500 to-orange-500', note: 'Creator picks' },
];

const trendingDestinations = [
  { name: 'Goa', vibe: 'Beach glow', price: 'From ₹4,990', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80' },
  { name: 'Manali', vibe: 'Snow weekend', price: 'From ₹3,690', image: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=900&q=80' },
  { name: 'Jaipur', vibe: 'Royal city', price: 'From ₹2,490', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80' },
  { name: 'Munnar', vibe: 'Tea hills', price: 'From ₹3,290', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80' },
];

const offers = [
  { title: 'Sunset escapes', copy: 'Up to 30% off on premium weekend trips', accent: 'from-slate-950 via-slate-900 to-blue-700' },
  { title: 'AI curated deals', copy: 'Smart bundles tuned to your travel mood', accent: 'from-blue-700 via-sky-600 to-cyan-500' },
  { title: 'Family holiday pack', copy: 'Add hotel + transfers with one tap', accent: 'from-orange-500 via-amber-500 to-rose-500' },
];

const travelStories = [
  { title: 'A slow Goa morning', tag: 'Story', time: '2 min read' },
  { title: 'Night drive to Coorg', tag: 'New', time: 'Audio travel note' },
  { title: 'Luxury on a budget', tag: 'Guide', time: 'Save later' },
];

const itineraryBlocks = [
  { day: 'Day 01', title: 'Arrival + city views', points: ['Airport pickup', 'Sky lounge check-in', 'Sunset dinner'] },
  { day: 'Day 02', title: 'Explore and unwind', points: ['Local sightseeing', 'Cafe crawl', 'Beach walk'] },
  { day: 'Day 03', title: 'Departure with ease', points: ['Late checkout', 'Packed breakfast', 'Cab to station'] },
];

const profileStats = [
  { label: 'Trips booked', value: '18' },
  { label: 'Rewards points', value: '24.8K' },
  { label: 'Saved places', value: '42' },
  { label: 'Member since', value: '2023' },
];

const travelTabs = [
  { id: 'top', label: 'Home', icon: FiGrid },
  { id: 'details', label: 'Details', icon: FiMapPin },
  { id: 'booking', label: 'Booking', icon: FiCreditCard },
  { id: 'profile', label: 'Profile', icon: FiHeart },
  { id: 'stories', label: 'Stories', icon: FiZap },
];

const formatDateRange = (dates = []) => {
  if (!dates?.length) return 'Flexible dates';

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${first.toLocaleDateString(undefined, options)} - ${last.toLocaleDateString(undefined, options)}`;
};

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [activeCategory, setActiveCategory] = useState('flights');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = location.hash.replace('#', '');
      if (!hash) return;

      window.requestAnimationFrame(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);

    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [location.hash]);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getTrips({ page: 1, limit: 20 });
      setTrips(response.data.trips || []);
    } catch (error) {
      toast.error('Failed to load travel inventory');
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.priceMax) params.priceMax = filters.priceMax;
      if (filters.departure) params.departure = filters.departure;
      if (filters.location) params.location = filters.location;
      if (filters.travelClass) params.travelClass = filters.travelClass;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.amenities?.length) params.amenities = filters.amenities.join(',');

      const response = await tripAPI.getTrips(params);
      setTrips(response.data.trips || response.data || []);
      setShowFilters(false);
    } catch (error) {
      toast.error('Filter lookup failed');
      console.error('Filter fetch failed:', error);
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
      setTrips(response.data.trips || response.data || []);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openBookings = () => navigate('/dashboard');

  const featuredTrip = trips[0];
  const featuredImage = featuredTrip?.images?.[0]?.url || featuredTrip?.thumbnail || heroImageFallback;
  const recommendations = useMemo(() => trips.slice(0, 4), [trips]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="travel-splash-card max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <BrandLogo variant="mark" className="h-10 w-10" />
          </div>
          <p className="travel-section-eyebrow mt-4">Weekend Mojo</p>
          <h1 className="mt-2 text-2xl font-semibold">Loading your next escape</h1>
          <p className="mt-2 text-sm text-slate-200/80">Crafting a premium travel experience with search, recommendations, and booking flow.</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="travel-loader-dot" />
            <span className="travel-loader-dot" />
            <span className="travel-loader-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicPageShell mobileFrame showHeader={false} className="pb-28">
      <div id="top" className="travel-app-shell min-h-screen">
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm">
            <button type="button" className="absolute inset-0" aria-label="Close filters" onClick={() => setShowFilters(false)} />
            <div className="relative z-10 flex h-full items-end justify-center px-3 py-3 sm:px-4 sm:py-4">
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="travel-bottom-sheet w-full max-w-[34rem]"
              >
                <div className="travel-bottom-sheet-handle" />
                <FiltersPanel className="travel-bottom-sheet-panel w-full" onApply={applyFilters} />
              </motion.div>
            </div>
          </div>
        )}

        <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-5 px-4 pb-28 pt-4 sm:max-w-3xl sm:px-6 lg:max-w-6xl lg:px-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="travel-splash-card"
          >
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-orange-300/15 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <BrandLogo variant="mark" className="h-12 w-12 rounded-2xl bg-white/10 p-1 shadow-lg shadow-black/10" />
                  <button
                    type="button"
                    onClick={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
                    className="travel-chip travel-chip-ghost text-white/90"
                  >
                    {themeMode === 'light' ? <FiMoon /> : <FiSun />}
                    {themeMode === 'light' ? 'Dark mode preview' : 'Light mode preview'}
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="travel-section-eyebrow">Premium travel app</p>
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Discover, book, and manage every trip in one futuristic mobile experience.
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-slate-200/85 sm:text-base">
                    Inspired by best-in-class travel apps, rebuilt with a cleaner visual hierarchy, glassmorphism, smart recommendations, and a startup-pitch level presentation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => scrollToSection('home')} className="travel-chip travel-chip-active">
                    <FiZap /> Explore the app
                  </button>
                  <button type="button" onClick={() => scrollToSection('details')} className="travel-chip travel-chip-ghost text-white/90">
                    <FiMapPin /> View destination detail
                  </button>
                  <button type="button" onClick={() => scrollToSection('booking')} className="travel-chip travel-chip-ghost text-white/90">
                    <FiCreditCard /> See booking flow
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.2em] text-sky-100/70">AI assist</div>
                    <div className="mt-2 text-lg font-semibold text-white">Travel Copilot</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.2em] text-sky-100/70">Voice</div>
                    <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white"><FiMic /> Search</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.2em] text-sky-100/70">Weather</div>
                    <div className="mt-2 text-lg font-semibold text-white">29°C / Sunny</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.2em] text-sky-100/70">Loyalty</div>
                    <div className="mt-2 text-lg font-semibold text-white">24.8K pts</div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-200/70">Splash screen</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Weekend Mojo</h2>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100/90">Live UI preview</div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white/10 p-4 shadow-inner shadow-black/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-200/65">Loading</div>
                        <div className="mt-1 text-lg font-semibold text-white">Animates into premium travel mode</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="travel-loader-dot" />
                        <span className="travel-loader-dot" />
                        <span className="travel-loader-dot" />
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/15">
                      <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-orange-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-200/70">Bottom nav</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-100/90"><FiGrid /> Home, explore, bookings, profile</div>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4 text-white">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-200/70">Micro motion</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-100/90"><FiTrendingUp /> Smooth, premium motion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section id="home" className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="travel-section-eyebrow text-slate-500">Home screen</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Search, browse, and book faster.</h2>
              </div>
              <button type="button" onClick={() => setShowFilters(true)} className="travel-chip travel-chip-ghost hidden lg:inline-flex">
                <FiFilter /> Open filters
              </button>
            </div>

            <div className="travel-search-shell space-y-4">
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <FiSearch className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search destinations, cities, hotels, buses..."
                  className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button type="button" className="travel-chip travel-chip-ghost">
                  <FiMic /> Voice
                </button>
                <button type="button" onClick={handleSearch} className="btn-primary px-4 py-2.5">
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Goa', 'Manali', 'Jaipur', 'Munnar', 'Flights', 'Hotels'].map((item) => (
                  <button key={item} type="button" onClick={() => setSearchQuery(item)} className="travel-chip travel-chip-ghost">
                    {item}
                  </button>
                ))}
              </div>

              <div className="travel-category-rail">
                {categoryCards.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = activeCategory === item.key;
                  return (
                    <button key={item.key} type="button" onClick={() => setActiveCategory(item.key)} className={`travel-category-card ${isActive ? 'travel-category-card-active' : ''}`}>
                      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br ${item.accent} text-white shadow-lg`}>
                        <ItemIcon />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.note}</div>
                    </button>
                  );
                })}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">Trending destinations</h3>
                  <button type="button" onClick={() => scrollToSection('details')} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600">
                    Explore all <FiArrowRight />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {trendingDestinations.map((destination) => (
                    <article key={destination.name} className="travel-destination-card min-w-[13rem] snap-start sm:min-w-[14rem]">
                      <img src={destination.image} alt={destination.name} className="h-44 w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                        <div className="flex justify-end">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">{destination.price}</span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{destination.name}</div>
                          <div className="text-xs text-white/80">{destination.vibe}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">Popular offers</h3>
                  <span className="text-sm text-slate-500">Swipe the banner rail</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {offers.map((offer) => (
                    <article key={offer.title} className={`travel-offer-card bg-gradient-to-br ${offer.accent} snap-start`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.24em] text-slate-100/70">Offer</div>
                          <h4 className="mt-2 text-xl font-semibold">{offer.title}</h4>
                          <p className="mt-2 text-sm text-slate-100/85">{offer.copy}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white/90">
                          <FiZap />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">Smart recommendations</h3>
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"><FiShield /> AI tuned</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {recommendations.map((trip) => (
                    <Link key={trip._id} to={`/trip/${trip._id}`} className="travel-destination-card block">
                      <img src={trip.images?.[0]?.url || trip.thumbnail || heroImageFallback} alt={trip.title} className="h-40 w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = heroImageFallback; }} />
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.24em] text-sky-600">{trip.location}</div>
                            <h4 className="mt-1 text-base font-semibold text-slate-950">{trip.title}</h4>
                          </div>
                          <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-white/65">From</div>
                            <div className="text-sm font-semibold">₹{trip.price}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><FiStar className="text-amber-400" /> {trip.rating || '4.8'}</span>
                          <span className="inline-flex items-center gap-1"><FiClock /> {formatDateRange(trip.availableDates || [])}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="details" className="space-y-4">
            <div>
              <p className="travel-section-eyebrow text-slate-500">Destination details</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Full-screen gallery, glass booking card, map, and itinerary.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="travel-detail-card">
                <div className="relative h-72 overflow-hidden sm:h-96">
                  <img src={featuredImage} alt={featuredTrip?.title || 'Featured destination'} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = heroImageFallback; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">4.9 rating</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">2.4K reviews</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">Interactive map</span>
                    </div>
                    <h3 className="mt-3 text-3xl font-semibold">{featuredTrip?.title || 'Santorini Dream Escape'}</h3>
                    <p className="mt-2 max-w-xl text-sm text-slate-100/85">A polished destination preview with full-screen imagery, ratings, itinerary timeline, and a sticky booking CTA.</p>
                  </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  {(featuredTrip?.images?.slice(1, 4) || []).map((image, index) => (
                    <img key={`${image?.url || index}`} src={image?.url} alt={`${featuredTrip?.title || 'Destination'} ${index + 2}`} className="h-24 w-full rounded-[1.25rem] object-cover" />
                  ))}
                  {!featuredTrip?.images?.slice(1, 4)?.length && (
                    <div className="col-span-full rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Gallery previews will appear here once a trip is selected.</div>
                  )}
                </div>
              </div>

              <div className={`travel-detail-card p-4 ${themeMode === 'dark' ? 'bg-slate-950 text-white' : 'bg-white'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="travel-section-eyebrow text-slate-500">Glass booking card</p>
                    <h3 className="mt-1 text-xl font-semibold">Reserve your seat</h3>
                  </div>
                  <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Secure checkout</div>
                </div>

                <div className="mt-4 rounded-[1.4rem] bg-gradient-to-br from-slate-950 to-blue-700 p-4 text-white shadow-lg">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-200/70">Starting from</div>
                  <div className="mt-2 text-4xl font-semibold text-orange-300">₹{featuredTrip?.price || '4,999'}</div>
                  <div className="mt-1 text-sm text-slate-200/80">per guest with flexible cancellation</div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-100/90">
                    <FiCalendar /> {formatDateRange(featuredTrip?.availableDates || [])}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="travel-stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ratings</div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">4.9 / 5.0</div>
                      </div>
                      <FiStar className="text-amber-400" />
                    </div>
                  </div>
                  <div className="travel-stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Map preview</div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">Interactive route overview</div>
                      </div>
                      <FiMapPin className="text-sky-500" />
                    </div>
                    <div className="mt-3 h-28 rounded-[1.15rem] bg-gradient-to-br from-sky-100 via-blue-50 to-orange-50 p-3">
                      <div className="h-full rounded-[1rem] border border-white/60 bg-white/80" />
                    </div>
                  </div>
                  <div className="travel-stat-card">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Itinerary timeline</div>
                    <div className="mt-3 space-y-3">
                      {itineraryBlocks.map((block) => (
                        <div key={block.day} className="flex gap-3">
                          <div className="mt-1 h-3 w-3 rounded-full bg-sky-500" />
                          <div>
                            <div className="text-sm font-semibold text-slate-950">{block.day} - {block.title}</div>
                            <div className="text-sm text-slate-500">{block.points.join(' · ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={openBookings} className="btn-primary mt-4 w-full py-3.5">
                  Book now
                </button>
              </div>
            </div>
          </section>

          <section id="booking" className="space-y-4">
            <div>
              <p className="travel-section-eyebrow text-slate-500">Booking flow</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Passenger details, coupon wallet, secure payment, confirmation.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <div className="travel-detail-card p-4">
                <h3 className="text-lg font-semibold text-slate-950">Passenger details form</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="text" className="input-field" placeholder="Full name" />
                  <input type="text" className="input-field" placeholder="Email or phone" />
                  <input type="number" className="input-field" placeholder="Age" />
                  <input type="text" className="input-field" placeholder="Gender" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="travel-chip travel-chip-active"><FiShield /> Secure OTP</button>
                  <button type="button" className="travel-chip travel-chip-ghost"><FiCreditCard /> Wallet eligible</button>
                  <button type="button" className="travel-chip travel-chip-ghost"><FiHeart /> Coupon applied</button>
                </div>
                <div className="mt-4 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Animated confirmation, ticket download, and live trip access appear after checkout.
                </div>
              </div>

              <div className="travel-detail-card bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Secure payment UI</h3>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Razorpay-ready</span>
                </div>
                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center justify-between text-sm text-slate-200/80">
                    <span>Amount due</span>
                    <span>₹{featuredTrip?.price || '4,999'}</span>
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-orange-300">Pay with one tap</div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 rounded-[1rem] bg-white/10 p-3 text-center text-sm">Wallet</div>
                    <div className="flex-1 rounded-[1rem] bg-white/10 p-3 text-center text-sm">UPI</div>
                    <div className="flex-1 rounded-[1rem] bg-white/10 p-3 text-center text-sm">Card</div>
                  </div>
                </div>
                <div className="mt-4 rounded-[1.4rem] bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-slate-950">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-950/65">Confirmed</div>
                  <div className="mt-2 text-2xl font-semibold">Your ticket is ready</div>
                  <div className="mt-2 text-sm text-slate-950/75">Download the ticket or open the trip tracker right away.</div>
                </div>
              </div>
            </div>
          </section>

          <section id="profile" className="space-y-4">
            <div>
              <p className="travel-section-eyebrow text-slate-500">Profile dashboard</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Stats, upcoming trips, saved places, rewards, and dark mode.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="travel-detail-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white shadow-lg">
                    <FiUsers />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Aarav Mehta</h3>
                    <p className="text-sm text-slate-500">Platinum traveler • Dark mode enabled</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {profileStats.map((stat) => (
                    <div key={stat.label} className="travel-stat-card">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                      <div className="mt-1 text-xl font-semibold text-slate-950">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.4rem] bg-slate-950 p-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-300/70">Dark mode settings</div>
                      <div className="mt-1 text-lg font-semibold">Balance low-light comfort with premium contrast.</div>
                    </div>
                    <button type="button" onClick={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold">
                      {themeMode === 'light' ? 'Enable dark' : 'Switch back'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="travel-detail-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">Upcoming trips</h3>
                    <p className="text-sm text-slate-500">Saved destinations and notification center</p>
                  </div>
                  <div className="travel-chip travel-chip-ghost"><FiBell /> 3 alerts</div>
                </div>

                <div className="mt-4 space-y-3">
                  {(trips.slice(0, 3).length ? trips.slice(0, 3) : trendingDestinations).map((item, index) => (
                    <div key={item._id || item.name} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Trip {index + 1}</div>
                          <div className="mt-1 text-base font-semibold text-slate-950">{item.title || item.name}</div>
                          <div className="text-sm text-slate-500">{item.shortDescription || item.vibe || 'Smart recommendation'}</div>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Points</div>
                          <div className="text-sm font-semibold text-slate-950">{index === 0 ? '120' : index === 1 ? '80' : '50'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="stories" className="space-y-4 pb-4">
            <div>
              <p className="travel-section-eyebrow text-slate-500">Travel stories and assistant</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">A feed that feels editorial, intelligent, and personal.</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
              <div className="travel-detail-card p-4">
                <h3 className="text-lg font-semibold text-slate-950">Travel stories feed</h3>
                <div className="mt-4 space-y-3">
                  {travelStories.map((story) => (
                    <div key={story.title} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-sky-600">{story.tag}</div>
                          <div className="mt-1 text-base font-semibold text-slate-950">{story.title}</div>
                        </div>
                        <div className="text-xs text-slate-500">{story.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="travel-detail-card bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-200/70">AI travel assistant</div>
                    <div className="mt-1 text-2xl font-semibold">Ask anything about your trip</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <FiZap />
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {['Best time to visit?', 'Find family-friendly hotels', 'Voice search nearby stays', 'Create a 3-day plan'].map((prompt) => (
                    <button key={prompt} type="button" className="rounded-[1.2rem] border border-white/10 bg-white/10 px-4 py-3 text-left text-sm text-white/90 backdrop-blur">
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-200/70">Nearby attractions</div>
                  <div className="mt-2 text-lg font-semibold">Waterfalls, cafes, viewpoints, and transit connections.</div>
                  <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                    Open map <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <nav className="travel-bottom-nav">
          {travelTabs.map((item) => {
            const Icon = item.icon;
            const active = location.hash.replace('#', '') === item.id || (!location.hash && item.id === 'top');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.id === 'booking' ? openBookings() : scrollToSection(item.id))}
                className={`travel-bottom-nav-item ${active ? 'travel-bottom-nav-item-active' : ''}`}
              >
                <Icon className="icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" onClick={() => setShowFilters(true)} className="travel-floating-action" aria-label="Open filters">
          <FiFilter className="icon" />
        </button>
      </div>
    </PublicPageShell>
  );
}
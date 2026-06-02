import { useState } from 'react';
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiFilter,
  FiGlobe,
  FiMapPin,
  FiMoon,
  FiSliders,
  FiSun,
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiWifi,
} from 'react-icons/fi';

const classOptions = ['Economy', 'Premium', 'Business'];
const currencyOptions = ['INR', 'USD', 'AED'];
const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'popularity', label: 'Popularity' },
];
const busTypes = ['Sleeper', 'Semi Sleeper', 'AC', 'Non AC', 'Luxury Coach'];
const vehicleOptions = ['Own Vehicle', 'Rental Vehicle', 'Seat Booking Only'];
const stayOptions = ['Single Room', 'Couple Room', 'Family Room', 'Luxury Suite'];
const travelerTypes = ['College Students', 'Office Colleagues', 'Public Groups', 'Couples', 'Solo Travelers', 'Family'];
const socialOptions = ['Influencer Trips', 'Instagram Friendly', 'Trending Places', 'Creator Community', 'Group Meetups'];
const experienceOptions = ['Adventure', 'Relaxation', 'Nightlife', 'Trekking', 'Spiritual', 'Beach', 'Nature'];

export default function FiltersPanel({ className = '', onApply = () => {} }) {
  const [price, setPrice] = useState(850);
  const [currency, setCurrency] = useState('INR');
  const [departure, setDeparture] = useState('morning');
  const [sortBy, setSortBy] = useState('recommended');
  const [location, setLocation] = useState('');
  const [travelClass, setTravelClass] = useState('Premium');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [busType, setBusType] = useState('Sleeper');
  const [vehicleType, setVehicleType] = useState('Rental Vehicle');
  const [stayType, setStayType] = useState('Family Room');
  const [travelerType, setTravelerType] = useState('Couples');
  const [socialFilters, setSocialFilters] = useState(['Influencer Trips']);
  const [experiences, setExperiences] = useState(['Adventure']);
  const [preferences, setPreferences] = useState({ wifi: true, meals: true, boarding: false, aircon: true });

  const toggleListValue = (setter, value) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const togglePreference = (key) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const clear = () => {
    setPrice(850);
    setCurrency('INR');
    setDeparture('morning');
    setSortBy('recommended');
    setLocation('');
    setTravelClass('Premium');
    setDateFrom('');
    setDateTo('');
    setBusType('Sleeper');
    setVehicleType('Rental Vehicle');
    setStayType('Family Room');
    setTravelerType('Couples');
    setSocialFilters(['Influencer Trips']);
    setExperiences(['Adventure']);
    setPreferences({ wifi: true, meals: true, boarding: false, aircon: true });
    onApply({});
  };

  const apply = () => {
    const selectedPreferences = Object.entries(preferences)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);

    onApply({
      priceMin: 0,
      priceMax: price,
      currency,
      departure,
      sortBy,
      location,
      travelClass,
      dateFrom,
      dateTo,
      busType,
      vehicleType,
      stayType,
      travelerType,
      socialFilters,
      experiences,
      amenities: selectedPreferences,
    });
  };

  return (
    <aside className={`travel-filter-panel ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/60 px-5 py-4">
        <div>
          <p className="travel-section-eyebrow">Search filters</p>
          <h4 className="text-lg font-semibold text-slate-950">Refine the trip</h4>
        </div>
        <button type="button" onClick={clear} className="travel-chip travel-chip-ghost inline-flex items-center gap-2">
          <FiFilter /> Reset
        </button>
      </div>

      <div className="max-h-[calc(85vh-4.5rem)] space-y-5 overflow-y-auto px-5 py-5">
        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="travel-field">
              <span className="travel-field-label">Location</span>
              <div className="travel-field-control">
                <FiMapPin className="travel-field-icon" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Mumbai, Goa, Manali"
                  className="travel-field-input"
                />
              </div>
            </label>

            <label className="travel-field">
              <span className="travel-field-label">Travel class</span>
              <div className="travel-field-control">
                <FiUsers className="travel-field-icon" />
                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)} className="travel-field-input">
                  {classOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="travel-field">
              <span className="travel-field-label">Start date</span>
              <div className="travel-field-control">
                <FiCalendar className="travel-field-icon" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="travel-field-input" />
              </div>
            </label>

            <label className="travel-field">
              <span className="travel-field-label">Return date</span>
              <div className="travel-field-control">
                <FiCalendar className="travel-field-icon" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="travel-field-input" />
              </div>
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Budget filter</label>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {currency} {price.toLocaleString()}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="range"
              min="200"
              max="5000"
              step="50"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="travel-range"
            />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="travel-field-input rounded-[1rem] border border-slate-200 bg-white px-3 py-2 shadow-sm sm:w-28">
              {currencyOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Min ₹200</span>
            <span>Max ₹5,000</span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Sort by</label>
            <FiSliders className="text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => setSortBy(option.value)} className={`travel-toggle ${sortBy === option.value ? 'travel-toggle-active' : ''}`}>
                {sortBy === option.value && <FiCheck />}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['early', 'morning', 'afternoon', 'night'].map((item) => (
              <button key={item} type="button" onClick={() => setDeparture(item)} className={`travel-toggle ${departure === item ? 'travel-toggle-active' : ''}`}>
                {departure === item && <FiCheck />}
                <span className="capitalize">{item}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Location filter</label>
            <FiGlobe className="text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['GPS nearby', 'Popular destinations', 'Hidden gems', 'Near station', 'Near airport'].map((item) => (
              <button key={item} type="button" className="travel-chip travel-chip-ghost">
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Transport filter</label>
            <FiClock className="text-slate-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bus type</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {busTypes.map((item) => (
                  <button key={item} type="button" onClick={() => setBusType(item)} className={`travel-toggle ${busType === item ? 'travel-toggle-active' : ''}`}>
                    {busType === item && <FiCheck />}
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Vehicle options</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {vehicleOptions.map((item) => (
                  <button key={item} type="button" onClick={() => setVehicleType(item)} className={`travel-toggle ${vehicleType === item ? 'travel-toggle-active' : ''}`}>
                    {vehicleType === item && <FiCheck />}
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Stay filter</label>
            <FiSun className="text-slate-400" />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Room type</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stayOptions.map((item) => (
                <button key={item} type="button" onClick={() => setStayType(item)} className={`travel-toggle ${stayType === item ? 'travel-toggle-active' : ''}`}>
                  {stayType === item && <FiCheck />}
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Traveler type</label>
            <FiUsers className="text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {travelerTypes.map((item) => (
              <button key={item} type="button" onClick={() => setTravelerType(item)} className={`travel-chip ${travelerType === item ? 'travel-chip-active' : 'travel-chip-ghost'}`}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Social / influencer</label>
            <FiTag className="text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {socialOptions.map((item) => (
              <button key={item} type="button" onClick={() => toggleListValue(setSocialFilters, item)} className={`travel-chip ${socialFilters.includes(item) ? 'travel-chip-active' : 'travel-chip-ghost'}`}>
                {socialFilters.includes(item) && <FiCheck />}
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Experience filter</label>
            <FiTrendingUp className="text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {experienceOptions.map((item) => (
              <button key={item} type="button" onClick={() => toggleListValue(setExperiences, item)} className={`travel-chip ${experiences.includes(item) ? 'travel-chip-active' : 'travel-chip-ghost'}`}>
                {experiences.includes(item) && <FiCheck />}
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="travel-field-label !mb-0">Smart inclusions</label>
            <FiFilter className="text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { key: 'wifi', label: 'Wi-Fi', icon: FiWifi },
              { key: 'meals', label: 'Meals', icon: FiSun },
              { key: 'boarding', label: 'Boarding', icon: FiGlobe },
              { key: 'aircon', label: 'AC', icon: FiMoon },
            ].map((item) => {
              const ItemIcon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => togglePreference(item.key)}
                  className={`travel-toggle ${preferences[item.key] ? 'travel-toggle-active' : ''}`}
                >
                  {preferences[item.key] && <FiCheck />}
                  <ItemIcon />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button type="button" onClick={apply} className="btn-primary w-full">
            Apply filters
          </button>
          <button type="button" onClick={clear} className="btn-secondary w-full">
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}
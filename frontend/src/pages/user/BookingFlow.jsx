import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { bookingAPI } from '../../services/api';
import { PublicPageShell } from '../../components/common/PublicPageShell';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiGift,
  FiGlobe,
  FiHeart,
  FiHome,
  FiMap,
  FiMapPin,
  FiMoon,
  FiPlus,
  FiShield,
  FiStar,
  FiSun,
  FiTruck,
  FiUsers,
  FiWifi,
  FiZap,
} from 'react-icons/fi';
import { FaFemale, FaMale } from 'react-icons/fa';

const travelerProfiles = [
  { key: 'solo', label: 'Solo Traveler', icon: FiHeart, summary: 'Private pace, flexible timing, and the quickest path to adventure.' },
  { key: 'couple', label: 'Couple', icon: FiUsers, summary: 'Romantic stays, shared itineraries, and premium seating.' },
  { key: 'family', label: 'Family', icon: FiHome, summary: 'Comfort-first planning with roomier stays and safer schedules.' },
  { key: 'college', label: 'College Group', icon: FiWifi, summary: 'Budget-friendly, social, and built for shared memories.' },
  { key: 'office', label: 'Office Team', icon: FiClock, summary: 'Smooth coordination with boarding and stay alignment.' },
  { key: 'public', label: 'Public Group', icon: FiGlobe, summary: 'Open group travel with flexible add-ons and mixed preferences.' },
  { key: 'influencer', label: 'Influencer Group', icon: FiStar, summary: 'Creator-first routes, visually rich spots, and meetup access.' },
];

const vehicleModes = [
  { key: 'bus', label: 'Bus & Coach', icon: FiTruck, note: 'Sleeper, semi sleeper, AC and luxury coach options.' },
  { key: 'train', label: 'Train Berth', icon: FiMap, note: 'Rail-style comfort with berth-style allocation.' },
  { key: 'car', label: 'Car Rental', icon: FiCreditCard, note: 'Driver or self-drive rentals with flexible timing.' },
];

const rentalCards = [
  { label: 'Eco Rental', price: '₹1,990', note: 'Compact, efficient, and easy to park.' },
  { label: 'Premium SUV', price: '₹4,490', note: 'Comfortable for family and group city hops.' },
  { label: 'Luxury Sedan', price: '₹5,990', note: 'Executive comfort for premium city transfers.' },
];

const roomTypes = [
  { key: 'single', label: 'Single Room', price: 0, icon: FiSun },
  { key: 'couple', label: 'Couple Room', price: 500, icon: FiHeart },
  { key: 'family', label: 'Family Room', price: 900, icon: FiHome },
  { key: 'luxury', label: 'Luxury Suite', price: 1800, icon: FiStar },
];

const resortTypes = ['Beach Resort', 'Hill Resort', 'City Hotel', 'Boutique Stay', 'Wellness Retreat'];

const addOns = [
  { key: 'insurance', label: 'Travel insurance', note: 'Cancel-safe protection', icon: FiShield, price: 299 },
  { key: 'food', label: 'Food package', note: 'Curated meal plan', icon: FiSun, price: 499 },
  { key: 'guide', label: 'Local guide', note: 'Nearby discoveries', icon: FiMapPin, price: 699 },
  { key: 'adventure', label: 'Adventure activities', note: 'Trekking and more', icon: FiZap, price: 899 },
  { key: 'events', label: 'Event access', note: 'Festivals and shows', icon: FiGift, price: 599 },
  { key: 'creator', label: 'Creator meetup', note: 'Influencer access', icon: FiStar, price: 799 },
  { key: 'pickup', label: 'Pickup / drop', note: 'Doorstep transfer', icon: FiCreditCard, price: 449 },
];

const recommendationCards = [
  { title: 'Nearby attractions', value: 'Sunset point, coastal drive, museum trail' },
  { title: 'Trending cafes', value: '5 premium coffee stops near your stay' },
  { title: 'Influencer spots', value: '3 share-ready photo locations' },
  { title: 'Suggested activities', value: 'Boating, nightlife, beach walk, local food' },
  { title: 'Weather forecast', value: '28°C, partly sunny, breeze in the evening' },
  { title: 'Group meetup', value: '2 community meetups available on your dates' },
];

const stepMeta = [
  { title: 'Trip', subtitle: 'Preview and confirm' },
  { title: 'Traveler', subtitle: 'Choose your group' },
  { title: 'Vehicle', subtitle: 'Seat and rental flow' },
  { title: 'Stay', subtitle: 'Room and resort' },
  { title: 'Add-ons', subtitle: 'Optional upgrades' },
  { title: 'Review', subtitle: 'Payment ready' },
];

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const flowTransitions = [
  { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -18 } },
  { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -18 } },
  { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 } },
  { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 } },
  { initial: { opacity: 0, x: -18 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 18 } },
  { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } },
];

export default function BookingFlow() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, bus, selectedDate } = location.state || {};

  const [step, setStep] = useState(0);
  const [themeMode, setThemeMode] = useState('light');
  const [selectedTraveler, setSelectedTraveler] = useState(travelerProfiles[1]);
  const [travelers, setTravelers] = useState([
    { name: 'Primary traveler', note: 'Lead contact', relationship: 'Lead' },
    { name: 'Guest 2', note: 'Auto-expanded member', relationship: 'Member' },
  ]);
  const [vehicleMode, setVehicleMode] = useState('bus');
  const [selectedRental, setSelectedRental] = useState(rentalCards[1]);
  const [selectedRoom, setSelectedRoom] = useState(roomTypes[1]);
  const [selectedAddOns, setSelectedAddOns] = useState(['food', 'pickup']);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seatLoading, setSeatLoading] = useState(true);
  const [seatMap, setSeatMap] = useState([]);
  const [seatType, setSeatType] = useState(bus?.type === 'Sleeper' ? 'Sleeper' : 'Seater');
  const [boardingPoints, setBoardingPoints] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    if (!trip || !bus) {
      navigate(`/trip/${tripId}`);
    }
  }, [trip, bus, tripId, navigate]);

  useEffect(() => {
    if (!trip || !bus || !selectedDate) return;

    const loadSeatMap = async () => {
      setSeatLoading(true);
      try {
        const response = await bookingAPI.getSeatMap(tripId, {
          busId: bus._id,
          scheduleDate: selectedDate,
        });

        setSeatMap(response.data.seats || []);
        setSeatType(response.data.seatType || (bus.type === 'Sleeper' ? 'Sleeper' : 'Seater'));
        setBoardingPoints(response.data.boardingPoints || bus.assignedTrips?.[0]?.boardingPoints || []);

        if (!boardingPoint && (response.data.boardingPoints || []).length > 0) {
          setBoardingPoint((response.data.boardingPoints || [])[0]);
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load seat map');
      } finally {
        setSeatLoading(false);
      }
    };

    loadSeatMap();
  }, [trip, bus, selectedDate, tripId]);

  const currentPrice = bus?.assignedTrips?.[0]?.price || trip?.price || 0;
  const selectedPassengerBySeat = useMemo(() => new Map(passengers.map((passenger) => [passenger.seatNumber, passenger])), [passengers]);
  const availableCount = useMemo(() => seatMap.filter((seat) => seat.status === 'available').length, [seatMap]);
  const addOnTotal = useMemo(() => selectedAddOns.reduce((sum, addOnKey) => {
    const addon = addOns.find((item) => item.key === addOnKey);
    return sum + (addon?.price || 0);
  }, 0), [selectedAddOns]);
  const roomAdjustment = selectedRoom?.price || 0;
  const couponDiscount = couponApplied ? 300 : 0;
  const summaryTotal = (currentPrice * Math.max(selectedSeats.length, 1)) + addOnTotal + roomAdjustment - couponDiscount;
  const progress = ((step + 1) / stepMeta.length) * 100;

  const toggleAddOn = (key) => {
    setSelectedAddOns((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const addTraveler = () => {
    setTravelers((current) => [...current, { name: `Guest ${current.length + 1}`, note: 'Add traveler details', relationship: 'Member' }]);
  };

  const updateTraveler = (index, field, value) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSeatSelect = (seat) => {
    const normalizedStatus = seat.status === 'blocked' ? 'processing' : seat.status;

    if (normalizedStatus !== 'available' && normalizedStatus !== 'selected') return;

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter((value) => value !== seat.seatNumber));
      setPassengers(passengers.filter((passenger) => passenger.seatNumber !== seat.seatNumber));
      return;
    }

    setSelectedSeats([...selectedSeats, seat.seatNumber]);
    setPassengers([...passengers, { seatNumber: seat.seatNumber, name: '', age: '', gender: 'M' }]);
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setPassengers([]);
  };

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (passengers.some((passenger) => !passenger.name)) {
      toast.error('Please fill all passenger details');
      return;
    }

    if (!boardingPoint) {
      toast.error('Please select a boarding point');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        tripId: trip._id,
        busId: bus._id,
        selectedSeats,
        passengers: passengers.map((passenger) => ({
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          seatNumber: passenger.seatNumber,
        })),
        boardingPoint,
        scheduleDate: selectedDate,
      };

      const response = await bookingAPI.initiateBooking(bookingData);
      navigate(`/payment/${response.data.bookingId}`, {
        state: { orderId: response.data.orderId, amount: response.data.amount, trip, bus, selectedDate, selectedSeats },
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const stepBack = () => setStep((current) => Math.max(0, current - 1));
  const stepForward = () => {
    if (step === stepMeta.length - 1) {
      handleProceedToPayment();
      return;
    }

    if (step === 2 && selectedSeats.length === 0) {
      toast.error('Pick at least one available seat');
      return;
    }

    setStep((current) => Math.min(stepMeta.length - 1, current + 1));
  };

  const renderSeatButton = (seat) => {
    const normalizedStatus = seat.status === 'blocked' ? 'processing' : seat.status;
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const passenger = selectedPassengerBySeat.get(seat.seatNumber);
    const gender = passenger?.gender || 'M';

    const baseClasses = 'relative flex min-h-[4.4rem] w-full flex-col items-center justify-center rounded-[1.25rem] border text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClasses = seatType === 'Sleeper' ? 'py-4 px-3' : 'py-3 px-2';

    let stateClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-300';

    if (normalizedStatus === 'booked') {
      stateClasses = 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed line-through';
    } else if (normalizedStatus === 'processing') {
      stateClasses = 'bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed';
    } else if (isSelected) {
      stateClasses = gender === 'F'
        ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20 focus:ring-rose-300'
        : gender === 'Other'
          ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20 focus:ring-violet-300'
          : 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 focus:ring-blue-300';
    }

    return (
      <button
        type="button"
        key={seat.seatNumber}
        onClick={() => handleSeatSelect(seat)}
        disabled={normalizedStatus === 'booked' || normalizedStatus === 'processing'}
        className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">{seatType}</span>
        <span className="mt-1 text-base font-bold leading-none">{seat.label}</span>
        <span className="mt-1 text-xs font-medium opacity-90">{seat.seatNumber}</span>

        {isSelected && (
          <span className="absolute left-2 top-2 rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur">
            {gender === 'F' ? <FaFemale className="inline-block text-xs" /> : <FaMale className="inline-block text-xs" />} {gender}
          </span>
        )}

        {!isSelected && (normalizedStatus === 'booked' || normalizedStatus === 'processing') && (
          <span className="absolute right-2 top-2 text-xs">
            {normalizedStatus === 'booked' ? <FiCheck /> : <FiClock />}
          </span>
        )}
      </button>
    );
  };

  if (!trip || !bus) return null;

  const heroImage = trip.images?.[0]?.url || trip.thumbnail || '/banner-fallback.svg';
  const stepVariant = flowTransitions[step] || flowTransitions[0];

  const summaryItems = [
    { label: 'Place', value: trip.location || 'Selected destination' },
    { label: 'Date', value: selectedDate ? formatDate(selectedDate) : 'Pick a date' },
    { label: 'Travelers', value: `${Math.max(selectedSeats.length, travelers.length)} people` },
    { label: 'Transport Type', value: vehicleMode === 'car' ? 'Car rental' : vehicleMode === 'train' ? 'Train berth' : bus?.type || 'Bus seat booking' },
    { label: 'Stay Type', value: selectedRoom?.label || 'Premium stay' },
  ];

  return (
    <PublicPageShell eyebrow="Cinematic Booking" title="Book in smooth premium steps" subtitle="A futuristic, mobile-first booking flow with glassmorphism, cinematic transitions, and one-hand usability." className="pb-12" showHeader>
      <div className={`booking-flow-shell ${themeMode === 'dark' ? 'booking-flow-shell-dark' : 'booking-flow-shell-light'}`}>
        <div className="mx-auto max-w-[430px] px-4 pb-32 pt-4 sm:max-w-3xl lg:max-w-6xl lg:px-6">
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="booking-hero-card">
            <div className="absolute -left-16 top-6 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute right-0 top-10 h-40 w-40 rounded-full bg-orange-300/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => navigate(-1)} className="travel-chip travel-chip-ghost bg-white/10 text-white/90">
                    <FiArrowLeft /> Back
                  </button>
                  <button type="button" onClick={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))} className="travel-chip travel-chip-ghost bg-white/10 text-white/90">
                    {themeMode === 'light' ? <FiMoon /> : <FiSun />} {themeMode === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-sky-100/80">Trip selection screen</p>
                  <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Select the journey, then glide through travelers, vehicle, stay, add-ons, and checkout.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200/85 sm:text-base">
                    Designed for premium one-hand mobile usability with cinematic cards, smooth motion, and a modern investor-ready presentation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {stepMeta.map((item, index) => (
                    <button key={item.title} type="button" onClick={() => setStep(index)} className={`booking-step-pill ${step === index ? 'booking-step-pill-active' : ''}`}>
                      {index + 1}. {item.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-stepper-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-200/70">Progress</div>
                    <div className="mt-1 text-xl font-semibold text-white">Step {step + 1} of {stepMeta.length}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-white backdrop-blur">
                    <FiZap />
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-orange-400" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-100/85">
                  <div className="rounded-[1rem] bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200/65">Seats</div>
                    <div className="mt-1 font-semibold">{selectedSeats.length}</div>
                  </div>
                  <div className="rounded-[1rem] bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200/65">Add-ons</div>
                    <div className="mt-1 font-semibold">{selectedAddOns.length}</div>
                  </div>
                  <div className="rounded-[1rem] bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200/65">Total</div>
                    <div className="mt-1 font-semibold">₹{summaryTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-5">
              <section className="booking-preview-card overflow-hidden">
                <div className="relative h-64 sm:h-80">
                  <img
                    src={heroImage}
                    alt={trip.title}
                    className="h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/banner-fallback.svg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">{trip.location}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">{selectedDate ? formatDate(selectedDate) : 'Select a date'}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">{bus.busNumber}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">{trip.title}</h2>
                    <p className="mt-2 max-w-xl text-sm text-slate-100/85">{trip.shortDescription || trip.description}</p>
                  </div>
                </div>
                <div className="grid gap-3 bg-white p-4 sm:grid-cols-5">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="booking-summary-chip">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={stepVariant.initial} animate={stepVariant.animate} exit={stepVariant.exit} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="space-y-5">
                  {step === 0 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Trip selection screen</h3>
                        <p className="booking-panel-subtitle">Preview the destination and confirm the core trip details.</p>
                      </div>
                      <div className="booking-panel-body space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {summaryItems.map((item) => (
                            <div key={item.label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                              <div className="mt-1 text-lg font-semibold text-slate-950">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-[1.35rem] border border-sky-100 bg-sky-50/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.22em] text-sky-700/70">Floating CTA</div>
                              <div className="mt-1 text-lg font-semibold text-slate-950">Continue booking</div>
                            </div>
                            <FiArrowRight className="text-sky-600" />
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Move into traveler selection, then vehicle, stay, and add-ons without losing context.</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {step === 1 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Traveler selection experience</h3>
                        <p className="booking-panel-subtitle">Choose a group style and auto-expand the traveler details panel.</p>
                      </div>
                      <div className="booking-panel-body space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {travelerProfiles.map((profile) => {
                            const ProfileIcon = profile.icon;
                            const isActive = selectedTraveler.key === profile.key;
                            return (
                              <button
                                key={profile.key}
                                type="button"
                                onClick={() => {
                                  setSelectedTraveler(profile);
                                  const defaultCount = profile.key === 'family' ? 4 : profile.key === 'college' || profile.key === 'public' || profile.key === 'influencer' ? 3 : profile.key === 'office' ? 5 : profile.key === 'solo' ? 1 : 2;
                                  setTravelers(Array.from({ length: defaultCount }, (_, index) => ({
                                    name: index === 0 ? 'Primary traveler' : `Guest ${index + 1}`,
                                    note: index === 0 ? 'Lead contact' : 'Auto-expanded member',
                                    relationship: index === 0 ? 'Lead' : 'Member',
                                  })));
                                }}
                                className={`booking-option-card ${isActive ? 'booking-option-card-active' : ''}`}
                              >
                                <span className={`booking-option-icon ${isActive ? 'booking-option-icon-active' : ''}`}>
                                  <ProfileIcon />
                                </span>
                                <span className="mt-3 block text-base font-semibold text-slate-950">{profile.label}</span>
                                <span className="mt-1 block text-xs text-slate-500">{profile.summary}</span>
                              </button>
                            );
                          })}
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Expanded details</div>
                              <div className="mt-1 text-lg font-semibold text-slate-950">{selectedTraveler.label}</div>
                            </div>
                            <button type="button" onClick={addTraveler} className="travel-chip travel-chip-active">
                              <FiPlus /> Add member
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {travelers.map((member, index) => (
                              <div key={`${member.name}-${index}`} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-slate-950">{member.name}</div>
                                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{member.relationship}</span>
                                </div>
                                <input type="text" value={member.name} onChange={(event) => updateTraveler(index, 'name', event.target.value)} className="input-field mt-3" placeholder="Traveler name" />
                                <input type="text" value={member.note} onChange={(event) => updateTraveler(index, 'note', event.target.value)} className="input-field mt-3" placeholder="Preference note" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Vehicle & seat booking flow</h3>
                        <p className="booking-panel-subtitle">Swipe categories, choose a vehicle mode, then lock seats with glowing availability cues.</p>
                      </div>
                      <div className="booking-panel-body space-y-5">
                        <div className="booking-vehicle-strip">
                          {vehicleModes.map((vehicle) => {
                            const VehicleIcon = vehicle.icon;
                            const isActive = vehicleMode === vehicle.key;
                            return (
                              <button key={vehicle.key} type="button" onClick={() => setVehicleMode(vehicle.key)} className={`booking-vehicle-card ${isActive ? 'booking-vehicle-card-active' : ''}`}>
                                <VehicleIcon className="text-xl" />
                                <span className="mt-2 text-sm font-semibold">{vehicle.label}</span>
                                <span className="mt-1 text-xs text-slate-500">{vehicle.note}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <button type="button" onClick={() => setVehicleMode('bus')} className={`booking-segment ${vehicleMode === 'bus' ? 'booking-segment-active' : ''}`}>
                            <FiTruck /> Bus seat booking
                          </button>
                          <button type="button" onClick={() => setVehicleMode('train')} className={`booking-segment ${vehicleMode === 'train' ? 'booking-segment-active' : ''}`}>
                            <FiMap /> Train berth
                          </button>
                          <button type="button" onClick={() => setVehicleMode('car')} className={`booking-segment ${vehicleMode === 'car' ? 'booking-segment-active' : ''}`}>
                            <FiCreditCard /> Own vehicle / rental
                          </button>
                        </div>

                        {vehicleMode === 'car' && (
                          <div className="grid gap-3 sm:grid-cols-3">
                            {rentalCards.map((rental) => (
                              <button key={rental.label} type="button" onClick={() => setSelectedRental(rental)} className={`booking-option-card text-left ${selectedRental.label === rental.label ? 'booking-option-card-active' : ''}`}>
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br from-slate-950 to-blue-700 text-white shadow-lg">
                                  <FiCreditCard />
                                </span>
                                <span className="mt-3 block text-base font-semibold text-slate-950">{rental.label}</span>
                                <span className="mt-1 block text-xs text-slate-500">{rental.note}</span>
                                <span className="mt-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{rental.price}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Interactive seat layout</div>
                              <div className="mt-1 text-lg font-semibold text-slate-950">{bus.busNumber} • {seatType}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <FiCheck /> {availableCount} live seats
                            </div>
                          </div>

                          <div className="mt-4 rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <FiUsers /> Seat legend
                              </div>
                              <div className="text-xs text-slate-500">Tap a seat to reserve it</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { label: 'Available', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                { label: 'Selected', className: 'bg-blue-600 text-white border-blue-600' },
                                { label: 'Booked', className: 'bg-slate-200 text-slate-500 border-slate-300' },
                                { label: 'Processing', className: 'bg-amber-100 text-amber-700 border-amber-200' },
                              ].map((item) => (
                                <span key={item.label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.className}`}>{item.label}</span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-center rounded-[1.35rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
                            <div className="text-center">
                              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur">
                                <FiUsers /> Driver cabin
                              </div>
                              <div className="mx-auto mt-3 h-8 w-20 rounded-xl bg-gradient-to-r from-slate-500 to-slate-300" />
                            </div>
                          </div>

                          <div className={`mt-4 grid gap-3 ${seatType === 'Sleeper' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-4'}`}>
                            {seatLoading
                              ? Array.from({ length: 12 }, (_, index) => (
                                  <div key={index} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100" />
                                ))
                              : seatMap.map((seat) => renderSeatButton(seat))}
                          </div>
                        </div>

                        {selectedSeats.length > 0 && (
                          <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-slate-950">Passenger details</h4>
                              <span className="text-sm text-slate-500">One card per seat</span>
                            </div>
                            <div className="space-y-4">
                              {passengers.map((passenger, index) => (
                                <motion.div key={passenger.seatNumber} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div className="font-medium text-slate-900">Seat {passenger.seatNumber}</div>
                                    <button type="button" onClick={() => handleSeatSelect({ seatNumber: passenger.seatNumber, status: 'available' })} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                                      Remove
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <input type="text" placeholder="Full name" value={passenger.name} onChange={(event) => updatePassenger(index, 'name', event.target.value)} className="input-field" />
                                    <input type="number" placeholder="Age" value={passenger.age} onChange={(event) => updatePassenger(index, 'age', event.target.value)} className="input-field" />
                                    <select value={passenger.gender} onChange={(event) => updatePassenger(index, 'gender', event.target.value)} className="input-field">
                                      <option value="M">Male</option>
                                      <option value="F">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {step === 3 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Stay & room selection</h3>
                        <p className="booking-panel-subtitle">Luxury room choices, resort filters, and an expandable amenities section.</p>
                      </div>
                      <div className="booking-panel-body space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {resortTypes.map((item) => (
                            <button key={item} type="button" className="travel-chip travel-chip-ghost">{item}</button>
                          ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {roomTypes.map((room) => {
                            const RoomIcon = room.icon;
                            const isActive = selectedRoom.key === room.key;
                            return (
                              <button key={room.key} type="button" onClick={() => setSelectedRoom(room)} className={`booking-option-card text-left ${isActive ? 'booking-option-card-active' : ''}`}>
                                <span className={`booking-option-icon ${isActive ? 'booking-option-icon-active' : ''}`}>
                                  <RoomIcon />
                                </span>
                                <span className="mt-3 block text-base font-semibold text-slate-950">{room.label}</span>
                                <span className="mt-1 block text-xs text-slate-500">Glassmorphism booking card</span>
                                <span className="mt-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">+₹{room.price}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Amenities</div>
                                <div className="mt-1 text-lg font-semibold text-slate-950">Expandable section</div>
                              </div>
                              <FiPlus className="text-slate-400" />
                            </div>
                            <details className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                              <summary className="cursor-pointer text-sm font-semibold text-slate-900">Show included stay amenities</summary>
                              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                                {['Wi-Fi', 'Breakfast', 'Pool', 'Spa', 'Late checkout', 'Airport pickup'].map((item) => (
                                  <span key={item} className="rounded-full bg-white px-3 py-1 shadow-sm">{item}</span>
                                ))}
                              </div>
                            </details>
                          </div>

                          <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Price comparison</div>
                            <div className="mt-3 space-y-3">
                              {roomTypes.map((room) => (
                                <div key={room.key} className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 p-3 text-sm">
                                  <span className="font-medium text-slate-800">{room.label}</span>
                                  <span className="font-semibold text-slate-950">₹{room.price + currentPrice}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {step === 4 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Smart add-ons screen</h3>
                        <p className="booking-panel-subtitle">Layer in travel insurance, food, guide, adventure, event and creator access with one tap.</p>
                      </div>
                      <div className="booking-panel-body">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {addOns.map((item) => {
                            const AddOnIcon = item.icon;
                            const isActive = selectedAddOns.includes(item.key);
                            return (
                              <button key={item.key} type="button" onClick={() => toggleAddOn(item.key)} className={`booking-addon-card ${isActive ? 'booking-addon-card-active' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <span className={`booking-addon-icon ${isActive ? 'booking-addon-icon-active' : ''}`}>
                                    <AddOnIcon />
                                  </span>
                                  <span className={`booking-toggle ${isActive ? 'booking-toggle-active' : ''}`}>
                                    {isActive ? <FiCheck /> : null}
                                  </span>
                                </div>
                                <div className="mt-4 text-left">
                                  <div className="text-base font-semibold text-slate-950">{item.label}</div>
                                  <div className="mt-1 text-xs text-slate-500">{item.note}</div>
                                  <div className="mt-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">+₹{item.price}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}

                  {step === 5 && (
                    <section className="booking-panel">
                      <div className="booking-panel-header">
                        <h3 className="booking-panel-title">Review and payment ready</h3>
                        <p className="booking-panel-subtitle">Confirm your booking summary, apply a coupon, and continue to checkout.</p>
                      </div>
                      <div className="booking-panel-body space-y-4">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-lg">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.24em] text-slate-300/70">Floating payment summary</div>
                              <div className="mt-1 text-3xl font-semibold text-orange-300">₹{summaryTotal.toLocaleString()}</div>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                              <FiCreditCard />
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100/85">
                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">Secure payment</span>
                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">UPI / Card / Wallet</span>
                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">EMI supported</span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="travel-field">
                            <span className="travel-field-label">Coupon apply section</span>
                            <div className="travel-field-control">
                              <input type="text" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter coupon code" className="travel-field-input" />
                              <button type="button" onClick={() => setCouponApplied(Boolean(couponCode.trim()))} className="travel-chip travel-chip-active">
                                Apply
                              </button>
                            </div>
                          </label>

                          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Secure payment badge</div>
                                <div className="mt-1 text-base font-semibold text-slate-950">Encrypted checkout</div>
                              </div>
                              <FiShield className="text-sky-600" />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <button type="button" className="booking-segment booking-segment-active"><FiClock /> UPI</button>
                          <button type="button" className="booking-segment"><FiCreditCard /> Card</button>
                          <button type="button" className="booking-segment"><FiHeart /> Wallet</button>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
                          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Smart recommendations after booking</div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {recommendationCards.map((item) => (
                                <div key={item.title} className="rounded-[1.2rem] bg-slate-50 p-4">
                                  <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">One-click summary</div>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                              <div className="flex justify-between gap-3"><span>Base seats</span><span>₹{currentPrice * Math.max(selectedSeats.length, 1)}</span></div>
                              <div className="flex justify-between gap-3"><span>Add-ons</span><span>₹{addOnTotal}</span></div>
                              <div className="flex justify-between gap-3"><span>Room upgrade</span><span>₹{roomAdjustment}</span></div>
                              <div className="flex justify-between gap-3"><span>Coupon</span><span>-₹{couponDiscount}</span></div>
                              <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 font-bold text-slate-950"><span>Total</span><span>₹{summaryTotal.toLocaleString()}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <section className="booking-panel">
                <div className="booking-panel-header">
                  <h3 className="booking-panel-title">Live booking summary</h3>
                  <p className="booking-panel-subtitle">Everything updates as you move through the flow.</p>
                </div>
                <div className="booking-panel-body space-y-4">
                  <div className="rounded-[1.35rem] bg-slate-950 p-4 text-white shadow-lg">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-300/70">Total amount</div>
                    <div className="mt-2 text-3xl font-semibold text-orange-300">₹{summaryTotal.toLocaleString()}</div>
                    <div className="mt-1 text-sm text-slate-200/80">Premium travel flow with a single checkout handoff.</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Trip</span><span className="text-right font-medium text-slate-950">{trip.title}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Destination</span><span className="text-right font-medium text-slate-950">{trip.location}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Date</span><span className="text-right font-medium text-slate-950">{selectedDate ? formatDate(selectedDate) : 'Choose a date'}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Vehicle</span><span className="text-right font-medium text-slate-950">{vehicleMode === 'car' ? selectedRental.label : vehicleMode === 'train' ? 'Train berth' : bus.busNumber}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Room</span><span className="text-right font-medium text-slate-950">{selectedRoom.label}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Seats</span><span className="text-right font-medium text-slate-950">{selectedSeats.join(', ') || 'Not selected yet'}</span></div>
                    <div className="flex items-start justify-between gap-3"><span className="text-slate-500">Add-ons</span><span className="text-right font-medium text-slate-950">{selectedAddOns.length} selected</span></div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">AI smart recommendations</div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div>Nearby attractions: coastal viewpoint, old town, sky deck.</div>
                      <div>Trending cafes: artisan coffee, sunset bar, vegan bites.</div>
                      <div>Weather: 28°C, sunny with light evening wind.</div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                    {vehicleMode === 'car'
                      ? 'Car rental mode keeps the flow flexible for self-drive or chauffeur options.'
                      : seatType === 'Sleeper'
                        ? 'Sleeper seats are arranged as premium upper and lower berths.'
                        : 'Seater layout is optimized for quick one-hand seat selection.'}
                  </div>
                </div>
              </section>

              <section className="booking-panel">
                <div className="booking-panel-header">
                  <h3 className="booking-panel-title">Sticky CTA</h3>
                </div>
                <div className="booking-panel-body space-y-3">
                  <button onClick={stepBack} disabled={step === 0} className="btn-secondary w-full">Back</button>
                  <button onClick={stepForward} disabled={loading} className="btn-primary w-full">
                    {step === stepMeta.length - 1 ? (loading ? 'Processing...' : 'Continue to Payment') : 'Continue Booking'}
                  </button>
                  <button type="button" onClick={clearSelection} className="flex w-full items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Clear seat selection <FiArrowRight />
                  </button>
                  <Link to={`/trip/${tripId}`} className="flex items-center justify-between rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Back to trip details <FiArrowRight />
                  </Link>
                </div>
              </section>
            </aside>
          </div>

          <div className="booking-bottom-bar lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Step {step + 1}/{stepMeta.length}</div>
                <div className="text-sm font-semibold text-slate-950">{stepMeta[step].title}</div>
              </div>
              <button onClick={stepForward} className="btn-primary px-4 py-3">{step === stepMeta.length - 1 ? 'Pay now' : 'Next'}</button>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { FiUser, FiMapPin, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function BookingFlow() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { trip, bus, selectedDate } = location.state || {};
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Generate seat map (simplified)
  const totalSeats = bus?.totalSeats || 40;
  const seatRows = Math.ceil(totalSeats / 4);
  
  useEffect(() => {
    if (!trip || !bus) {
      navigate(`/trip/${tripId}`);
    }
  }, [trip, bus, tripId, navigate]);
  
  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      setPassengers(passengers.filter(p => p.seatNumber !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
      setPassengers([...passengers, { seatNumber, name: '', age: '', gender: 'M' }]);
    }
  };
  
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };
  
  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    
    if (passengers.some(p => !p.name)) {
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
        passengers: passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: p.seatNumber
        })),
        boardingPoint,
        scheduleDate: selectedDate
      };
      
      const response = await bookingAPI.initiateBooking(bookingData);
      navigate(`/payment/${response.data.bookingId}`, {
        state: { orderId: response.data.orderId, amount: response.data.amount }
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };
  
  if (!trip || !bus) return null;
  
  return (
    <PublicPageShell
      eyebrow="Seat Booking"
      title="Select seats and passenger details"
      subtitle="A guided booking flow with clear pricing, boarding point selection, and payment handoff."
      className="pb-12"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Select Seats</h2>
              <p className="dashboard-panel-subtitle">Pick one or more seats for this booking.</p>
            </div>
            <div className="dashboard-panel-body">
              <div className="mb-8">
                <div className="flex justify-center mb-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-center">
                    <div className="text-sm text-slate-500">Driver</div>
                    <div className="mt-2 h-8 w-16 rounded bg-slate-400"></div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {Array.from({ length: totalSeats }, (_, i) => {
                    const seatNumber = (i + 1).toString();
                    const isSelected = selectedSeats.includes(seatNumber);
                    const isAvailable = true; // Check availability from API
                    
                    return (
                      <button
                        key={i}
                        onClick={() => isAvailable && handleSeatSelect(seatNumber)}
                        disabled={!isAvailable}
                        className={`
                          p-3 rounded-lg text-center font-medium transition-all
                          ${isSelected 
                            ? 'bg-orange-500 text-white' 
                            : isAvailable 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-900">Passenger Details</h3>
                  <div className="space-y-4">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="font-medium mb-3 text-slate-900">Seat {passenger.seatNumber}</div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            className="input-field"
                          />
                          <input
                            type="number"
                            placeholder="Age"
                            value={passenger.age}
                            onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                            className="input-field"
                          />
                          <select
                            value={passenger.gender}
                            onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                            className="input-field"
                          >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="dashboard-panel sticky top-24">
            <div className="dashboard-panel-header">
              <h3 className="dashboard-panel-title">Booking Summary</h3>
            </div>
            <div className="dashboard-panel-body">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Trip:</span>
                  <span className="font-medium text-slate-900">{trip.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="text-slate-900">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bus:</span>
                  <span className="text-slate-900">{bus.busNumber} ({bus.type})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Seats:</span>
                  <span className="text-slate-900">{selectedSeats.join(', ') || 'None'}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-orange-500">₹{trip.price * selectedSeats.length}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Boarding Point</label>
                <select
                  className="input-field"
                  value={boardingPoint?.name || ''}
                  onChange={(e) => {
                    const point = bus.assignedTrips?.[0]?.boardingPoints?.find(
                      p => p.name === e.target.value
                    );
                    setBoardingPoint(point);
                  }}
                >
                  <option value="">Select a boarding point</option>
                  {bus.assignedTrips?.[0]?.boardingPoints?.map((point, i) => (
                    <option key={i} value={point.name}>
                      {point.name} - {point.time}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={loading || selectedSeats.length === 0}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
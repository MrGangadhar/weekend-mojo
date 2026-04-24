import { useState, useEffect } from 'react';
import { conductorAPI } from '../../services/conductorAPI';
import { FiUsers, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiPhone, FiBell } from 'react-icons/fi';
import { BiBus } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function ConductorPanel() {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAssignedTrips();
  }, []);
  
  const fetchAssignedTrips = async () => {
    try {
      const response = await conductorAPI.getAssignedTrips();
      setUpcomingTrips(response.data.upcomingTrips);
      setActiveTrips(response.data.activeTrips);
    } catch (error) {
      toast.error('Failed to fetch assigned trips');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPassengerList = async (trip) => {
    try {
      const response = await conductorAPI.getPassengerList({
        tripId: trip.tripId,
        busId: trip.busId,
        scheduleDate: trip.schedule
      });
      setPassengers(response.data);
      setSelectedTrip(trip);
    } catch (error) {
      toast.error('Failed to fetch passenger list');
    }
  };
  
  const updateCheckin = async (bookingId, seatNumber, checkedIn) => {
    try {
      await conductorAPI.updateCheckinStatus({ bookingId, seatNumber, checkedIn });
      toast.success(`Passenger ${checkedIn ? 'checked in' : 'marked as not checked'}`);
      fetchPassengerList(selectedTrip);
    } catch (error) {
      toast.error('Failed to update check-in status');
    }
  };
  
  const sendReminder = async (bookingId, userId, mobile) => {
    try {
      await conductorAPI.sendReminder({ bookingId, userId, mobile });
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const tripMetrics = [
    {
      title: 'Active Trips',
      value: activeTrips.length,
      icon: BiBus,
      color: 'bg-green-500',
      note: 'Trips currently on route',
    },
    {
      title: 'Upcoming Trips',
      value: upcomingTrips.length,
      icon: FiClock,
      color: 'bg-orange-500',
      note: 'Trips scheduled next',
    },
    {
      title: 'Total Assigned',
      value: activeTrips.length + upcomingTrips.length,
      icon: FiUsers,
      color: 'bg-blue-500',
      note: 'Total trip assignments',
    },
  ];
  
  return (
    <DashboardShell
      eyebrow="Conductor Portal"
      title="Assigned Trips"
      subtitle="Monitor upcoming departures, active runs, and passenger check-ins in one view."
      metrics={tripMetrics}
    >
      {!selectedTrip ? (
          <>
            {/* Active Trips */}
            {activeTrips.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BiBus className="mr-2 text-green-600" />
                  Active Trips
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTrips.map((trip) => (
                    <div key={trip.tripId} className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                         onClick={() => fetchPassengerList(trip)}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{trip.tripName}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <BiBus className="mr-2" />
                        <span>{trip.busNumber}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FiClock className="mr-2" />
                        <span>{new Date(trip.schedule).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming Trips */}
            {upcomingTrips.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiClock className="mr-2 text-orange-600" />
                  Upcoming Trips
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.tripId} className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                         onClick={() => fetchPassengerList(trip)}>
                      <h3 className="font-semibold text-lg mb-2">{trip.tripName}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <BiBus className="mr-2" />
                        <span>{trip.busNumber}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <FiClock className="mr-2" />
                        <span>{new Date(trip.schedule).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTrips.length === 0 && upcomingTrips.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No trips assigned yet</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Trip Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTrip.tripName}</h2>
                  <p className="text-gray-600">Bus: {selectedTrip.busNumber}</p>
                  <p className="text-gray-600 text-sm">
                    Departure: {new Date(selectedTrip.schedule).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </div>
            </div>
            
            {/* Passenger List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold">Passenger List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Check-in</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {passengers.map((passenger) => (
                      <tr key={passenger.bookingId}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{passenger.passengerName}</div>
                            <div className="text-sm text-gray-500">{passenger.mobile}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {passenger.seats.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {Object.values(passenger.checkinStatus).some(v => v === true) ? (
                            <span className="flex items-center text-green-600">
                              <FiCheckCircle className="mr-1" />
                              Checked In
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <FiXCircle className="mr-1" />
                              Not Checked In
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <a href={`tel:${passenger.mobile}`}
                               className="text-blue-600 hover:text-blue-800">
                              <FiPhone className="w-5 h-5" />
                            </a>
                            <button
                              onClick={() => sendReminder(passenger.bookingId, passenger.userId, passenger.mobile)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <FiBell className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              const allChecked = Object.values(passenger.checkinStatus).every(v => v === true);
                              passenger.seats.forEach(seat => {
                                updateCheckin(passenger.bookingId, seat, !allChecked);
                              });
                            }}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              Object.values(passenger.checkinStatus).some(v => v === true)
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {Object.values(passenger.checkinStatus).some(v => v === true) ? 'Undo' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </DashboardShell>
  );
}
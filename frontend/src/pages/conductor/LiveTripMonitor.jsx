import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { conductorAPI } from '../../services/api';
import { getSocket, joinTripRoom, updateBusLocation } from '../../services/socket';
import { FiMap, FiNavigation, FiClock, FiUsers, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

export default function LiveTripMonitor() {
  const { tripId, busId } = useParams();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [tripSummary, setTripSummary] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [map, setMap] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);
  
  useEffect(() => {
    fetchTripData();
    startLocationTracking();
    
    // Initialize socket
    socketRef.current = getSocket();
    socketRef.current.connect();
    joinTripRoom(tripId);
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [tripId, busId]);
  
  const fetchTripData = async () => {
    try {
      const [summaryRes, passengersRes] = await Promise.all([
        conductorAPI.getTripSummary({ tripId, busId }),
        conductorAPI.getPassengerList({ tripId, busId })
      ]);
      setTripSummary(summaryRes.data);
      setPassengers(passengersRes.data);
      
      // Get current bus location from backend
      const locationRes = await conductorAPI.getBusLocation(busId);
      if (locationRes.data) {
        setCurrentLocation(locationRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch trip data');
    } finally {
      setLoading(false);
    }
  };
  
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        
        // Update location on server
        if (!updating) {
          updateBusLocationOnServer(location, position.coords.speed, position.coords.heading);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };
  
  const updateBusLocationOnServer = async (location, speed, heading) => {
    setUpdating(true);
    try {
      await conductorAPI.updateBusLocation({
        busId,
        location,
        speed: speed || 0,
        heading: heading || 0
      });
      
      // Emit via socket for real-time updates
      updateBusLocation({
        busId,
        tripId,
        location,
        speed: speed || 0,
        heading: heading || 0
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  const manualLocationUpdate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          updateBusLocationOnServer(location, position.coords.speed, position.coords.heading);
          toast.success('Location updated successfully');
        },
        (error) => {
          toast.error('Unable to get current location');
        }
      );
    }
  };
  
  const getCompletionColor = () => {
    if (!tripSummary) return 'bg-gray-500';
    const percentage = tripSummary.completionRate;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const tripMetrics = [
    {
      title: 'Passengers',
      value: tripSummary?.totalPassengers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      note: 'Passengers on this trip',
    },
    {
      title: 'Checked In',
      value: tripSummary?.checkedInCount || 0,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      note: 'Passengers already verified',
    },
    {
      title: 'Pending',
      value: tripSummary?.pendingCount || 0,
      icon: FiAlertCircle,
      color: 'bg-red-500',
      note: 'Passengers remaining',
    },
    {
      title: 'Completion',
      value: `${tripSummary?.completionRate?.toFixed(1) || 0}%`,
      icon: FiClock,
      color: 'bg-orange-500',
      note: 'Check-in progress rate',
    },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <DashboardShell
      eyebrow="Conductor Portal"
      title="Live Trip Monitor"
      subtitle="Track the bus in real time, verify passengers, and manage trip actions without leaving the page."
      actions={
        <button
          onClick={manualLocationUpdate}
          disabled={updating}
          className="btn-primary flex items-center"
        >
          <FiRefreshCw className={`mr-2 ${updating ? 'animate-spin' : ''}`} />
          Update Location
        </button>
      }
      metrics={tripMetrics}
    >
      {/* Header */}
      <div className="space-y-6">
          <button
            onClick={() => navigate('/conductor')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Trips
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Live Trip Monitor</h1>
                <p className="text-gray-600 mt-1">Track your bus in real-time and monitor passenger check-ins</p>
              </div>
              <button
                onClick={manualLocationUpdate}
                disabled={updating}
                className="btn-primary flex items-center"
              >
                <FiRefreshCw className={`mr-2 ${updating ? 'animate-spin' : ''}`} />
                Update Location
              </button>
            </div>
          </div>
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Passengers</div>
                <div className="text-2xl font-bold text-gray-800">{tripSummary?.totalPassengers || 0}</div>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Checked In</div>
                <div className="text-2xl font-bold text-green-600">{tripSummary?.checkedInCount || 0}</div>
              </div>
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Pending</div>
                <div className="text-2xl font-bold text-red-600">{tripSummary?.pendingCount || 0}</div>
              </div>
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Completion Rate</div>
                <div className="text-2xl font-bold text-orange-600">{tripSummary?.completionRate?.toFixed(1) || 0}%</div>
              </div>
              <div className={`w-12 h-12 rounded-full ${getCompletionColor()} flex items-center justify-center text-white font-bold`}>
                {Math.round(tripSummary?.completionRate || 0)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Map and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation || defaultCenter}
                zoom={13}
                onLoad={setMap}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  fullscreenControl: true
                }}
              >
                {currentLocation && (
                  <Marker
                    position={currentLocation}
                    icon={{
                      url: '/bus-marker.png',
                      scaledSize: new window.google.maps.Size(50, 50)
                    }}
                    onClick={() => setShowInfo(true)}
                  >
                    {showInfo && (
                      <InfoWindow position={currentLocation} onCloseClick={() => setShowInfo(false)}>
                        <div>
                          <h3 className="font-semibold">Current Bus Location</h3>
                          <p className="text-sm">Lat: {currentLocation.lat.toFixed(6)}</p>
                          <p className="text-sm">Lng: {currentLocation.lng.toFixed(6)}</p>
                          <p className="text-sm text-green-600">Live Tracking Active</p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )}
              </GoogleMap>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Trip Information</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Bus Number</div>
                  <div className="font-medium">{tripSummary?.busNumber || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Current Status</div>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-green-600 font-medium">On Route</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="font-medium">
                    {currentLocation?.timestamp 
                      ? new Date(currentLocation.timestamp).toLocaleTimeString()
                      : 'Just now'}
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm text-gray-500 mb-2">Check-in Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${tripSummary?.completionRate || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{tripSummary?.checkedInCount || 0} checked in</span>
                    <span>{tripSummary?.pendingCount || 0} pending</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/conductor/passengers/${tripId}/${busId}`)}
                className="btn-primary w-full mt-6"
              >
                View Passenger Details →
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const uncheckedPassengers = passengers.filter(p => 
                  !Object.values(p.checkinStatus || {}).some(v => v === true)
                );
                if (uncheckedPassengers.length > 0) {
                  if (window.confirm(`Send reminders to ${uncheckedPassengers.length} unchecked passengers?`)) {
                    uncheckedPassengers.forEach(p => {
                      conductorAPI.sendReminder({ 
                        bookingId: p.bookingId, 
                        userId: p.userId, 
                        mobile: p.mobile 
                      });
                    });
                    toast.success('Reminders sent');
                  }
                } else {
                  toast.info('All passengers are checked in');
                }
              }}
              className="p-3 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100 transition"
            >
              <FiBell className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Send Reminders</span>
            </button>
            
            <button
              onClick={() => {
                const stats = {
                  total: tripSummary?.totalPassengers || 0,
                  checkedIn: tripSummary?.checkedInCount || 0,
                  pending: tripSummary?.pendingCount || 0,
                  completionRate: tripSummary?.completionRate || 0,
                  timestamp: new Date().toISOString()
                };
                const report = JSON.stringify(stats, null, 2);
                const blob = new Blob([report], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `trip_report_${tripId}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Report downloaded');
              }}
              className="p-3 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition"
            >
              <FiMap className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Download Report</span>
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Mark all passengers as checked in?')) {
                  passengers.forEach(passenger => {
                    passenger.seats.forEach(seat => {
                      conductorAPI.updateCheckinStatus({ 
                        bookingId: passenger.bookingId, 
                        seatNumber: seat, 
                        checkedIn: true 
                      });
                    });
                  });
                  setTimeout(() => {
                    fetchTripData();
                    toast.success('All passengers marked as checked in');
                  }, 1000);
                }
              }}
              className="p-3 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition"
            >
              <FiCheckCircle className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Bulk Check-in</span>
            </button>
            
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const location = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };
                    updateBusLocationOnServer(location);
                    toast.success('Location synced');
                  },
                  () => toast.error('Unable to get location')
                );
              }}
              className="p-3 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition"
            >
              <FiNavigation className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Sync Location</span>
            </button>
          </div>
      </div>
    </DashboardShell>
  );
}
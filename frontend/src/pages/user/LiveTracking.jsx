import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { trackingAPI } from '../../services/api';
import { getSocket, joinTripRoom, leaveTripRoom } from '../../services/socket';
import { FiMap, FiNavigation, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

export default function LiveTracking() {
  const { bookingId } = useParams();
  const [busLocation, setBusLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const socketRef = useRef(null);
  
  useEffect(() => {
    fetchTrackingData();
    
    // Initialize socket
    socketRef.current = getSocket();
    socketRef.current.connect();
    
    socketRef.current.on('location-update', handleLocationUpdate);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('location-update');
        leaveTripRoom(booking?.tripId?._id);
      }
    };
  }, [bookingId]);
  
  const fetchTrackingData = async () => {
    try {
      const response = await trackingAPI.getBookingTracking(bookingId);
      setBooking(response.data);
      if (response.data.busLocation) {
        setBusLocation(response.data.busLocation.location);
      }
      if (response.data.eta) {
        setEta(response.data.eta);
      }
      
      // Join socket room for real-time updates
      if (response.data.busLocation?.tripId) {
        joinTripRoom(response.data.busLocation.tripId);
      }
    } catch (error) {
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLocationUpdate = (data) => {
    if (data.location) {
      setBusLocation(data.location);
      if (data.eta) setEta(data.eta);
      
      // Center map on new location
      if (map) {
        map.panTo(data.location);
      }
    }
  };
  
  const calculateETA = () => {
    if (!eta) return 'Calculating...';
    const etaDate = new Date(eta);
    const now = new Date();
    const diffMinutes = Math.round((etaDate - now) / 60000);
    
    if (diffMinutes <= 0) return 'Arriving soon';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    return `${Math.floor(diffMinutes / 60)} hours ${diffMinutes % 60} minutes`;
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
      eyebrow="Live Tracking"
      title="Live Bus Tracking"
      subtitle="Track the bus in real time and keep arrival plans in sync with location updates."
      className="pb-12"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <div className="dashboard-panel overflow-hidden">
            <div className="dashboard-panel-header bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <h2 className="dashboard-panel-title text-white">Trip Status</h2>
              <p className="dashboard-panel-subtitle text-orange-100">Track your bus and boarding point without refreshing the page.</p>
            </div>
            <div className="dashboard-panel-body">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Bus Number</div>
                  <div className="font-semibold text-lg text-slate-900">{booking?.busDetails?.number}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Estimated Arrival</div>
                  <div className="font-semibold text-lg flex items-center text-slate-900">
                    <FiClock className="mr-2" />
                    {calculateETA()}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Bus Status</div>
                  <div className="font-semibold text-lg text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    On Time
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel overflow-hidden">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={busLocation || defaultCenter}
              zoom={13}
              onLoad={setMap}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                fullscreenControl: true
              }}
            >
              {busLocation && (
                <Marker
                  position={busLocation}
                  icon={{
                    url: '/bus-marker.png',
                    scaledSize: new window.google.maps.Size(40, 40)
                  }}
                >
                  <InfoWindow position={busLocation}>
                    <div>
                      <h3 className="font-semibold">Your Bus</h3>
                      <p className="text-sm">{booking?.busDetails?.number}</p>
                    </div>
                  </InfoWindow>
                </Marker>
              )}

              {booking?.boardingPoint?.coordinates && (
                <Marker
                  position={booking.boardingPoint.coordinates}
                  icon={{
                    url: '/pin-marker.png',
                    scaledSize: new window.google.maps.Size(30, 30)
                  }}
                  label="B"
                >
                  <InfoWindow position={booking.boardingPoint.coordinates}>
                    <div>
                      <h3 className="font-semibold">Boarding Point</h3>
                      <p className="text-sm">{booking.boardingPoint.name}</p>
                    </div>
                  </InfoWindow>
                </Marker>
              )}
            </GoogleMap>

            {!busLocation && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="dashboard-panel max-w-sm p-4 text-center">
                  <FiMap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Waiting for bus location...</p>
                  <p className="text-sm text-gray-500">Location will appear when bus starts moving</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h3 className="dashboard-panel-title">Important Information</h3>
            </div>
            <div className="dashboard-panel-body">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                  <span>The bus location updates every 30 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                  <span>Please arrive at the boarding point 15 minutes before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <span>Contact conductor at {booking?.busDetails?.conductorNumber || 'Not available'} for assistance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
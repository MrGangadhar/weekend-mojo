import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tripAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

const blankItineraryDay = (day = 1) => ({
  day,
  title: '',
  places: '',
  activities: '',
  breakfast: '',
  lunch: '',
  dinner: '',
  stayName: '',
  stayType: '',
  stayAddress: '',
});

const splitList = (value = '') => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

const formatList = (items = []) => (items || []).join('\n');

const formatImages = (images = []) => (images || []).map((image) => `${image.url}${image.caption ? ` | ${image.caption}` : ''}`).join('\n');

const parseImages = (value = '') => splitList(value).map((line) => {
  const [urlPart, ...captionParts] = line.split('|');
  const url = urlPart.trim();
  if (!url) return null;
  const caption = captionParts.join('|').trim();
  return { url, caption };
}).filter(Boolean);

const parseDates = (value = '') => splitList(value)
  .map((item) => new Date(item))
  .filter((date) => !Number.isNaN(date.getTime()));

const tripToItineraryDraft = (itinerary = []) => {
  const source = itinerary.length > 0 ? itinerary : [blankItineraryDay(1)];

  return source.map((day, index) => ({
    day: day.day || index + 1,
    title: day.title || '',
    places: formatList(day.places || []),
    activities: formatList(day.activities || []),
    breakfast: day.dining?.breakfast || '',
    lunch: day.dining?.lunch || '',
    dinner: day.dining?.dinner || '',
    stayName: day.stay?.name || '',
    stayType: day.stay?.type || '',
    stayAddress: day.stay?.address || '',
  }));
};

const itineraryDraftToPayload = (draft = []) => draft
  .filter((day) => day.title || day.places || day.activities || day.stayName)
  .map((day, index) => ({
    day: Number(day.day) || index + 1,
    title: day.title.trim(),
    places: splitList(day.places),
    activities: splitList(day.activities),
    dining: {
      breakfast: day.breakfast.trim(),
      lunch: day.lunch.trim(),
      dinner: day.dinner.trim(),
    },
    stay: {
      name: day.stayName.trim(),
      type: day.stayType.trim(),
      address: day.stayAddress.trim(),
    },
  }));

const tripToFormData = (trip) => ({
  title: trip?.title || '',
  shortDescription: trip?.shortDescription || '',
  description: trip?.description || '',
  location: trip?.location || '',
  duration: trip?.duration || '',
  price: trip?.price || '',
  thumbnail: trip?.thumbnail || '',
  status: trip?.status || 'active',
  inclusionsText: formatList(trip?.inclusions || []),
  exclusionsText: formatList(trip?.exclusions || []),
  tagsText: formatList(trip?.tags || []),
  availableDatesText: formatList((trip?.availableDates || []).map((date) => new Date(date).toISOString().slice(0, 10))),
  imagesText: formatImages(trip?.images || []),
});

export default function TripsManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [itineraryDraft, setItineraryDraft] = useState([blankItineraryDay(1)]);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    location: '',
    duration: '',
    price: '',
    thumbnail: '',
    status: 'active',
    inclusionsText: '',
    exclusionsText: '',
    tagsText: '',
    availableDatesText: '',
    imagesText: ''
  });
  
  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      resetForm();
      setShowModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('create');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getTrips({ limit: 100 });
      setTrips(response.data.trips);
    } catch (error) {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      images: parseImages(formData.imagesText),
      itinerary: itineraryDraftToPayload(itineraryDraft),
      inclusions: splitList(formData.inclusionsText),
      exclusions: splitList(formData.exclusionsText),
      tags: splitList(formData.tagsText),
      availableDates: parseDates(formData.availableDatesText),
    };

    try {
      if (editingTrip) {
        await tripAPI.updateTrip(editingTrip._id, payload);
        toast.success('Trip updated successfully');
      } else {
        await tripAPI.createTrip(payload);
        toast.success('Trip created successfully');
      }
      fetchTrips();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripAPI.deleteTrip(id);
        toast.success('Trip deleted successfully');
        fetchTrips();
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const updateItineraryDay = (index, field, value) => {
    setItineraryDraft((current) => current.map((day, dayIndex) => (
      dayIndex === index ? { ...day, [field]: value } : day
    )));
  };

  const addItineraryDay = () => {
    setItineraryDraft((current) => [...current, blankItineraryDay(current.length + 1)]);
  };

  const removeItineraryDay = (index) => {
    setItineraryDraft((current) => {
      const next = current.filter((_, dayIndex) => dayIndex !== index);
      return next.length > 0
        ? next.map((day, dayIndex) => ({ ...day, day: dayIndex + 1 }))
        : [blankItineraryDay(1)];
    });
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      description: '',
      location: '',
      duration: '',
      price: '',
      thumbnail: '',
      status: 'active',
      inclusionsText: '',
      exclusionsText: '',
      tagsText: '',
      availableDatesText: '',
      imagesText: ''
    });
    setItineraryDraft([blankItineraryDay(1)]);
    setEditingTrip(null);
  };

  const tripMetrics = [
    {
      title: 'Total Trips',
      value: trips.length,
      icon: FiPlus,
      color: 'bg-blue-500',
      note: 'Trips currently stored',
    },
    {
      title: 'Active Trips',
      value: trips.filter((trip) => trip.status === 'active').length,
      icon: FiEye,
      color: 'bg-green-500',
      note: 'Visible to customers',
    },
    {
      title: 'Inactive Trips',
      value: trips.filter((trip) => trip.status !== 'active').length,
      icon: FiTrash2,
      color: 'bg-slate-900',
      note: 'Draft or archived entries',
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
      eyebrow="Management Portal"
      title="Trip Management"
      subtitle="Create, edit, and publish trip inventory with a cleaner operational overview."
      actions={
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Trip
        </button>
      }
      metrics={tripMetrics}
    >
      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Trips</h2>
          <p className="dashboard-panel-subtitle">A complete list of trip records with quick editing controls.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={trip.thumbnail || trip.images?.[0]?.url} alt={trip.title} className="w-10 h-10 rounded object-cover mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{trip.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{trip.shortDescription || trip.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{trip.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      trip.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setEditingTrip(trip);
                        setFormData(tripToFormData(trip));
                        setItineraryDraft(tripToItineraryDraft(trip.itinerary));
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Trip */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingTrip ? 'Edit Trip' : 'Add New Trip'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="A concise, premium-style summary that appears on cards and trip detail pages."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 2D/1N"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Thumbnail)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery Images
                </label>
                <textarea
                  value={formData.imagesText}
                  onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="https://image-1.jpg | Sunset view\nhttps://image-2.jpg | Beach deck"
                />
                <p className="mt-1 text-xs text-gray-500">One image per line. Use <span className="font-medium">URL | caption</span> if you want captions.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inclusions
                  </label>
                  <textarea
                    value={formData.inclusionsText}
                    onChange={(e) => setFormData({ ...formData, inclusionsText: e.target.value })}
                    className="input-field"
                    rows="5"
                    placeholder="AC transport\nHotel stay\nBreakfast"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exclusions
                  </label>
                  <textarea
                    value={formData.exclusionsText}
                    onChange={(e) => setFormData({ ...formData, exclusionsText: e.target.value })}
                    className="input-field"
                    rows="5"
                    placeholder="Flights\nPersonal expenses\nMeals not mentioned"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <textarea
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                    className="input-field"
                    rows="5"
                    placeholder="beach\nfamily\nweekend"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Dates
                </label>
                <textarea
                  value={formData.availableDatesText}
                  onChange={(e) => setFormData({ ...formData, availableDatesText: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="2026-06-10\n2026-06-24"
                />
                <p className="mt-1 text-xs text-gray-500">Use one ISO date per line, like 2026-06-10.</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Itinerary Builder</h3>
                    <p className="text-sm text-gray-500">Create a day-by-day plan with places, activities, dining, and stay details.</p>
                  </div>
                  <button type="button" onClick={addItineraryDay} className="btn-secondary text-sm">
                    + Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  {itineraryDraft.map((day, index) => (
                    <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          disabled={itineraryDraft.length === 1}
                          className="text-sm text-red-600 disabled:cursor-not-allowed disabled:text-red-300"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Day Number</label>
                          <input
                            type="number"
                            min="1"
                            value={day.day}
                            onChange={(e) => updateItineraryDay(index, 'day', e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                            className="input-field"
                            placeholder="Arrival, sightseeing, campfire night..."
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Places</label>
                          <input
                            type="text"
                            value={day.places}
                            onChange={(e) => updateItineraryDay(index, 'places', e.target.value)}
                            className="input-field"
                            placeholder="Baga Beach, Fort Aguada"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Activities</label>
                          <input
                            type="text"
                            value={day.activities}
                            onChange={(e) => updateItineraryDay(index, 'activities', e.target.value)}
                            className="input-field"
                            placeholder="Sunset walk, kayaking"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Breakfast</label>
                          <input
                            type="text"
                            value={day.breakfast}
                            onChange={(e) => updateItineraryDay(index, 'breakfast', e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Lunch</label>
                          <input
                            type="text"
                            value={day.lunch}
                            onChange={(e) => updateItineraryDay(index, 'lunch', e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Dinner</label>
                          <input
                            type="text"
                            value={day.dinner}
                            onChange={(e) => updateItineraryDay(index, 'dinner', e.target.value)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Stay Name</label>
                          <input
                            type="text"
                            value={day.stayName}
                            onChange={(e) => updateItineraryDay(index, 'stayName', e.target.value)}
                            className="input-field"
                            placeholder="Sea Breeze Resort"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Stay Type</label>
                          <input
                            type="text"
                            value={day.stayType}
                            onChange={(e) => updateItineraryDay(index, 'stayType', e.target.value)}
                            className="input-field"
                            placeholder="3-star, Boutique, Camp"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Stay Address</label>
                          <input
                            type="text"
                            value={day.stayAddress}
                            onChange={(e) => updateItineraryDay(index, 'stayAddress', e.target.value)}
                            className="input-field"
                            placeholder="Near Calangute Beach, Goa"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingTrip ? 'Update' : 'Create'} Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
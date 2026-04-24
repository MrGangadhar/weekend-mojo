import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount } = location.state || {};
  const [processing, setProcessing] = useState(false);
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  const handlePayment = async () => {
    setProcessing(true);
    
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway');
      setProcessing(false);
      return;
    }
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'Weekend Mojo',
      description: 'Trip Booking Payment',
      order_id: orderId,
      handler: async (response) => {
        try {
          const verifyResponse = await bookingAPI.confirmPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId
          });
          
          if (verifyResponse.data.success) {
            toast.success('Payment successful! Booking confirmed.');
            navigate('/dashboard');
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
      },
      theme: {
        color: '#FF5722',
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
          toast.error('Payment cancelled');
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };
  
  return (
    <PublicPageShell
      eyebrow="Secure Checkout"
      title="Complete your payment"
      subtitle="Razorpay checkout keeps booking confirmation fast, simple, and secure."
      className="pb-12"
    >
      <div className="mx-auto max-w-md">
        <div className="dashboard-panel">
          <div className="dashboard-panel-body space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
              <p className="text-slate-600 mt-2">Complete your payment to confirm booking</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Booking ID:</span>
                <span className="font-medium text-slate-900">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount to Pay:</span>
                <span className="text-2xl font-bold text-orange-500">₹{amount}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn-primary w-full"
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Your payment is secure. We use Razorpay for secure transactions.
            </p>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
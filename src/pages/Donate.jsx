import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Import PNG logos
import mtnLogo from '../assets/images/png/mtn.png';
import vodafoneLogo from '../assets/images/png/voda.png';
import airteltigoLogo from '../assets/images/png/AT.png';

// Mobile money account information
const PAYMENT_METHODS = {
  MTN_MOMO: {
    name: 'MTN Mobile Money',
    number: '0551234567', // Replace with actual number
    instructions: 'Send to this number and use your name as reference',
    logo: mtnLogo
  },
  VODAFONE: {
    name: 'Vodafone Cash',
    number: '0201234567', // Replace with actual number
    instructions: 'Dial *110# to send money to this merchant number',
    logo: vodafoneLogo
  },
  AIRTEL_TIGO: {
    name: 'AirtelTigo Money',
    number: '0261234567', // Replace with actual number
    instructions: 'Send to this number and include your name in the reference',
    logo: airteltigoLogo
  }
};

function Donate() {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showNumber, setShowNumber] = useState(false);
  const [reference, setReference] = useState('');

  // Generate a unique reference number
  const generateReference = () => {
    return `DON-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !name || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Generate a reference number for this donation
      const ref = generateReference();
      setReference(ref);
      
      // Record the donation intent in the database
      const { error } = await supabase
        .from('donations')
        .insert([
          {
            amount: parseInt(amount),
            donor_name: name,
            payment_status: 'pending',
            payment_id: ref,
            payment_method: paymentMethod
          }
        ]);

      if (error) throw error;
      
      // Show the payment number
      setShowNumber(true);
      toast.success('Please complete your payment using the provided details');
    } catch (error) {
      console.error('Error processing donation:', error);
      toast.error('Failed to process donation request');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      
      // Update the donation status to completed
      const { error } = await supabase
        .from('donations')
        .update({ payment_status: 'completed' })
        .eq('payment_id', reference);
        
      if (error) throw error;
      
      toast.success('Thank you for your donation!');
      // Reset the form
      setAmount('');
      setName('');
      setPaymentMethod('');
      setShowNumber(false);
      setReference('');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Support the Memorial</h1>
        <p className="text-gray-300">
          Your contribution helps honor their memory and support their legacy.
        </p>
      </div>

      {!showNumber ? (
        <div className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Donation Amount (GHS)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
                className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Payment Method
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* MTN Mobile Money */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'MTN_MOMO' 
                      ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' 
                      : 'border-funeral-dark hover:border-yellow-500'
                  }`}
                  onClick={() => setPaymentMethod('MTN_MOMO')}
                >
                  <div className="flex flex-col items-center">
                    <img src={PAYMENT_METHODS.MTN_MOMO.logo} alt="MTN MoMo" className="w-16 h-16 mb-2 object-contain" />
                    <span className="text-sm text-gray-300">MTN Mobile Money</span>
                  </div>
                </div>

                {/* Vodafone Cash */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'VODAFONE' 
                      ? 'border-red-500 bg-red-900 bg-opacity-20' 
                      : 'border-funeral-dark hover:border-red-500'
                  }`}
                  onClick={() => setPaymentMethod('VODAFONE')}
                >
                  <div className="flex flex-col items-center">
                    <img src={PAYMENT_METHODS.VODAFONE.logo} alt="Vodafone Cash" className="w-16 h-16 mb-2 object-contain" />
                    <span className="text-sm text-gray-300">Vodafone Cash</span>
                  </div>
                </div>

                {/* AirtelTigo Money */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'AIRTEL_TIGO' 
                      ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                      : 'border-funeral-dark hover:border-blue-500'
                  }`}
                  onClick={() => setPaymentMethod('AIRTEL_TIGO')}
                >
                  <div className="flex flex-col items-center">
                    <img src={PAYMENT_METHODS.AIRTEL_TIGO.logo} alt="AirtelTigo Money" className="w-16 h-16 mb-2 object-contain" />
                    <span className="text-sm text-gray-300">AirtelTigo Money</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className="w-full bg-funeral-accent text-white py-3 px-4 rounded-md hover:bg-funeral-medium focus:outline-none focus:ring-2 focus:ring-funeral-accent focus:ring-offset-2 focus:ring-offset-funeral-darkest disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Complete Your Payment</h2>
            <p className="text-gray-300">
              Please send {amount} GHS to the following account:
            </p>
          </div>

          <div className="bg-funeral-dark p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={PAYMENT_METHODS[paymentMethod]?.logo} 
                alt={PAYMENT_METHODS[paymentMethod]?.name} 
                className="w-16 h-16 mr-4 object-contain" 
              />
              <div>
                <h3 className="text-white font-medium">
                  {PAYMENT_METHODS[paymentMethod]?.name}
                </h3>
                <p className="text-gray-300 text-sm">
                  Reference: {reference}
                </p>
              </div>
            </div>

            <div className="bg-funeral-darkest p-3 rounded border border-funeral-medium mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Account Number:</span>
                <span className="text-white font-mono font-medium tracking-wide">
                  {PAYMENT_METHODS[paymentMethod]?.number}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-300 mb-4">
              <p className="font-medium mb-1">Instructions:</p>
              <p>{PAYMENT_METHODS[paymentMethod]?.instructions}</p>
            </div>

            <div className="text-sm text-yellow-400 mb-4">
              <p>Important: Please use the reference number when making your payment.</p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-funeral-darkest disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'I\'ve Completed the Payment'}
            </button>
            
            <button
              onClick={() => setShowNumber(false)}
              disabled={loading}
              className="w-full bg-transparent border border-funeral-medium text-gray-300 py-3 px-4 rounded-md hover:bg-funeral-dark focus:outline-none focus:ring-2 focus:ring-funeral-medium focus:ring-offset-2 focus:ring-offset-funeral-darkest disabled:opacity-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Your donation helps support the memorial and honor their memory.</p>
        <p className="mt-2">For assistance, please contact us at support@example.com</p>
      </div>
    </div>
  );
}

export default Donate;
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Import PNG logos
import mtnLogo from '../assets/images/png/mtn.png';
import vodafoneLogo from '../assets/images/png/voda.png';
import airteltigoLogo from '../assets/images/png/AT.png';

// Get payment numbers from environment variables (with fallbacks)
const MTN_NUMBER = import.meta.env.VITE_MTN_MOMO_NUMBER || '0551234567';
const VODAFONE_NUMBER = import.meta.env.VITE_VODAFONE_CASH_NUMBER || '0201234567';
const AIRTELTIGO_NUMBER = import.meta.env.VITE_AIRTELTIGO_MONEY_NUMBER || '0261234567';

// Mobile money account information
const PAYMENT_METHODS = {
  MTN_MOMO: {
    name: 'MTN Mobile Money',
    number: MTN_NUMBER,
    instructions: 'Send to this number and use your name as reference',
    logo: mtnLogo,
    bgColor: 'bg-yellow-900',
    borderColor: 'border-yellow-500',
    // MTN MoMo deep link format
    getPaymentLink: (amount, reference) => {
      // Format: tel:*170#
      // User will need to manually enter recipient number and amount
      return 'tel:*170%23';
    }
  },
  VODAFONE: {
    name: 'Vodafone Cash',
    number: VODAFONE_NUMBER,
    instructions: 'Dial *110# to send money to this merchant number',
    logo: vodafoneLogo,
    bgColor: 'bg-red-900',
    borderColor: 'border-red-500',
    // Vodafone Cash deep link format
    getPaymentLink: (amount, reference) => {
      // Format: tel:*110#
      // User will need to manually enter recipient number and amount
      return 'tel:*110%23';
    }
  },
  AIRTEL_TIGO: {
    name: 'AirtelTigo Money',
    number: AIRTELTIGO_NUMBER,
    instructions: 'Send to this number and include your name in the reference',
    logo: airteltigoLogo,
    bgColor: 'bg-blue-900',
    borderColor: 'border-blue-500',
    // AirtelTigo Money deep link format
    getPaymentLink: (amount, reference) => {
      // Format: tel:*500#
      // User will need to manually enter recipient number and amount
      return 'tel:*500%23';
    }
  }
};

function Donate() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [reference] = useState(`T-${Math.floor(1000 + Math.random() * 9000)}`);

  const handlePaymentClick = (paymentMethod) => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    // Get the payment link for the selected method
    const paymentLink = PAYMENT_METHODS[paymentMethod].getPaymentLink(amount, reference);
    
    // Log the payment attempt
    try {
      supabase.from('donations').insert([
        {
          amount: parseInt(amount),
          donor_name: name || 'Anonymous',
          payment_status: 'initiated',
          payment_id: reference,
          payment_method: paymentMethod
        }
      ]);
    } catch (error) {
      console.error('Error logging payment attempt:', error);
    }

    // Open the payment link
    window.location.href = paymentLink;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Support the Memorial</h1>
        <p className="text-gray-300 mb-2">
          Your contribution helps honor their memory and support their legacy.
        </p>
        <p className="text-gray-400 text-sm">
          Your reference code: <span className="font-mono font-bold text-yellow-400">{reference}</span>
        </p>
      </div>

      {/* Donation form */}
      <div className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-funeral-dark text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-funeral-accent"
            placeholder="Enter your name"
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
            placeholder="Enter amount"
            required
          />
        </div>
      </div>

      {/* Payment options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
          <div 
            key={key}
            className={`bg-funeral-darkest ${method.bgColor} bg-opacity-10 border ${method.borderColor} rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all`}
            onClick={() => handlePaymentClick(key)}
          >
            {/* Logo header */}
            <div className="p-4 flex flex-col items-center border-b border-funeral-dark">
              <img src={method.logo} alt={method.name} className="w-20 h-20 object-contain mb-2" />
              <h3 className="text-lg font-semibold text-white">{method.name}</h3>
            </div>
            
            {/* Number display */}
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Send payment to:</p>
              <div className="bg-funeral-dark p-3 rounded border border-funeral-medium mb-3">
                <p className="font-mono font-bold text-2xl text-center text-white">
                  {method.number}
                </p>
              </div>
              <p className="text-sm text-gray-300">{method.instructions}</p>
              <button className="w-full mt-4 bg-funeral-accent hover:bg-funeral-medium text-white py-2 px-4 rounded-md transition-colors">
                Pay with {method.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-funeral-darkest border border-funeral-dark rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">How to Donate</h3>
        <ol className="list-decimal pl-5 text-gray-300 space-y-2">
          <li>Enter your donation amount above</li>
          <li>Click on your preferred mobile money provider</li>
          <li>Your phone will open the payment app or USSD code</li>
          <li>Follow the prompts to complete your payment</li>
          <li>Use the reference code <span className="font-mono font-bold text-yellow-400">{reference}</span> when prompted</li>
        </ol>
      </div>

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>Your donation helps support the memorial and honor their memory.</p>
        <p className="mt-2">For assistance, please contact us at support@example.com</p>
      </div>
    </div>
  );
}

export default Donate;
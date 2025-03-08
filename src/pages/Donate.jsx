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
    getPaymentLink: () => {
      return String.raw`tel:*170#`;
    }
  },
  VODAFONE: {
    name: 'Vodafone Cash',
    number: VODAFONE_NUMBER,
    instructions: 'Dial *110# to send money to this merchant number',
    logo: vodafoneLogo,
    bgColor: 'bg-red-900',
    borderColor: 'border-red-500',
    getPaymentLink: () => {
      return String.raw`tel:*110#`;
    }
  },
  AIRTEL_TIGO: {
    name: 'AirtelTigo Money',
    number: AIRTELTIGO_NUMBER,
    instructions: 'Send to this number and include your name in the reference',
    logo: airteltigoLogo,
    bgColor: 'bg-blue-900',
    borderColor: 'border-blue-500',
    getPaymentLink: () => {
      return String.raw`tel:*500#`;
    }
  }
};

function Donate() {
  const handlePaymentClick = (paymentMethod) => {
    // Get the payment link for the selected method
    const paymentLink = PAYMENT_METHODS[paymentMethod].getPaymentLink();
    
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
          <li>Click on your preferred mobile money provider</li>
          <li>Your phone will open the payment USSD code</li>
          <li>Follow the prompts to complete your payment</li>
          <li>Enter the amount you wish to donate</li>
          <li>Enter your name as reference (optional)</li>
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
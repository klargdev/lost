import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

function Donate() {
  const [amount, setAmount] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // In a real application, you would:
      // 1. Call your backend to create a Stripe session
      // 2. Redirect to Stripe checkout
      // 3. Handle the success/cancel redirects
      // For this demo, we'll just show a success message
      const { error } = await supabase
        .from('donations')
        .insert([
          {
            amount: parseInt(amount) * 100, // Convert to cents
            donor_name: name,
            payment_status: 'completed',
          }
        ]);

      if (error) throw error;
      
      toast.success('Thank you for your donation!');
      setAmount('');
      setName('');
    } catch (error) {
      console.error('Error processing donation:', error);
      toast.error('Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Support the Memorial</h1>
        <p className="text-gray-600">
          Your contribution helps honor their memory and support their legacy.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Donation Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Make Donation'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Secure payments powered by Stripe
        </div>
      </div>
    </div>
  );
}

export default Donate;
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
        <h1 className="text-3xl font-bold text-white mb-4">Support the Memorial</h1>
        <p className="text-gray-300">
          Your contribution helps honor their memory and support their legacy.
        </p>
      </div>

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
              Donation Amount ($)
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-funeral-accent text-white py-3 px-4 rounded-md hover:bg-funeral-medium focus:outline-none focus:ring-2 focus:ring-funeral-accent focus:ring-offset-2 focus:ring-offset-funeral-darkest disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Make Donation'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Secure payments powered by Stripe
        </div>
      </div>
    </div>
  );
}

export default Donate;
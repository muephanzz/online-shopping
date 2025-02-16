import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export default function Checkout() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Retrieve cart items from localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total price
    const totalPrice = storedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Set the total as the default amount
    setAmount(totalPrice);
  }, []);

  const handlePayment = async () => {
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/mpesa', { phoneNumber, amount });
      setMessage(response.data.message);
    } catch (err) {
      console.error('Payment Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Payment failed. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter your M-Pesa phone number"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <Input
          type="number"
          value={amount}
          readOnly // Prevents manual changes
          className="bg-gray-200 cursor-not-allowed"
        />
      </div>

      <Button onClick={handlePayment}>Pay with M-Pesa</Button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}

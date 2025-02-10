import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaPin, setMpesaPin] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedItems);
    calculateTotal(storedItems);
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalPrice);
  };

  const handlePayment = async () => {
    // Replace this with actual M-Pesa API integration
    console.log(`Processing payment for ${phoneNumber} with PIN ${mpesaPin}`);
    alert('Payment successful!');
    localStorage.removeItem('cart');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Total: ${total.toFixed(2)}</h2>
        <input
          type="text"
          placeholder="Enter Phone Number"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter M-Pesa PIN"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          value={mpesaPin}
          onChange={(e) => setMpesaPin(e.target.value)}
        />
        <button
          onClick={handlePayment}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Pay with M-Pesa
        </button>
      </div>
    </div>
  );
}

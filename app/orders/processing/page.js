'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const router = useRouter();

  useEffect(() => {
    if (!phone) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?phone=${phone}`);
        const data = await res.json();

        if (res.ok && data.status === 'paid') {
          setStatus('paid');
          clearInterval(interval);
          router.push('/orders/confirmation'); // Change to your actual order confirmation page
        }
      } catch (err) {
        setError('Failed to check payment.');
        clearInterval(interval);
      }
    }, 3000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          clearInterval(countdown);
          setStatus('timeout');
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [phone, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        {status === 'pending' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Processing Payment...</h2>
            <p className="mb-4">Waiting for M-Pesa confirmation on {phone}</p>
            <div className="loader mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full w-12 h-12 animate-spin" />
            <p className="text-sm text-gray-500">Time left: {timeLeft}s</p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-4">Payment Timeout</h2>
            <p className="mb-4">We didn't receive payment confirmation.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/orders/checkout')}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push(`/orders/processing?phone=${phone}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Retry
              </button>
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}

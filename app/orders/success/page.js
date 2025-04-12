export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-lg mb-2">Thank you for your purchase 🎉</p>
      <p className="text-sm text-gray-500">Your order will be processed shortly.</p>
    </div>
  );
}

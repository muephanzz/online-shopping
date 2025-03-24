export default function OrderSummary({ subtotal, shippingFee }) {
  const totalAmount = subtotal + shippingFee;
  const quantity = '';

  return (
    <div className="p-4 border-t mt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Summary</h2>
      <p>Items: ({quantity})</p>

      <div className="flex justify-between text-gray-700">
        <p>Subtotal:</p>
        <p>Ksh {subtotal}</p>
      </div>

      <div className="flex justify-between text-gray-700">
        <p>Shipping Fee:</p>
        <p>Ksh {shippingFee}</p>
      </div>

      <div className="flex justify-between font-bold text-lg text-gray-900 mt-2">
        <p>Total:</p>
        <p>Ksh {totalAmount}</p>
      </div>
    </div>
  );
}

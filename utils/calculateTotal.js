// utils/calculateTotal.js
export const calculateTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
  
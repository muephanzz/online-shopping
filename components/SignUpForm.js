import { useState } from 'react';
import { signUp } from '../utils/auth';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, user } = await signUp(email, password);
    
    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage('Sign-Up Successful! Please check your email to confirm.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border rounded w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
        Sign Up
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

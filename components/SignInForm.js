import { useState } from 'react';
import { signIn } from '../utils/auth';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, user } = await signIn(email, password);
    
    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage('Sign-In Successful!');
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
      <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
        Sign In
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

import SignInForm from '../components/SignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <SignInForm />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome to Ephantronics</h1>
      <p>Start shopping today!</p>
      <a href="/auth/signin" className="mt-4 text-blue-500">Sign In</a>
    </div>
  );
}

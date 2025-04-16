const AccessDenied = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700">You do not have admin privileges.</p>
      </div>
    );
  };
  
  export default AccessDenied;
  
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome, {user?.name || 'User'}!
      </h1>
      <p className="text-gray-600 mt-2">Role: {user?.role}</p>
    </div>
  );
}

export default Dashboard;
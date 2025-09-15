function App() {
  console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600">
        Env Test: {import.meta.env.VITE_API_BASE_URL}
      </h1>
    </div>
  );
}

export default App;

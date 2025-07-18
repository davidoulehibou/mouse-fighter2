// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import RoomInput from "./RoomInput";
import Room from "./Room";
import { useState } from "react";

function App() {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setError(err);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:param" element={<Room handleError={handleError} />} />
        <Route path="/" element={<RoomInput error={error} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

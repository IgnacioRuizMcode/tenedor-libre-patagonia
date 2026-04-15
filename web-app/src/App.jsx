import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard'; // <-- ¿Está importado este?

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/perfil" element={<UserDashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
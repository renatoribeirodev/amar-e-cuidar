import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import PatientProfile from './pages/PatientProfile';
import CaregiverProfile from './pages/CaregiverProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
        <Route path="/profile/:id" element={<PatientProfile />} />
        <Route path="/caregiver-profile" element={<CaregiverProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import DegreePlan from './pages/DegreePlan';
import Auth from './components/Auth';
import { MajorProvider } from './providers/Major';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <MajorProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/degreeplan" element={<DegreePlan />} />
        </Routes>
      </MajorProvider>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

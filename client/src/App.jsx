import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import DegreePlan from './pages/DegreePlan';
import Login from './components/Login';
import { MajorProvider } from './providers/Major';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MajorProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/degreeplan" element={<DegreePlan />} />
        </Routes>
      </MajorProvider>
    </BrowserRouter>
  );
}

export default App;

import * as React from 'react'
import {DndContext} from '@dnd-kit/core';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomeScreen  from './components/HomeScreen';
import DegreePlan from './components/DegreePlan';

// Import components
import { MajorProvider } from './Major';

// Import Styles
import './App.css'

function App() {
  return (
      <BrowserRouter>
        <MajorProvider>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/degreeplan" element={<DegreePlan />} />
            </Routes>
        </MajorProvider>
      </BrowserRouter>
  );
}

export default App

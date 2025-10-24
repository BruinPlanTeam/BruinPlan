import * as React from 'react'

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomeScreen  from './components/HomeScreen';

// Import components
import { MajorProvider } from './Major';

// Import Styles
import './App.css'

function App() {
  return (
      <MajorProvider>
        <HomeScreen />
      </MajorProvider>
  );
}

export default App

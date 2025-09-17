import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './components/providers/AppProviders';
import { AppRoutes } from './components/AppRoutes';

/**
 * Main App component that sets up routing and providers
 */
function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}

export default App;

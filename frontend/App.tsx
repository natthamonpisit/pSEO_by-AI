import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import Generator from './pages/Generator';
import PublicView from './pages/PublicView';

// J's Note: Since we don't have React Router in this specific environment setup 
// (or to keep it simple without installing deps), I'm using a simple state-based router.
// In Production, use 'next/router' or 'react-router-dom'.

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager />;
      case 'generator':
        return <Generator />;
      case 'public_view':
        return <PublicView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;

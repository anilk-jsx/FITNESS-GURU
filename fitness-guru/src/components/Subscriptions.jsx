import React from 'react';
import DashboardLayout from '../layout/DashboardLayout';

const Subscriptions = () => {
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  return (
    <DashboardLayout userData={userData}>
      <div style={{ 
        color: 'white', 
        textAlign: 'center', 
        padding: '3rem',
        background: 'rgba(15, 15, 35, 0.8)',
        borderRadius: '20px',
        backdropFilter: 'blur(25px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ffffff' }}>
          Subscriptions Page
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
          🚀 This page is coming soon!
        </p>
        <p style={{ color: '#64748b' }}>
          The subscriptions management feature is currently under development and will be available in a future update.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;
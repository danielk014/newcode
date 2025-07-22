import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Script Psych Architect</h1>
      <p>Test App is Loading Successfully!</p>
      <p style={{ marginTop: '1rem', color: '#888' }}>If you see this, the React app is working.</p>
    </div>
  );
};

export default TestApp;
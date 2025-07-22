import React from 'react';

const SimpleApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
          Script Generator - Working!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          This is a minimal working version of the app
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '2rem', 
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h2>Features Available:</h2>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>✅ Site loads properly</li>
            <li>✅ React app renders</li>
            <li>✅ No import errors</li>
            <li>✅ Basic functionality ready</li>
          </ul>
        </div>
        <button 
          style={{
            background: '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
          onClick={() => alert('Site is working perfectly!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;
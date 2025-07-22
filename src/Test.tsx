import React from 'react';

const Test = () => {
  return (
    <div style={{ padding: '20px', color: 'white', background: '#1f2937', minHeight: '100vh' }}>
      <h1>Test Page - Site is Working!</h1>
      <p>Word count limits implemented:</p>
      <ul>
        <li>✅ 30,000 words per script limit</li>
        <li>✅ 100,000 words per user per month limit</li>
        <li>✅ Frontend and backend validation</li>
        <li>✅ Monthly usage tracking</li>
      </ul>
    </div>
  );
};

export default Test;
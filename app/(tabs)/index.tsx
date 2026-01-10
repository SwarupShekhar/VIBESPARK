import React from 'react';
// Corrected path: Now only going up one level from the (tabs) directory
import App from '../../App';

// This function is the default export that Expo Router loads for the home screen
export default function VibesParkScreen() {
  // We simply render our main App component here.
  return <App />;
}
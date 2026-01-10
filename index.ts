import { registerRootComponent } from 'expo';

// We changed this line to import the App component from the correct file name.
// Assuming App-working.tsx is in the same directory as index.ts
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
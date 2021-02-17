/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

// Ignoring this unless there is something we can do about it. It makes the logs very noisy.
LogBox.ignoreLogs([
    'Setting a timer',
]);
AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

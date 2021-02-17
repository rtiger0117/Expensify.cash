/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

LogBox.ignoreLogs([
    'Setting a timer',
    'Require cycle: node_modules/rn-fetch-blob/index.js',
]);
AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

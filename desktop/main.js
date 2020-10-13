import * as Electron from 'electron';
import * as ElectronUpdater from 'electron-updater';
import contextMenu from 'electron-context-menu';
import serve from 'electron-serve';
import log from 'electron-log';

import checkForUpdates from '../src/lib/checkForUpdates';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';

const {
    app,
    BrowserWindow,
    shell,
    ipcMain
} = Electron;
const {autoUpdater} = ElectronUpdater;


/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// TODO: Turn this off, use web-security after alpha launch, currently we receive a CORS issue preventing
// the electron app from making any API requests.
app.commandLine.appendSwitch('disable-web-security');

// Initialize the right click menu
// See https://github.com/sindresorhus/electron-context-menu
contextMenu();

// Send all autoUpdater logs to a log file: ~/Library/Logs/react-native-chat/main.log
// See https://www.npmjs.com/package/electron-log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Send all Console logs to a log file: ~/Library/Logs/react-native-chat/main.log
// See https://www.npmjs.com/package/electron-log
Object.assign(console, log.functions);

const mainWindow = (() => {
    const loadURL = serve({directory: '../dist'});

    return app.whenReady()
        .then(() => {
            const browserWindow = new BrowserWindow({
                backgroundColor: '#FAFAFA',
                width: 1200,
                height: 900,
                webPreferences: {
                    nodeIntegration: true,
                },
            });

            // When the user clicks a link that has target="_blank" (which is all external links)
            // open the default browser instead of a new electron window
            browserWindow.webContents.on('new-window', (e, url) => {
                // make sure local urls stay in electron perimeter
                if (url.substr(0, 'file://'.length) === 'file://') {
                    return;
                }

                // and open every other protocol in the browser
                e.preventDefault();
                return shell.openExternal(url);
            });

            // Flag to determine is user is trying to quit the whole application altogether
            let quitting = false;

            // Closing the chat window should just hide it (vs. fully quitting the application)
            browserWindow.on('close', (evt) => {
                if (!quitting) {
                    evt.preventDefault();
                    browserWindow.minimize();
                }
            });

            app.on('before-quit', () => quitting = true);
            app.on('activate', () => browserWindow.show());

            ipcMain.on(ELECTRON_EVENTS.REQUEST_VISIBILITY, (event) => {
                // This is how synchronous messages work in Electron
                // eslint-disable-next-line no-param-reassign
                event.returnValue = browserWindow.isFocused();
            });

            // Listen to badge updater event emitted by the render process
            // and update the app badge count (MacOS only)
            ipcMain.on(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, (event, totalCount) => {
                app.setBadgeCount(totalCount);
            });

            return browserWindow;
        })

        // After initializing and configuring the browser window, load the compiled JavaScript
        .then(browserWindow => loadURL(browserWindow))

        // Start checking for JS updates
        .then(() => checkForUpdates({
            init: () => autoUpdater.checkForUpdatesAndNotify(),
            update: () => autoUpdater.checkForUpdatesAndNotify(),
        }));
});

mainWindow().then(window => window);
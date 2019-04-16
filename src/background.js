'use strict'

import { app, protocol, BrowserWindow, Menu, Tray, globalShortcut } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('close', (event) => {
    event.preventDefault()
    win.hide()
  })

  win.on('closed', () => {
    win = null
  })
}

function createTray() {
  let contextMenu
  if (process.platform !== 'darwin') {
    contextMenu = Menu.buildFromTemplate([
      { label: 'Show window.', role: 'front' }
    ])
  } else {
    contextMenu = Menu.buildFromTemplate([
      { label: 'About', role: 'about' },
      { type: 'separator' },
      { label: 'Show window.', role: 'front' },
      { type: 'separator' },
      { label: 'Hide window.', role: 'hide' },
      { type: 'separator' },
      { label: 'Quit', role: 'quit' }
    ])
  }

  const tray = new Tray('./assets/logo.png')
  tray.setToolTip('This is my Application.')
  tray.setContextMenu(contextMenu)
}

// Quit when all windows are closed.
app.on('window-all-closed', (event) => {
  event.preventDefault()

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
    createTray()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
  createTray()

  if (process.platform === 'darwin') {
    // Doc icon is hidden.
    app.dock.hide()
    // App go to front by shortcut key.
    globalShortcut.register('Ctrl+Cmd+X', () => {
      console.log('Notify global shortcut for whattime!')
      win.show()
    })
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

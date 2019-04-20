'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  nativeImage,
  shell
} from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
import * as path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null
let tray = null
let forceQuit = false

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // Open link url to external browser
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  win.on('activate-with-no-open-windows', () => {
    win.show()
  })

  win.on('minimize', (event) => {
    event.preventDefault()
    win.hide()
  })

  win.on('close', (event) => {
    // No quit event only
    if (!forceQuit) {
      event.preventDefault()
      win.hide()
    }
  })

  win.on('closed', () => {
    tray = null
    win = null
  })
}

function createTray() {
  let contextMenu
  if (process.platform !== 'darwin') {
    contextMenu = Menu.buildFromTemplate([
      { label: 'Show window', role: 'front' }
    ])
  } else {
    contextMenu = Menu.buildFromTemplate([
      { label: 'About What Time', role: 'about' },
      { type: 'separator' },
      { label: 'Show window', click: () => {
        if (win === null) {
          createWindow()
        } else {
          win.show()
        }
      }},
      { type: 'separator' },
      { label: 'Quit', role: 'quit'}
    ])
  }

  const iconFileName = "trayTemplate.png"
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, "/../src/assets/" + iconFileName)))
  tray.setToolTip('This is my Application.')
  tray.setContextMenu(contextMenu)
}

function createMenu() {
  let contextMenu
  if (process.platform !== 'darwin') {
    contextMenu = Menu.buildFromTemplate([])
  } else {
    contextMenu = Menu.buildFromTemplate([
      { label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'CmdOrCtrl+Q', role: 'quit' },
        ]
      }
    ])
  }

  Menu.setApplicationMenu(contextMenu)
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
  }
  if (tray === null) {
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
  createMenu()
  createTray()

  if (process.platform === 'darwin') {
    // Doc icon is hidden.
    app.dock.hide()

    // App go to front by shortcut key.
    globalShortcut.register('Ctrl+Cmd+L', () => {
      console.log('Notify global shortcut for whattime!')
      win.show()
    })
  }
})

// Event of quitting app (from menu or shortcut key)
app.on('before-quit', () => {
  forceQuit = true
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

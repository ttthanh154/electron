import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as fs from 'fs'

import os from 'os'
import { exec } from 'child_process'
import { stderr, stdout } from 'process'

const isDev = !app.isPackaged

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let fileTxtPath

/**
 * App init
 */
function main() {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: join(__dirname, 'preload.js'),
    },
  })
  window.loadFile(join(__dirname, '../public/index.html'))
  window.on('ready-to-show', window.show)

  if (isDev) window.webContents.openDevTools()
}
app.whenReady().then(main)

/**
 * Handling IPCs
 */
ipcMain.handle('getVideoDirectory', async (event, data) => {
  console.log('event1', event)
  console.log('data1', data)
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Folder',
  })

  if (!result.canceled && result.filePaths.length > 0) {
    fileTxtPath = result.filePaths[0]
    console.log('Selected file path:', fileTxtPath)
    return fileTxtPath
  } else {
    // Handle case where user cancels file selection
    return null
  }
})

ipcMain.handle('writeToFile', async (event, data) => {
  const desktopDir = join(os.homedir(), 'Desktop')
  const fileBatPath = join(desktopDir, 'script.bat')

  try {
    if (fs.existsSync(fileBatPath)) {
      console.log('File already exists. Creating a new file with a different name.');
      // Append timestamp to the new file name
      const timestamp = Date.now();
      const newFilePath = join(desktopDir, `script_${timestamp}.bat`);
      
      fs.writeFileSync(newFilePath, data);
      
      console.log('Data successfully written to new file:', newFilePath);
      return 'New file successfully written.';
    }
    fs.writeFileSync(fileBatPath, data)
    console.log('Data successfully written to file:')
    return 'File successfully written.'
  } catch (error) {
    throw new Error('Failed to write to file.')
  }
})

ipcMain.handle('runScript', async (event, data) => {
  const desktopDir = join(os.homedir(), 'Desktop')
  const changeDirectoryCmd = `cd "${desktopDir}"` // Command to change directory to Desktop
  const runScriptCmd = `cmd /c ${data}` // Command to run script.bat

  exec(
    changeDirectoryCmd,
    { stdio: ['pipe', 'pipe', 'ignore'] },
    (error, stdout, stderr) => {
      console.log('runScriptCmd:::', runScriptCmd)
      if (error) {
        console.error(`Error changing directory: ${error.message}`)
        return
      }

      console.log(`Changed directory to Desktop: ${stdout}`)

      exec(runScriptCmd, (error, stdout, stderr) => {
        if (error) {
          console.log(`Error executing script in cmd: ${error.message}`)
          return
        }

        if (stderr) {
          console.log(`Script execution encountered an error: ${stderr}`)
          return
        }

        console.log(`Script executed successfully: ${stdout}`)
      })
    },
  )
})

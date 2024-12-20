import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegPath.path);

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

  console.log('hello:::', ffmpeg );

  if (isDev) window.webContents.openDevTools()
}
app.whenReady().then(main)

/**
 * Handling IPCs
 */
ipcMain.handle('getVideoDirectory', async (event, data) => {
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

ipcMain.handle('runFfmpeg', async (event, { outputWidth, outputHeight, speedFactor, zoomFactor, preset, inputFiles, outputFile, concatValue, libx264Profile, videoBitrate, maxBitrate, bufsize }) => {
  try {
    const ffmpegCommand = ffmpeg({ preset: preset });

    inputFiles.forEach((file) => {
      ffmpegCommand.input(file);
    });

    let filterChain = '';
    for (let i = 0; i < inputFiles.length; i++) {
      filterChain += `[${i}:v][${i}:a]`;
    }
    filterChain += `concat=n=${concatValue}:v=1:a=1[v][a];`;

    filterChain += `[v]scale=w=iw*${zoomFactor}:h=ih*${zoomFactor},crop=w=${outputWidth}:h=${outputHeight}:x=(iw-${outputWidth})/2:y=(ih-${outputHeight})/2,setpts=PTS/${speedFactor};`;
    filterChain += `[a]atempo=${speedFactor}[aout];[aout]aresample=async=1`;

    ffmpegCommand.complexFilter(filterChain)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-profile:v ' + libx264Profile,
        '-b:v ' + videoBitrate,
        '-maxrate ' + maxBitrate,
        '-bufsize ' + bufsize,
        '-c:a aac',
        '-b:a 192k'
      ])
      .output(outputFile)
      .on('end', function() {
        event.sender.send('ffmpegProcessCompleted', outputFile); // Send message to the renderer process
      })
      .on('error', function(err) {
        event.sender.send('ffmpegProcessError', err.message); // Send error message to the renderer process
      })
      .run();
      return ffmpegPath;
  } catch (error) {
    event.sender.send('ffmpegProcessError', error.message); // Send error message to the renderer process
  }
});
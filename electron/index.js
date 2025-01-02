import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath.path.replace("app.asar", "app.asar.unpacked"));
import si from "systeminformation";

// const isDev = !app.isPackaged;
const isDev = app.isPackaged;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let fileTxtPath;
let gpuInfo = await detectGPU();

/**
 * Enums
 */
const GPU_VENDOR = {
  NVIDIA: "NVIDIA",
  AMD: "AMD",
};

const VIDEO_CODEC = {
  [GPU_VENDOR.NVIDIA]: "h264_nvenc",
  [GPU_VENDOR.AMD]: "h264_amf",
  libx264: "libx264",
};

/**
 * Response
 */
class Response {
  constructor(status, data = null) {
    this.status = status;
    this.data = data;
  }
}

class SuccessResponse extends Response {
  constructor(data) {
      super(true, data); // Assuming 200 is the status code for success
  }
}

class FailedResponse extends Response {
  constructor(errorMessage) {
      super(false, { error: errorMessage }); // Include an error message in the data
  }
}

/**
 *
 * Helpers
 */

async function detectGPU() {
  const GPU_VENDOR = {
    NVIDIA: "NVIDIA",
    AMD: "AMD",
  };

  try {
    const gpuInfo = await si.graphics();

    let index = 0;
    for (let i = 0; i < gpuInfo.controllers.length; i++) {
      if (
        gpuInfo.controllers[i].model.includes(GPU_VENDOR.NVIDIA) ||
        gpuInfo.controllers[i].model.includes(GPU_VENDOR.AMD)
      ) {
        index = i;
      }
    }
    const gpuTier = gpuInfo.controllers[index].model;
    return gpuTier;
  } catch (error) {
    console.error("Error detecting GPU:", error);
    return null;
  }
}

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
      preload: join(__dirname, "preload.js"),
    },
  });
  window.loadFile(join(__dirname, "../public/index.html"));
  window.on("ready-to-show", window.show);

  if (isDev) window.webContents.openDevTools();
}
app.whenReady().then(main);

/**
 * Handling IPCs
 * Must be at the bottom of the file.
 */
ipcMain.handle("getVideoDirectory", async (event, data) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: "Select Folder",
  });

  if (!result.canceled && result.filePaths.length > 0) {
    fileTxtPath = result.filePaths[0];
    return fileTxtPath;
  } else {
    // Handle case where user cancels file selection
    return null;
  }
});

ipcMain.handle("getPackageAsDirectory", async (event, data) => {
  const result = await dialog.showOpenDialog({
    properties: ['promptToCreate'],
    title: "Select Folder",
  });

  if (!result.canceled && result.filePaths.length > 0) {
    fileTxtPath = result.filePaths[0];
    return fileTxtPath;
  } else {
    // Handle case where user cancels file selection
    return null;
  }
});

ipcMain.handle(
  "render",
  async (
    event,
    {
      outputWidth,
      outputHeight,
      speedFactor,
      zoomFactor,
      preset,
      inputFiles,
      outputFile,
      concatValue,
      profile,
      videoBitrate,
      maxBitrate,
      bufsize,
    }
  ) => {
    try {
      const ffmpegCommand = ffmpeg({ preset: preset });

      inputFiles.forEach((file) => {
        ffmpegCommand.input(file);
      });

      let filterChain = "";
      for (let i = 0; i < inputFiles.length; i++) {
        filterChain += `[${i}:v][${i}:a]`;
      }
      filterChain += `concat=n=${concatValue}:v=1:a=1[v][a];`;
      filterChain += `[v]scale=w=iw*${zoomFactor}:h=ih*${zoomFactor},crop=w=${outputWidth}:h=${outputHeight}:x=(iw-${outputWidth})/2:y=(ih-${outputHeight})/2,setpts=PTS/${speedFactor};`;
      filterChain += `[a]atempo=${speedFactor}[aout];[aout]aresample=async=1`;

      let videoCodec;
      switch (true) {
        case gpuInfo.includes(GPU_VENDOR.NVIDIA):
          videoCodec = VIDEO_CODEC[GPU_VENDOR.NVIDIA];
          break;
        case gpuInfo.includes(GPU_VENDOR.AMD):
          videoCodec = VIDEO_CODEC[GPU_VENDOR.AMD];
          break;
        default:
          videoCodec = VIDEO_CODEC.libx264;
      }

      // Return a Promise to manage FFmpeg execution
      return new Promise((resolve, reject) => {
        ffmpegCommand
          .complexFilter(filterChain)
          .videoCodec(videoCodec)
          .audioCodec("aac")
          .outputOptions([
            "-profile:v " + profile,
            "-b:v " + videoBitrate,
            "-maxrate " + maxBitrate,
            "-bufsize " + bufsize,
            "-c:a aac",
            "-b:a 192k",
          ])
          .output(outputFile)
          .on("end", function () {
            resolve(new SuccessResponse('Render successfully')); // Resolve the promise
          })
          .on("error", function (err) {
            reject(new FailedResponse(err.message)); // Reject the promise
          })
          .run();
      });
    } catch (error) {
      return new FailedResponse(error.message); // Return failed response if an error occurs
    }
  }
);

const { ipcRenderer, contextBridge } = require("electron");

const WINDOW_API = {
  getVideoDirectory: () => ipcRenderer.invoke("getVideoDirectory"),
  runFfmpeg: (data) => ipcRenderer.invoke('runFfmpeg', data),
};

// window.api
contextBridge.exposeInMainWorld("api", WINDOW_API);

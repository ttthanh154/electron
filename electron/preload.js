const { ipcRenderer, contextBridge } = require("electron");

const WINDOW_API = {
  getVideoDirectory: () => ipcRenderer.invoke("getVideoDirectory"),
  writeToFile: (data) => ipcRenderer.invoke('writeToFile', data),
  runScript: (data) => ipcRenderer.invoke('runScript', data),
};

// window.api
contextBridge.exposeInMainWorld("api", WINDOW_API);

const { ipcRenderer, contextBridge } = require("electron");

const WINDOW_API = {
  getVideoDirectory: () => ipcRenderer.invoke("getVideoDirectory"),
  getPackageAsDirectory: () => ipcRenderer.invoke("getPackageAsDirectory"),
  render: (data) => ipcRenderer.invoke('render', data),
};

// window.api
contextBridge.exposeInMainWorld("api", WINDOW_API);

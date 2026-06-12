// preload/devApi.js
function createDevApi(ipcRenderer) {
    return {
      openDevTools: () => ipcRenderer.invoke("open-devtools"),
    };
  }
  
  module.exports = {
    createDevApi,
  };
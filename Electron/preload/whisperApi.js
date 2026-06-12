// preload/whisperApi.js
function createWhisperApi(ipcRenderer) {
    return {
      transcribe: async (audioArrayBuffer) => {
        return await ipcRenderer.invoke(
          "whisper:transcribe",
          audioArrayBuffer
        );
      },
    };
  }
  
  module.exports = {
    createWhisperApi,
  };
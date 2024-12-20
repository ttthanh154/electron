// command.service.svelte

//txtScript: string
export const getVideoDirectory = async () => {
  return await api.getVideoDirectory();
};

//txtScript: string
export const runFfmpeg = async ({outputWidth, outputHeight, speedFactor, zoomFactor, preset, inputFiles, outputFile, concatValue, libx264Profile, videoBitrate, maxBitrate, bufsize }) => {
  return await api.runFfmpeg({ outputWidth, outputHeight, speedFactor, zoomFactor, preset, inputFiles, outputFile, concatValue, libx264Profile, videoBitrate, maxBitrate, bufsize });
};

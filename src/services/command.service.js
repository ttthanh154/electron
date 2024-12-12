// command.service.svelte

//txtScript: string
export const getVideoDirectory = async () => {
  return await api.getVideoDirectory();
};

//txtScript: string
export const writeToFile = async (txtScript) => {
  return await api.writeToFile(txtScript);
};

//txtScript: string
export const runScript = async (txtScript) => {
  return await api.runScript(txtScript);
};

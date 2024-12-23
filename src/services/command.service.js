// command.service.svelte

//txtScript: string
export const getVideoDirectory = async () => {
  return await api.getVideoDirectory();
};

//txtScript: string
export const render = async (data) => {
  return await api.render(data);
};

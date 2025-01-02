// command.service.svelte

export const getVideoDirectory = async () => {
  return await api.getVideoDirectory();
};

export const getPackageAsDirectory = async () => {
  return await api.getPackageAsDirectory();
};

export const render = async (data) => {
  return await api.render(data);
};

export const isDevEnvironment = () => {
  return localStorage.getItem('dev') === 'true' && location.hostname === 'localhost';
};

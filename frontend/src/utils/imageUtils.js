export const getImageUrl = (url) => {
  if (!url) return '';
  const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', apiUrl);
  }
  if (url.startsWith('/uploads')) {
    return `${apiUrl}${url}`;
  }
  return url;
};

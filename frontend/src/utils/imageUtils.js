export const getImageUrl = (url) => {
  if (!url || url === 'null' || url === 'undefined') return '';
  let apiUrl = 'http://localhost:5000';
  if (import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  } else if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
    apiUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  
  if (url.startsWith('data:')) return url;

  // Handle uploaded files that might contain an outdated host origin
  if (url.includes('/uploads/')) {
    const uploadPath = url.substring(url.indexOf('/uploads/'));
    return `${apiUrl}${uploadPath}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let path = url;
  if (!path.startsWith('/') && !path.startsWith('uploads/')) {
    path = `/uploads/${path}`;
  } else if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  return `${apiUrl}${path}`;
};

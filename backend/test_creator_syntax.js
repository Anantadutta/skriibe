try {
  require('./routes/creator.js');
  console.log('Successfully loaded creator.js');
} catch (e) {
  console.error('Error loading creator.js:', e);
}

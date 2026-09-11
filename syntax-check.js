try {
  require('./backend/routes/admin.js');
  console.log("No syntax errors found!");
} catch (e) {
  console.error("SYNTAX ERROR FOUND:", e);
}

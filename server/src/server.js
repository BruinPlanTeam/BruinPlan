const app = require('./app.js');
const PORT = 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
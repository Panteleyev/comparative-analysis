/**
 * Серверная часть
 */
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 7000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

app.get('/api/data', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'data.json'));
  console.log('send data: [OK]');
});

app.listen(port, () => console.log(`Listening on port ${ port }`));
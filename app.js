const express = require('express');
const authorsRoutes = require('./routes/authors');
const postsRoutes = require('./routes/posts');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/authors', authorsRoutes);
app.use('/posts', postsRoutes);

module.exports = app;

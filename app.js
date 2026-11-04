const express = require('express');
const authorsRoutes = require('./routes/authors');
const postsRoutes = require('./routes/posts');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

const app = express();
const openApiDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, 'docs', 'openapi.yaml'), 'utf8')
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/authors', authorsRoutes);
app.use('/posts', postsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

module.exports = app;

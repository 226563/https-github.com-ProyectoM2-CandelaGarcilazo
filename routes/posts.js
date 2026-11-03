const express = require('express');
const pool = require('../db/connection');
const router = express.Router();




router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar publicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
   if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/author/:authorId', async (req, res) => {
  const authorId = Number(req.params.authorId);

  if (!Number.isInteger(authorId) || authorId <= 0) {
    return res.status(400).json({ error: 'El id del autor debe ser un entero positivo' });
  }

  try {
    const result = await pool.query(
      `SELECT
         posts.id,
         posts.title,
         posts.content,
         posts.author_id,
         posts.published,
         posts.created_at,
         authors.name AS author_name,
         authors.email AS author_email,
         authors.bio AS author_bio
       FROM posts
       JOIN authors ON authors.id = posts.author_id
       WHERE posts.author_id = $1
       ORDER BY posts.id`,
      [authorId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar publicaciones del autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { title, content, author_id, published } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'El contenido es obligatorio' });
  }
  if (!Number.isInteger(author_id) || author_id <= 0) {
    return res.status(400).json({ error: 'author_id debe ser un entero positivo' });
  }
  if (published !== undefined && typeof published !== 'boolean') {
    return res.status(400).json({ error: 'published debe ser verdadero o falso' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO posts (title, content, author_id, published)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), content.trim(), author_id, published === undefined ? false : published]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El autor indicado no existe' });
    }

    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, content, author_id, published } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'El contenido es obligatorio' });
  }
  if (!Number.isInteger(author_id) || author_id <= 0) {
    return res.status(400).json({ error: 'author_id debe ser un entero positivo' });
  }
  if (published !== undefined && typeof published !== 'boolean') {
    return res.status(400).json({ error: 'published debe ser verdadero o falso' });
  }

  try {
    const result = await pool.query(
      `UPDATE posts
       SET title = $1, content = $2, author_id = $3, published = $4
       WHERE id = $5
       RETURNING *`,
      [title.trim(), content.trim(), author_id, published === undefined ? false : published, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El autor indicado no existe' });
    }

    console.error('Error al actualizar publicación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

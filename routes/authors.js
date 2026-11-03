const express = require('express');
const pool = require('../db/connection');
const router = express.Router();



router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar autores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, bio } = req.body || {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return res.status(400).json({ error: 'La biografía debe ser texto' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO authors (name, email, bio)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, bio, created_at`,
      [name.trim(), email.trim(), typeof bio === 'string' && bio.trim() ? bio.trim() : null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }

    console.error('Error al crear autor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, bio } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }
  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return res.status(400).json({ error: 'La biografía debe ser texto' });
  }

  try {
    const result = await pool.query(
      `UPDATE authors
       SET name = $1, email = $2, bio = $3
       WHERE id = $4
       RETURNING id, name, email, bio, created_at`,
      [name.trim(), email.trim(), typeof bio === 'string' && bio.trim() ? bio.trim() : null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }

    console.error('Error al actualizar autor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, bio, created_at FROM authors WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al buscar autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM authors WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar autor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
jest.mock('../db/connection', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../db/connection');

beforeEach(() => {
  pool.query.mockReset();
});

test('GET /authors devuelve la lista de autores', async () => {
  const authors = [
    { id: 1, name: 'Candela', email: 'cande@example.com' },
  ];

  pool.query.mockResolvedValue({ rows: authors });

  const response = await request(app).get('/authors');

  expect(response.status).toBe(200);
  expect(response.body).toEqual(authors);
});

test('GET /authors/:id rechaza un id inválido', async () => {
  const response = await request(app).get('/authors/abc');

  expect(response.status).toBe(400);
  expect(pool.query).not.toHaveBeenCalled();
});

test('GET /authors/:id devuelve 404 si no existe', async () => {
  pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

  const response = await request(app).get('/authors/999');

  expect(response.status).toBe(404);
});

test('POST /authors crea un nuevo autor', async () => {
  const authorInput = {
    name: 'Nuevo Autor',
    email: 'nuevo@example.com',
  };

  const createdAuthor = {
    id: 1,
    ...authorInput,
    bio: null,
    created_at: '2026-11-02T12:00:00.000Z',
  };

  pool.query.mockResolvedValue({ rows: [createdAuthor] });

  const response = await request(app)
    .post('/authors')
    .send(authorInput);

  expect(response.status).toBe(201);
  expect(response.body).toEqual(createdAuthor);
});

test('POST /authors rechaza un nombre vacío', async () => {
  const response = await request(app)
    .post('/authors')
    .send({ name: '   ', email: 'nuevo@example.com' });

  expect(response.status).toBe(400);
  expect(pool.query).not.toHaveBeenCalled();
});

test('POST /authors rechaza un email duplicado', async () => {
  pool.query.mockRejectedValue({ code: '23505' });

  const response = await request(app)
    .post('/authors')
    .send({ name: 'Candela', email: 'cande@example.com' });

  expect(response.status).toBe(400);
});

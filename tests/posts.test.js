jest.mock('../db/connection', () => ({
  query: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../db/connection');

beforeEach(() => {
  pool.query.mockReset();
});

test('GET /posts devuelve la lista de publicaciones', async () => {
  const posts = [
    {
      id: 1,
      title: 'Aprendiendo DB',
      content: 'Introducción a bases de datos',
      author_id: 1,
      published: true,
    },
  ];

  pool.query.mockResolvedValue({ rows: posts });

  const response = await request(app).get('/posts');

  expect(response.status).toBe(200);
  expect(response.body).toEqual(posts);
});

test('GET /posts/:id rechaza un id inválido', async () => {
  const response = await request(app).get('/posts/abc');

  expect(response.status).toBe(400);
  expect(pool.query).not.toHaveBeenCalled();
});

test('GET /posts/:id devuelve 404 si no existe', async () => {

  pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

  const response = await request(app).get('/posts/1');

  expect(response.status).toBe(404);
});

test('GET /posts/author/:authorId devuelve posts con datos del autor', async () => {
  const posts = [
    {
      id: 1,
      title: 'Aprendiendo DB',
      content: 'Introducción a bases de datos',
      author_id: 1,
      published: true,
      author_name: 'Candela',
      author_email: 'cande@example.com',
      author_bio: 'Estudiante',
    },
  ];
  pool.query.mockResolvedValue({ rows: posts });

  const response = await request(app).get('/posts/author/1');

  expect(response.status).toBe(200);
  expect(response.body).toEqual(posts);
  expect(pool.query.mock.calls[0][1]).toEqual([1]);
});


test('POST /posts crea un post y usa false como valor por defecto', async () => {
  const postInput = {
    title: 'Post de prueba',
    content: 'Contenido de prueba',
    author_id: 1,
  };
  const createdPost = {
    id: 2,
    ...postInput,
    published: false,
  };
  pool.query.mockResolvedValue({ rows: [createdPost] });

  const response = await request(app).post('/posts').send(postInput);

  expect(response.status).toBe(201);
  expect(response.body).toEqual(createdPost);
  expect(pool.query.mock.calls[0][1]).toEqual([
    postInput.title,
    postInput.content,
    postInput.author_id,
    false,
  ]);
});

test('POST /posts rechaza un author_id que no es número', async () => {
  const response = await request(app)
    .post('/posts')
    .send({
      title: 'Post de prueba',
      content: 'Contenido de prueba',
      author_id: '1',
    });

  expect(response.status).toBe(400);
  expect(pool.query).not.toHaveBeenCalled();
});

   test('POST /posts responde con 400 si author_id no existe', async () => {
    const errorFK = new Error('violates foreign key constraint');
    errorFK.code = '23503';
    pool.query.mockRejectedValueOnce(errorFK);

    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Post de prueba',
        content: 'Contenido de prueba',
        author_id: 99,
      });

    expect(response.status).toBe(400);
});

test('PUT /posts/:id actualiza un post existente', async () => {
  const postId = 1;
  const updateData = {
    title: 'Post actualizado',
    content: 'Contenido actualizado',
    author_id: 1,
    published: true,
  };
  const updatedPost = { id: postId, ...updateData };
  pool.query.mockResolvedValue({ rowCount: 1, rows: [updatedPost] });

  const response = await request(app)
    .put(`/posts/${postId}`)
    .send(updateData);

  expect(response.status).toBe(200);
  expect(response.body).toEqual(updatedPost);
});

test('PUT /posts/:id responde con 404 si el post no existe', async () => {
  const postId = 999;
  const updateData = {
    title: 'Post actualizado',
    content: 'Contenido actualizado',
    author_id: 1,
    published: true,
  };
  pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

  const response = await request(app)
    .put(`/posts/${postId}`)
    .send(updateData);

  expect(response.status).toBe(404);
});

test('DELETE /posts/:id elimina un post existente', async () => {
  pool.query.mockResolvedValue({ rowCount: 1, rows: [{ id: 1 }] });

  const response = await request(app).delete('/posts/1');

  expect(response.status).toBe(204);
  expect(response.text).toBe('');
});

test('DELETE /posts/:id responde con 404 si el post no existe', async () => {
  pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

  const response = await request(app).delete('/posts/999');

  expect(response.status).toBe(404);
});

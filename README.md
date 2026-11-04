# MiniBlog API

> **Estado del proyecto:** 
API implementada y probada localmente; despliegue pendiente”. El resto de los datos de autoría ya está completo.

## Descripción

MiniBlog API es una API REST desarrollada con Node.js y Express para gestionar autores y publicaciones. Los datos se almacenan en PostgreSQL y las consultas se realizan con el paquete `pg`.

Este proyecto fue realizado como práctica de conexión entre Express y PostgreSQL, operaciones CRUD, validación de datos y pruebas automatizadas.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- `pg`
- Jest
- Supertest
- dotenv


## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto usando `.env.example` como referencia. Completar allí las credenciales locales de PostgreSQL:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=miniblog
PGUSER=postgres
PGPASSWORD=tu_contraseña_local
```


## Base de datos

1. Crear una base de datos llamada `miniblog` en PostgreSQL.
2. Ejecutar `db/setup.sql` sobre esa base para crear las tablas `authors` y `posts`.
3. Ejecutar `seed.sql` para cargar los datos de ejemplo.

La tabla `posts` tiene una clave foránea hacia `authors`. Al eliminar un autor, sus publicaciones se eliminan en cascada.


## Ejecución local

Iniciar la API en modo desarrollo:

```bash
npm run dev
```

Iniciar la API en modo normal:

```bash
npm start
```

Por defecto, el servidor escucha en `http://localhost:3000`. El puerto se puede configurar con la variable de entorno `PORT`.

Comprobar el estado del servidor:

```text
GET http://localhost:3000/health
```

## Endpoints

Los endpoints reciben y devuelven JSON, excepto las operaciones DELETE exitosas, que responden con `204` y sin cuerpo.

### Authors

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/authors` | Listar autores |
| GET | `/authors/:id` | Obtener un autor |
| POST | `/authors` | Crear un autor |
| PUT | `/authors/:id` | Actualizar un autor |
| DELETE | `/authors/:id` | Eliminar un autor |

Para crear o actualizar un autor, se requiere `name` y `email`. `bio` es opcional.

### Posts

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/posts` | Listar publicaciones |
| GET | `/posts/:id` | Obtener una publicación |
| GET | `/posts/author/:authorId` | Listar publicaciones de un autor con datos del autor |
| POST | `/posts` | Crear una publicación |
| PUT | `/posts/:id` | Actualizar una publicación |
| DELETE | `/posts/:id` | Eliminar una publicación |

Para crear o actualizar una publicación, se requieren `title`, `content` y `author_id`. `published` es opcional y por defecto es `false`. El autor indicado debe existir.

## Ejemplos de solicitudes

### Crear un autor

```http
POST /authors
Content-Type: application/json
```

```json
{
  "name": "Nombre del autor",
  "email": "autor@example.com",
  "bio": "Biografía opcional"
}
```

### Crear una publicación

```http
POST /posts
Content-Type: application/json
```

```json
{
  "title": "Título de la publicación",
  "content": "Contenido de ejemplo",
  "author_id": 1,
  "published": false
}
```

## Códigos HTTP

- `200`: operación exitosa.
- `201`: recurso creado.
- `204`: recurso eliminado, sin cuerpo de respuesta.
- `400`: datos inválidos o referencia no válida.
- `404`: recurso no encontrado.
- `500`: error interno del servidor.

## Documentación OpenAPI

La especificación OpenAPI está en [`docs/openapi.yaml`](docs/openapi.yaml). Se puede abrir con Swagger Editor u otro visor compatible con OpenAPI 3.

## Pruebas

Ejecutar las pruebas automatizadas:

```bash
npm test
```

Las pruebas usan Jest y Supertest. La conexión con PostgreSQL se simula, por lo que la suite no modifica los datos de la base local.

## Uso de inteligencia artificial

Utilicé ChatGPT como herramienta de apoyo durante el desarrollo para comprender conceptos, recibir orientación sobre endpoints CRUD, preparar pruebas con Jest y Supertest, documentar la API con OpenAPI/Swagger y resolver dudas sobre la configuración y el despliegue en Render.

Revisé e integré las sugerencias en el proyecto y comprobé el funcionamiento mediante las pruebas automatizadas y consultas a la API desplegada.

## Despliegue

- Plataforma: Render.
- Estado: desplegada.
- URL de producción: https://miniblog-zhn4.onrender.com

La API usa PostgreSQL. Las variables de conexión se configuran en Render y no deben publicarse en el repositorio.

## Autoría

- Nombre: Candela Garcilazo
- Proyecto integrador M2
- Fecha: 11/2026

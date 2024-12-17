const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

// Inicializar la app de Express
const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());

// Middleware para parsear cuerpos JSON
app.use(bodyParser.json());

// Crear la base de datos SQLite en memoria
const db = new sqlite3.Database('./usuarios.db', (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos", err);
  } else {
    console.log("Base de datos SQLite conectada");
  }
});

// Crear la tabla de usuarios si no existe
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS usuarios (cedula TEXT PRIMARY KEY, nombre TEXT NOT NULL)");
});

// Endpoint para crear un usuario
app.post('/usuarios', (req, res) => {
  const { cedula, nombre } = req.body;

  const query = "INSERT INTO usuarios (cedula, nombre) VALUES (?, ?)";
  db.run(query, [cedula, nombre], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al crear el usuario' });
    }
    res.status(201).json({ message: 'Usuario creado', cedula, nombre });
  });
});

// Endpoint para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  const query = "SELECT * FROM usuarios";
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
    res.status(200).json(rows);
  });
});

// Endpoint para obtener un usuario por cédula
app.get('/usuarios/:cedula', (req, res) => {
  const { cedula } = req.params;
  const query = "SELECT * FROM usuarios WHERE cedula = ?";
  db.get(query, [cedula], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(row);
  });
});

// Endpoint para actualizar un usuario
app.put('/usuarios/:cedula', (req, res) => {
  const { cedula } = req.params;
  const { nombre } = req.body;

  const query = "UPDATE usuarios SET nombre = ? WHERE cedula = ?";
  db.run(query, [nombre, cedula], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario actualizado', cedula, nombre });
  });
});

// Endpoint para eliminar un usuario
app.delete('/usuarios/:cedula', (req, res) => {
  const { cedula } = req.params;

  const query = "DELETE FROM usuarios WHERE cedula = ?";
  db.run(query, [cedula], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado' });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

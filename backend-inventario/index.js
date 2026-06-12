const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'inventario.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS bienes (
        codigoEsbye TEXT PRIMARY KEY,
        nombreBien TEXT,
        marca TEXT,
        modelo TEXT,
        serie TEXT,
        custodio TEXT,
        ubicacion TEXT,
        estado TEXT
      )
    `);
  }
});

// Helper function to run DB queries with Promises
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// API Endpoints

app.get('/api/status', (req, res) => {
  res.json({ mensaje: "Servidor del sistema de bienes funcionando correctamente con SQLite." });
});

// GET all bienes
app.get('/api/bienes', async (req, res) => {
  try {
    const bienes = await dbAll('SELECT * FROM bienes');
    res.json(bienes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload excel file
app.post('/api/upload', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const filas = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (filas.length < 2) {
      return res.status(400).json({ error: 'El archivo Excel está vacío o no tiene encabezados' });
    }

    const cabeceras = filas[0].map(c => String(c).toLowerCase().trim());
    const buscarIndice = (palabras) => cabeceras.findIndex(cabecera => 
      palabras.some(pc => cabecera.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(pc))
    );

    const idxEsbye = buscarIndice(['esbye', 'codigo', 'cod', 'identificador']);
    const idxNombre = buscarIndice(['nombre', 'descripcion', 'bien', 'articulo', 'equipo']);
    const idxMarca = buscarIndice(['marca', 'brand']);
    const idxModelo = buscarIndice(['modelo', 'model']);
    const idxSerie = buscarIndice(['serie', 'serial', 'sn']);
    const idxCustodio = buscarIndice(['custodio', 'responsable', 'usuario', 'empleado']);
    const idxUbicacion = buscarIndice(['ubicacion', 'estacion', 'oficina', 'lugar']);
    const idxEstado = buscarIndice(['estado', 'status', 'condicion']);

    if (idxNombre === -1) {
      return res.status(400).json({ error: 'No pudimos identificar la columna "Nombre del Bien".' });
    }

    let insertados = 0;

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      if (!fila || fila.length === 0) continue;

      const codigoEsbye = idxEsbye !== -1 && fila[idxEsbye] ? String(fila[idxEsbye]).trim() : `ESBYE-${Date.now()}-${i}`;
      const nombreBien = idxNombre !== -1 && fila[idxNombre] ? String(fila[idxNombre]).trim() : '';
      
      if (!nombreBien) continue;

      const marca = idxMarca !== -1 && fila[idxMarca] ? String(fila[idxMarca]).trim() : 'Genérico';
      const modelo = idxModelo !== -1 && fila[idxModelo] ? String(fila[idxModelo]).trim() : 'S/M';
      const serie = idxSerie !== -1 && fila[idxSerie] ? String(fila[idxSerie]).trim() : 'S/N';
      const custodio = idxCustodio !== -1 && fila[idxCustodio] ? String(fila[idxCustodio]).trim() : 'Sin Asignar';
      const ubicacion = idxUbicacion !== -1 && fila[idxUbicacion] ? String(fila[idxUbicacion]).trim() : 'Bodega Central';
      
      let estadoRaw = idxEstado !== -1 && fila[idxEstado] ? String(fila[idxEstado]).toLowerCase().trim() : 'bueno';
      let estado = 'bueno';
      if (estadoRaw.includes('malo') || estadoRaw.includes('dañado') || estadoRaw.includes('baja') || estadoRaw.includes('mal')) estado = 'malo';
      else if (estadoRaw.includes('reg') || estadoRaw.includes('regular') || estadoRaw.includes('mantenimiento') || estadoRaw.includes('daño')) estado = 'regular';

      try {
        await dbRun(
          `INSERT INTO bienes (codigoEsbye, nombreBien, marca, modelo, serie, custodio, ubicacion, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(codigoEsbye) DO UPDATE SET
           nombreBien=excluded.nombreBien, marca=excluded.marca, modelo=excluded.modelo,
           serie=excluded.serie, custodio=excluded.custodio, ubicacion=excluded.ubicacion, estado=excluded.estado`,
          [codigoEsbye, nombreBien, marca, modelo, serie, custodio, ubicacion, estado]
        );
        insertados++;
      } catch (err) {
        console.error('Error insertando fila', i, err);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ mensaje: 'Archivo procesado con éxito', registros: insertados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando el archivo' });
  }
});

// POST new bien
app.post('/api/bienes', async (req, res) => {
  const { codigoEsbye, nombreBien, marca, modelo, serie, custodio, ubicacion, estado } = req.body;
  try {
    await dbRun(
      `INSERT INTO bienes (codigoEsbye, nombreBien, marca, modelo, serie, custodio, ubicacion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigoEsbye, nombreBien, marca, modelo, serie, custodio, ubicacion, estado]
    );
    res.json({ mensaje: 'Bien creado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update bien
app.put('/api/bienes/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { nombreBien, marca, modelo, serie, custodio, ubicacion, estado } = req.body;
  try {
    await dbRun(
      `UPDATE bienes SET nombreBien=?, marca=?, modelo=?, serie=?, custodio=?, ubicacion=?, estado=? WHERE codigoEsbye=?`,
      [nombreBien, marca, modelo, serie, custodio, ubicacion, estado, codigo]
    );
    res.json({ mensaje: 'Bien actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE bien
app.delete('/api/bienes/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    await dbRun(`DELETE FROM bienes WHERE codigoEsbye=?`, [codigo]);
    res.json({ mensaje: 'Bien eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;
  res.json({ mensaje: "Endpoint de login listo" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
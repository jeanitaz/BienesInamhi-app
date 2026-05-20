const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde React
app.use(express.json()); // Permite leer los JSON que envíes
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba para verificar que el servidor vive
app.get('/api/status', (req, res) => {
    res.json({ mensaje: "Servidor del sistema de bienes funcionando correctamente." });
});

// Aquí prepararemos la ruta para el Login
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    console.log("Intento de login:", usuario);
    
    // Todo: Aquí irá la consulta a la base de datos
    res.json({ mensaje: "Endpoint de login listo para conectar a la BD" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
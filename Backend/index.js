const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Aquí le decimos que use las rutas que crearemos más adelante
app.use('/api/auth', require('./src/routes/authRoutes'));

app.get('/', (req, res) => {
    res.send('Servidor de SaludYa corriendo 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const express = require('express');
const app     = express();
const PORT    = 3000;

// ── Middleware ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Base de datos en memoria
const registros = [];

// ── GET /ping — prueba de conexión ─────────────────
app.get('/ping', (req, res) => {
  console.log(`[${timestamp()}] PING recibido desde: ${req.ip}`);
  res.send('PONG');
});

// ── GET /datos — enviar datos simples ──────────────
app.get('/datos', (req, res) => {
  console.log(`[${timestamp()}] GET /datos`);
  res.json({
    estado:       'OK',
    mensaje:      'Servidor activo',
    hora:         timestamp(),
    total_envios: registros.length
  });
});

// ── POST /enviar — recibir datos del Arduino ───────
app.post('/enviar', (req, res) => {
  const datos = req.body;
  datos.recibido_en = timestamp();

  registros.push(datos);

  console.log(`[${timestamp()}] POST /enviar →`, datos);

  res.json({
    estado:  'OK',
    mensaje: 'Datos guardados',
    id:      registros.length
  });
});

// ── GET /historial — ver todos los registros ───────
app.get('/historial', (req, res) => {
  res.json({
    total:    registros.length,
    registros: registros
  });
});

// ── GET /ultimo — último registro recibido ─────────
app.get('/ultimo', (req, res) => {
  if (registros.length === 0)
    return res.json({ estado: 'VACIO', mensaje: 'Sin datos aún' });

  res.json(registros[registros.length - 1]);
});

// ── Inicio ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('╔══════════════════════════════════╗');
  console.log('║   Servidor GSM activo             ║');
  console.log(`║   Puerto: ${PORT}                    ║`);
  console.log('╠══════════════════════════════════╣');
  console.log('║  GET  /ping                       ║');
  console.log('║  GET  /datos                      ║');
  console.log('║  POST /enviar  (JSON)             ║');
  console.log('║  GET  /historial                  ║');
  console.log('║  GET  /ultimo                     ║');
  console.log('╚══════════════════════════════════╝');
});

// ── Utilidad ───────────────────────────────────────
function timestamp() {
  return new Date().toLocaleString('es-MX');
}
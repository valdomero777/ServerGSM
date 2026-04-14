const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;

const registros = [];

// ── Middleware ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ── Leer body crudo si no viene Content-Type ────────
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0)
    return next();

  let raw = '';
  req.on('data', chunk => raw += chunk.toString());
  req.on('end', () => {
    if (raw)
    {
      try   { req.body = JSON.parse(raw); }
      catch { req.body = { raw: raw };    }
    }
    next();
  });
});

// ── Headers para permitir cualquier origen ──────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ── GET /ping ───────────────────────────────────────
app.get('/ping', (req, res) => {
  console.log(`[PING] ${timestamp()} desde ${req.ip}`);
  res.send('PONG');
});

// ── GET /datos ──────────────────────────────────────
app.get('/datos', (req, res) => {
  console.log(`[DATOS] ${timestamp()}`);
  res.json({
    estado:       'OK',
    hora:         timestamp(),
    total_envios: registros.length
  });
});

// ── POST /enviar ────────────────────────────────────
app.post('/enviar', (req, res) => {
  const datos      = req.body || {};
  datos.recibido_en = timestamp();
  registros.push(datos);

  console.log(`[POST /enviar] ${timestamp()} →`, JSON.stringify(datos));

  // Respuesta simple que el SIM800 pueda leer sin problema
  res.status(200).send('OK');
});

// ── GET /historial ──────────────────────────────────
app.get('/historial', (req, res) => {
  console.log(`[HISTORIAL] ${registros.length} registros`);
  res.json({
    total:     registros.length,
    registros: registros
  });
});

// ── GET /ultimo ─────────────────────────────────────
app.get('/ultimo', (req, res) => {
  if (!registros.length)
    return res.json({ estado: 'VACIO' });

  res.json(registros[registros.length - 1]);
});

// ── Inicio ──────────────────────────────────────────
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

function timestamp() {
  return new Date().toLocaleString('es-MX');
}
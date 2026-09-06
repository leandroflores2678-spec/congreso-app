require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  server: process.env.DB_SERVER || 'SRVFIORI\\SQLEXPRESS',
  database: process.env.DB_NAME || 'CongresoBD',
  options: {
    trustServerCertificate: true,
    encrypt: false
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASS
    }
  }
};

let pool;

async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log('Conectado a SQL Server');
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
}

// Obtener cronograma con cupos disponibles
app.get('/api/cronograma', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        cc.id,
        cc.dia,
        cc.turno,
        cc.tipo_persona,
        cc.cupo,
        cc.cupo - COUNT(rc.id) AS disponibles
      FROM Cronograma_Comidas cc
      LEFT JOIN Reserva_Comidas rc ON cc.id = rc.cronograma_id
      GROUP BY cc.id, cc.dia, cc.turno, cc.tipo_persona, cc.cupo
      ORDER BY cc.dia,
        CASE cc.turno
          WHEN 'Desayuno' THEN 1
          WHEN 'Almuerzo' THEN 2
          WHEN 'Merienda' THEN 3
          WHEN 'Cena' THEN 4
        END
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar persona + reservar comidas
app.post('/api/registrar', async (req, res) => {
  const { nombre, apellido, telefono, tipo_persona, comidas_ids, conferencia_id } = req.body;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Crear persona
    const personaResult = await request
      .input('nombre', sql.VarChar(100), nombre)
      .input('apellido', sql.VarChar(100), apellido)
      .input('telefono', sql.VarChar(20), telefono)
      .input('tipo_persona', sql.VarChar(20), tipo_persona)
      .query(`
        INSERT INTO Personas (nombre, apellido, telefono, tipo_persona)
        OUTPUT INSERTED.id
        VALUES (@nombre, @apellido, @telefono, @tipo_persona)
      `);

    const personaId = personaResult.recordset[0].id;

    // Inscribir a la conferencia
    if (conferencia_id) {
      const reqInsc = new sql.Request(transaction);
      await reqInsc
        .input('persona_id', sql.Int, personaId)
        .input('conferencia_id', sql.Int, conferencia_id)
        .query('INSERT INTO Inscripciones (persona_id, conferencia_id) VALUES (@persona_id, @conferencia_id)');
    }

    // Reservar comidas
    for (const comidaId of comidas_ids) {
      const reqComida = new sql.Request(transaction);

      // Verificar cupo
      const cupoResult = await reqComida
        .input('cronograma_id', sql.Int, comidaId)
        .query(`
          SELECT cc.cupo - COUNT(rc.id) AS disponibles, cc.tipo_persona
          FROM Cronograma_Comidas cc
          LEFT JOIN Reserva_Comidas rc ON cc.id = rc.cronograma_id
          WHERE cc.id = @cronograma_id
          GROUP BY cc.cupo, cc.tipo_persona
        `);

      if (cupoResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: `Comida ${comidaId} no encontrada` });
      }

      const { disponibles, tipo_persona: tipoComida } = cupoResult.recordset[0];

      if (disponibles <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'No hay cupo disponible para una de las comidas seleccionadas' });
      }

      if (tipoComida === 'Pastor' && tipo_persona !== 'Pastor') {
        await transaction.rollback();
        return res.status(400).json({ error: 'Esa comida es solo para Pastores' });
      }

      const reqInsert = new sql.Request(transaction);
      await reqInsert
        .input('persona_id', sql.Int, personaId)
        .input('cronograma_id', sql.Int, comidaId)
        .query('INSERT INTO Reserva_Comidas (persona_id, cronograma_id) VALUES (@persona_id, @cronograma_id)');
    }

    await transaction.commit();
    res.json({ success: true, persona_id: personaId });
  } catch (err) {
    try { await transaction.rollback(); } catch (_) {}
    if (err.message.includes('UQ_Persona_Comida')) {
      return res.status(400).json({ error: 'Ya estás inscrito en esa comida' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Admin: ver inscriptos por comida
app.get('/api/admin/reservas', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        rc.id,
        p.nombre,
        p.apellido,
        p.telefono,
        p.tipo_persona,
        cc.dia,
        cc.turno,
        rc.fecha_reserva
      FROM Reserva_Comidas rc
      JOIN Personas p ON rc.persona_id = p.id
      JOIN Cronograma_Comidas cc ON rc.cronograma_id = cc.id
      ORDER BY cc.dia, cc.turno, p.apellido
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: resumen de cupos
app.get('/api/admin/resumen', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT
        cc.id,
        cc.dia,
        cc.turno,
        cc.tipo_persona,
        cc.cupo,
        COUNT(rc.id) AS inscriptos,
        cc.cupo - COUNT(rc.id) AS disponibles
      FROM Cronograma_Comidas cc
      LEFT JOIN Reserva_Comidas rc ON cc.id = rc.cronograma_id
      GROUP BY cc.id, cc.dia, cc.turno, cc.tipo_persona, cc.cupo
      ORDER BY cc.dia,
        CASE cc.turno
          WHEN 'Desayuno' THEN 1
          WHEN 'Almuerzo' THEN 2
          WHEN 'Merienda' THEN 3
          WHEN 'Cena' THEN 4
        END
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Descargar Excel por comida
app.get('/api/admin/excel/:cronograma_id', async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const cronogramaId = req.params.cronograma_id;

    const infoResult = await pool.request()
      .input('id', sql.Int, cronogramaId)
      .query('SELECT dia, turno FROM Cronograma_Comidas WHERE id = @id');

    if (infoResult.recordset.length === 0) return res.status(404).json({ error: 'No encontrado' });

    const { dia, turno } = infoResult.recordset[0];
    const fecha = new Date(dia);
    const dias = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
    const nombreArchivo = `${dias[fecha.getDay()]} ${fecha.getDate()} - ${turno}`;

    const personasResult = await pool.request()
      .input('id', sql.Int, cronogramaId)
      .query(`
        SELECT p.id, p.nombre, p.apellido, p.tipo_persona
        FROM Reserva_Comidas rc
        JOIN Personas p ON rc.persona_id = p.id
        WHERE rc.cronograma_id = @id
        ORDER BY p.tipo_persona, p.apellido
      `);

    const personas = personasResult.recordset;
    const pastores = personas.filter(p => p.tipo_persona === 'Pastor');
    const hermanos = personas.filter(p => p.tipo_persona === 'Hermano' || p.tipo_persona === 'Asistente');
    const colaboradores = personas.filter(p => p.tipo_persona === 'Colaborador');
    const invitados = personas.filter(p => p.tipo_persona === 'Invitado');

    const wb = new ExcelJS.Workbook();

    const crearHoja = (nombre, lista, color) => {
      const ws = wb.addWorksheet(nombre);
      ws.getColumn(1).width = 8;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 20;

      ws.mergeCells('A1:C1');
      const contadorCell = ws.getCell('A1');
      contadorCell.value = `${nombre}: ${lista.length}`;
      contadorCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      contadorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      contadorCell.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 30;

      const header = ws.addRow(['ID', 'Nombre', 'Apellido']);
      header.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D2D2D' } };
        cell.alignment = { horizontal: 'center' };
      });

      lista.forEach((p, i) => {
        const row = ws.addRow([i + 1, p.nombre, p.apellido]);
        row.eachCell(cell => {
          cell.alignment = { horizontal: 'left' };
          if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        });
      });
    };

    crearHoja('Pastores', pastores, 'FF8B4513');
    crearHoja('Hermanos', hermanos, 'FF1A5276');
    crearHoja('Colaboradores', colaboradores, 'FF1E8449');
    crearHoja('Invitados', invitados, 'FF7D3C98');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar reserva (admin)
app.delete('/api/admin/reservas/:id', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Reserva_Comidas WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const path = require('path');
const frontendPath = path.join(__dirname, '..', 'frontend', 'build');
const fs = require('fs');
if (fs.existsSync(frontendPath)) {
  // Subdominio admin: redirige al panel de administracion
  app.use((req, res, next) => {
    const host = req.hostname || '';
    if (host.startsWith('admin.') && req.path === '/' && !req.path.startsWith('/api')) {
      return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Admin</title></head><body><script>window.location.replace(window.location.origin + '/#admin');</script></body></html>`);
    }
    next();
  });
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`API corriendo en http://0.0.0.0:${PORT}`));
});

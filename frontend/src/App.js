import React, { useState, useEffect } from 'react';
import './App.css';

const API = '/api';

function App() {
  const [page, setPage] = useState(window.location.hash === '#admin' ? 'admin' : 'inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setPage('inicio');
    window.location.hash = '';
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (page === 'admin') {
    return <AdminPanel onVolver={() => { setPage('inicio'); window.location.hash = ''; }} />;
  }

  return (
    <>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <button className="nav-brand" onClick={() => { setPage('inicio'); window.scrollTo(0, 0); }}>
          <img src="/favicon.png" alt="logo" className="nav-logo" />
          Iglesia Maranatha
        </button>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button className="nav-link" onClick={() => scrollTo('inicio')}>Inicio</button>
          <button className="nav-link" onClick={() => scrollTo('inscripcion')}>Inscripcion</button>
          <button className="nav-link" onClick={() => scrollTo('ubicacion')}>Ubicacion</button>
          <button className="nav-link" onClick={() => scrollTo('contacto')}>Contacto</button>
          <button className="nav-cta" onClick={() => scrollTo('inscripcion')}>INSCRIBIRME</button>
        </div>
      </nav>

      <Hero onInscribirse={() => scrollTo('inscripcion')} />
      <Intro />
      <Inscripcion />
      <Ubicacion />
      <Contacto />
      <Footer />
    </>
  );
}

/* ====== HERO ====== */
function Hero({ onInscribirse }) {
  return (
    <header className="hero" id="inicio">
      <div className="hero-bg-img" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/iglesia.jpg)` }} />
      <div className="hero-overlay" />

      <img src="/aceite.png" alt="" className="hero-aceite" />

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-eyebrow">Iglesia Centro Evangelistico Maranatha</div>
          <h1>
            <span className="hero-title-main">CONFERENCIA</span>
            <span className="hero-title-accent">Aniversario 65</span>
          </h1>
          <div className="hero-date">9 AL 13 DE SEPTIEMBRE 2026</div>
          <div>
            <span className="hero-lema-text">"Sere ungido</span>
            <span className="hero-lema-accent">con aceite fresco"</span>
          </div>
          <div className="hero-ref">Salmos 92:10</div>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onInscribirse}>INSCRIBIRME</button>
            <button className="btn-outline" onClick={() => {
              const el = document.getElementById('ubicacion');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>COMO LLEGAR</button>
          </div>
        </div>
      </div>

      {/* Gotas animadas */}
      <div className="oil-drops">
        <div className="oil-drop drop-1" />
        <div className="oil-drop drop-2" />
        <div className="oil-drop drop-3" />
        <div className="oil-drop drop-4" />
        <div className="oil-drop drop-5" />
      </div>
    </header>
  );
}

/* ====== INTRO ====== */
function Intro() {
  return (
    <section className="intro">
      <div className="intro-glow" />
      <div className="container">
        <div className="intro-badge">65 años de historia</div>
        <p>
          La Iglesia Centro Evangelistico Maranatha celebra 65 años de historia, fe, servicio
          y fidelidad de Dios. En esta conferencia nos reunimos para celebrar lo que Dios ha
          hecho y renovar nuestro compromiso con Su propósito.
        </p>
        <div className="intro-divider">
          <span className="intro-divider-line" />
          <span className="intro-divider-icon">✦</span>
          <span className="intro-divider-line" />
        </div>
        <div className="intro-stats">
          <div className="intro-stat"><span className="intro-stat-num">65</span><span className="intro-stat-label">Años</span></div>
          <div className="intro-stat-sep" />
          <div className="intro-stat"><span className="intro-stat-num">9–13</span><span className="intro-stat-label">Septiembre</span></div>
          <div className="intro-stat-sep" />
          <div className="intro-stat"><span className="intro-stat-num">Salta</span><span className="intro-stat-label">Argentina</span></div>
        </div>
      </div>
    </section>
  );
}

/* ====== INSCRIPCIÓN ====== */
function Inscripcion() {
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', tipo_persona: 'Hermano', iglesia: '' });
  const [cronograma, setCronograma] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargarCronograma(); }, []);

  const cargarCronograma = async () => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API}/cronograma`, { signal: controller.signal });
      const data = await res.json();
      setCronograma(data.filter(c => c.turno !== 'Cena'));
    } catch {
      // Datos de prueba mientras no hay conexión al servidor
      setCronograma([
        { id: 1, dia: '2026-09-10T00:00:00.000Z', turno: 'Desayuno', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 2, dia: '2026-09-10T00:00:00.000Z', turno: 'Almuerzo', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 3, dia: '2026-09-10T00:00:00.000Z', turno: 'Merienda', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 4, dia: '2026-09-11T00:00:00.000Z', turno: 'Desayuno', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 5, dia: '2026-09-11T00:00:00.000Z', turno: 'Almuerzo', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 6, dia: '2026-09-11T00:00:00.000Z', turno: 'Merienda', tipo_persona: 'Todos', cupo: 200, disponibles: 200 },
        { id: 7, dia: '2026-09-12T00:00:00.000Z', turno: 'Desayuno', tipo_persona: 'Todos', cupo: 300, disponibles: 300 },
        { id: 8, dia: '2026-09-12T00:00:00.000Z', turno: 'Almuerzo', tipo_persona: 'Todos', cupo: 300, disponibles: 300 },
        { id: 9, dia: '2026-09-12T00:00:00.000Z', turno: 'Merienda', tipo_persona: 'Todos', cupo: 300, disponibles: 300 },
        { id: 10, dia: '2026-09-13T00:00:00.000Z', turno: 'Desayuno', tipo_persona: 'Todos', cupo: 300, disponibles: 300 },
        { id: 11, dia: '2026-09-13T00:00:00.000Z', turno: 'Almuerzo', tipo_persona: 'Todos', cupo: 300, disponibles: 300 },
      ]);
    }
  };

  const toggleComida = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.telefono || !form.tipo_persona) return setMensaje({ tipo: 'error', texto: 'Completa todos los campos obligatorios' });
    if (seleccionadas.length === 0) return setMensaje({ tipo: 'error', texto: 'Selecciona al menos una comida' });

    setLoading(true);
    try {
      const res = await fetch(`${API}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, comidas_ids: seleccionadas, conferencia_id: 2 })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: 'exito', texto: '¡Inscripcion exitosa! Nos vemos en la conferencia 🙌' });
        setForm({ nombre: '', apellido: '', telefono: '', tipo_persona: 'Hermano', iglesia: '' });
        setSeleccionadas([]);
        cargarCronograma();
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexion con el servidor' });
    }
    setLoading(false);
  };

  const HORARIOS = {
    'Desayuno': '7:30 a 8:30 hs',
    'Almuerzo': '13:00 hs',
    'Merienda': '18:00 a 19:00 hs',
  };
  const HORARIOS_DOMINGO = { 'Desayuno': '8:00 a 9:00 hs' };

  const getHorario = (turno, diaStr) => {
    const d = new Date(diaStr + 'T12:00:00');
    if (d.getDay() === 0 && HORARIOS_DOMINGO[turno]) return HORARIOS_DOMINGO[turno];
    return HORARIOS[turno] || '';
  };

  const diasAgrupados = cronograma.reduce((acc, c) => {
    const dia = c.dia.split('T')[0];
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(c);
    return acc;
  }, {});

  const formatDia = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const d = new Date(fecha + 'T12:00:00');
    return `${dias[d.getDay()]} ${d.getDate()}`;
  };

  return (
    <section id="inscripcion" className="inscripcion-section">
      <div className="container">
        <div className="inscripcion-header">
          <div className="section-eyebrow">Registro</div>
          <h2 className="section-title">Inscribirme</h2>
        </div>

        <div className="inscripcion-card">
          <h3>Registrarme a la conferencia</h3>
          {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

          <form onSubmit={enviar}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido *</label>
                <input className="form-input" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} placeholder="Tu apellido" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefono *</label>
                <input className="form-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Tu telefono" required />
              </div>
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select className="form-input" value={form.tipo_persona} onChange={e => setForm({ ...form, tipo_persona: e.target.value })}>
                  <option value="Hermano">Hermano</option>
                  <option value="Colaborador">Colaborador</option>
                  <option value="Invitado">Invitado</option>
                </select>
              </div>
            </div>


            {Object.keys(diasAgrupados).length > 0 && (
              <>
                <h3 style={{ marginTop: '12px' }}>Selecciona tus comidas</h3>
                <div className="dias-grid">
                  {Object.entries(diasAgrupados).map(([dia, comidas]) => (
                    <div key={dia} className="dia-card">
                      <h4>{formatDia(dia)}</h4>
                      <div className="comidas-row">
                        {comidas.map(c => {
                          const agotado = c.disponibles <= 0;
                          const diaDate = new Date(dia + 'T06:00:00');
                          const cerrado = new Date() >= diaDate;
                          const disabled = agotado || cerrado;
                          const selected = seleccionadas.includes(c.id);
                          return (
                            <div key={c.id} className={`comida-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${agotado ? 'agotado' : ''} ${cerrado ? 'cerrado' : ''}`} onClick={() => !disabled && toggleComida(c.id)}>
                              <input type="checkbox" checked={selected} disabled={disabled} readOnly className="comida-checkbox-hidden" />
                              <div className="comida-card-turno">
                                {c.turno}
                              </div>
                              <div className="comida-card-horario">{getHorario(c.turno, dia)}</div>
                              {agotado ? (
                                <div className="comida-card-cupo agotado-text">AGOTADO</div>
                              ) : cerrado ? (
                                <div className="comida-card-cupo cerrado-text">CERRADO</div>
                              ) : (
                                <div className="comida-card-cupo"><span>{c.disponibles}</span>/{c.cupo}</div>
                              )}
                              {c.tipo_persona === 'Pastor' && <span className="badge-pastor">Solo Pastores</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Registrando...' : 'CONFIRMAR INSCRIPCION'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ====== UBICACIÓN ====== */
function Ubicacion() {
  return (
    <section id="ubicacion" className="ubicacion-section" style={{ '--iglesia2-bg': `url(${process.env.PUBLIC_URL}/iglesia2.png)` }}>
      <div className="container">
        <div className="section-eyebrow">Donde estamos</div>
        <h2 className="section-title">Encontranos</h2>
        <p className="ubicacion-nombre">Iglesia Centro Evangelistico Maranatha</p>
        <div className="map-wrapper">
          <iframe
            title="Mapa"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3622.1!2d-65.4090889!3d-24.801028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941bc30a0c49ba59%3A0x831880cce99ad28a!2sIglesia%20Maranatha!5e0!3m2!1ses!2sar!4v1690000000000"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <a href="https://maps.app.goo.gl/tjDdYCUUK937Amhp8" target="_blank" rel="noreferrer" className="btn-outline">
          COMO LLEGAR
        </a>
      </div>
    </section>
  );
}

/* ====== CONTACTO ====== */
function Contacto() {
  return (
    <section id="contacto" className="contacto-section">
      <div className="contacto-glow" />
      <div className="container">
        <div className="section-eyebrow">Comunicate</div>
        <h2 className="section-title">Estamos para <span className="gold">recibirte</span></h2>
        <p className="ubicacion-nombre">Iglesia Centro Evangelistico Maranatha</p>
        <p className="ubicacion-dir">Cordoba 867, Salta</p>
        <div className="contacto-redes">
          <a href="https://www.instagram.com/iglesiamaranathasalta/" target="_blank" rel="noreferrer" className="contacto-btn contacto-btn-ig">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            Instagram
          </a>
          <a href="https://www.facebook.com/MCMMSalta/" target="_blank" rel="noreferrer" className="contacto-btn contacto-btn-fb">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            Facebook
          </a>
        </div>
      </div>
    </section>
  );
}

/* ====== ADMIN ====== */
function AdminPanel({ onVolver }) {
  const [resumen, setResumen] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [diaActivo, setDiaActivo] = useState(null);
  const [comidaActiva, setComidaActiva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const [resRes, revRes] = await Promise.all([
        fetch(`${API}/admin/resumen`, { signal: controller.signal }),
        fetch(`${API}/admin/reservas`, { signal: controller.signal })
      ]);
      setResumen(await resRes.json());
      setReservas(await revRes.json());
    } catch {
      setResumen([]);
      setReservas([]);
    }
    setLoading(false);
  };

  const eliminarReserva = async (id) => {
    try {
      await fetch(`${API}/admin/reservas/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch {}
  };

  const diasAgrupados = resumen.reduce((acc, c) => {
    const dia = c.dia.split('T')[0];
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(c);
    return acc;
  }, {});

  const formatDia = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const d = new Date(fecha + 'T12:00:00');
    return `${dias[d.getDay()]} ${d.getDate()}`;
  };

  const personasComida = (cronogramaId) => {
    return reservas.filter(r => {
      const rDia = r.dia.split('T')[0];
      const cDia = comidaActiva?.dia.split('T')[0];
      return rDia === cDia && r.turno === comidaActiva?.turno;
    });
  };

  const totalInscritos = resumen.reduce((sum, c) => sum + (c.cupo - c.disponibles), 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="btn-outline" onClick={onVolver}>← Volver</button>
        <h1>Panel de Administracion</h1>
        <button className="btn-primary" onClick={cargarDatos}>Actualizar</button>
      </div>

      {loading ? (
        <div className="admin-loading">Cargando datos...</div>
      ) : resumen.length === 0 ? (
        <div className="admin-empty">No se pudo conectar al servidor. Verifica que el backend este corriendo.</div>
      ) : (
        <div className="admin-content">
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat-num">{Object.keys(diasAgrupados).length}</span>
              <span className="admin-stat-label">Dias</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-num">{resumen.length}</span>
              <span className="admin-stat-label">Turnos</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-num">{reservas.length}</span>
              <span className="admin-stat-label">Reservas</span>
            </div>
          </div>

          <div className="admin-dias">
            {Object.entries(diasAgrupados).map(([dia, comidas]) => {
              const isActive = diaActivo === dia;
              const totalDia = comidas.reduce((s, c) => s + (c.cupo - c.disponibles), 0);
              const totalCupo = comidas.reduce((s, c) => s + c.cupo, 0);
              return (
                <div key={dia} className="admin-dia">
                  <div className={`admin-dia-header ${isActive ? 'active' : ''}`} onClick={() => { setDiaActivo(isActive ? null : dia); setComidaActiva(null); }}>
                    <span className="admin-dia-nombre">{formatDia(dia)}</span>
                    <span className="admin-dia-cupo">{totalDia}/{totalCupo} inscriptos</span>
                    <span className="admin-dia-arrow">{isActive ? '▲' : '▼'}</span>
                  </div>

                  {isActive && (
                    <div className="admin-comidas">
                      {comidas.map(c => {
                        const inscriptos = c.cupo - c.disponibles;
                        const isComidaActive = comidaActiva?.id === c.id;
                        const personas = reservas.filter(r => {
                          const rDia = r.dia.split('T')[0];
                          return rDia === dia && r.turno === c.turno;
                        });
                        return (
                          <div key={c.id} className="admin-comida">
                            <div className={`admin-comida-header ${isComidaActive ? 'active' : ''}`} onClick={() => setComidaActiva(isComidaActive ? null : c)}>
                              <span className="admin-comida-turno">{c.turno}</span>
                              {c.tipo_persona === 'Pastor' && <span className="badge-pastor">Solo Pastores</span>}
                              <span className="admin-comida-cupo">
                                <span className={inscriptos > 0 ? 'has-inscriptos' : ''}>{inscriptos}</span>/{c.cupo}
                              </span>
                              <a href={`${API}/admin/excel/${c.id}`} className="admin-btn-excel" onClick={e => e.stopPropagation()} download>📥 Excel</a>
                            </div>

                            {isComidaActive && (
                              <div className="admin-personas">
                                {personas.length === 0 ? (
                                  <div className="admin-persona-empty">No hay inscriptos en este turno</div>
                                ) : (
                                  <>
                                    <div className="admin-persona-header">
                                      <span>Nombre</span>
                                      <span>Telefono</span>
                                      <span>Tipo</span>
                                      <span></span>
                                    </div>
                                    {personas.map(p => (
                                      <div key={p.id} className="admin-persona-row">
                                        <span>{p.nombre} {p.apellido}</span>
                                        <span>{p.telefono || '-'}</span>
                                        <span>{p.tipo_persona}</span>
                                        <button className="admin-btn-delete" onClick={() => eliminarReserva(p.id)}>✕</button>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== FOOTER ====== */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          Iglesia Centro Evangelistico Maranatha — Desarrolladores: Evelin Amarilla y Flores Leandro
        </div>
      </div>
    </footer>
  );
}

export default App;

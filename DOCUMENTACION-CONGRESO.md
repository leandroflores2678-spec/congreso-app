# Documentación Completa - Congreso App
## Iglesia Centro Evangelístico Misionero Maranatha

**Fecha:** Septiembre 2026
**Dominio:** iglesiacentromisioneromaranatha.com.ar
**Desarrollador:** Leandro (lf520809@gmail.com)

---

## 1. Arquitectura del Proyecto

```
congreso-app/
├── frontend/                 ← React CRA (Create React App)
│   ├── public/
│   │   ├── index.html        ← SEO meta tags, Open Graph, favicon
│   │   └── favicon.png
│   ├── src/
│   │   ├── App.js            ← Componente principal (formulario, comidas, admin)
│   │   ├── App.css           ← Estilos con responsive design completo
│   │   └── index.js
│   ├── build/                ← Build de producción (se sube con git add -f)
│   └── package.json
├── backend/
│   ├── server.js             ← Express + SQL Server
│   ├── .env                  ← Variables de entorno (PORT, DB_PASS)
│   └── package.json
└── .claude/
    └── launch.json           ← Config dev server local
```

## 2. Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React (CRA) |
| Backend | Node.js + Express |
| Base de datos | SQL Server (SRVFIORI\SQLEXPRESS) |
| Servidor | Windows Server 2012 R2 |
| Proxy/CDN | Cloudflare (SSL Flexible) |
| Process Manager | PM2 |
| Repositorio | GitHub (PRIVADO - tiene credenciales DB) |

## 3. Infraestructura de Red

```
Internet → Cloudflare (SSL) → Router TP-Link Archer C86 → Servidor Windows
                                Puerto 80 → Puerto 2678
```

### Datos de red:
- **IP del servidor:** 192.168.10.200
- **Gateway del servidor:** 192.168.10.250 (NO es 192.168.10.1)
- **Puerto del backend:** 2678 (cambiado de 3001 porque estaba ocupado)
- **Router admin:** accesible solo desde PC local (no desde el servidor)

### Port forwarding (Router):
- Puerto externo 80 → Puerto interno 2678 → IP 192.168.10.200

### Netsh portproxy (Servidor):
```cmd
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=2678 connectaddress=127.0.0.1
```

## 4. Configuración del Servidor

### Ubicación de archivos en el servidor:
```
E:\Sistemas(no tocar)\Congreso-new\
├── backend\
│   ├── server.js
│   └── .env
└── frontend\
    └── build\          ← Archivos estáticos servidos por Express
```

### Variables de entorno (.env):
```
DB_PASS=BD_2017#Express!
PORT=2678
```

### PM2 (Process Manager):
```cmd
# Iniciar
cd "E:\Sistemas(no tocar)\Congreso-new\backend"
pm2 start server.js --name congreso

# Reiniciar después de un deploy
pm2 restart congreso

# Ver logs
pm2 logs congreso

# Ver estado
pm2 status

# Guardar config
pm2 save
```

**NOTA:** `pm2 startup` no funciona en Windows Server 2012 R2. Si el servidor se reinicia, hay que levantar PM2 manualmente.

## 5. Proceso de Deploy

### Desde la PC de desarrollo:
```bash
# 1. Hacer cambios en frontend/src/
# 2. Build
cd C:\Users\Leandro\Desktop\congreso-app\frontend
npm run build

# 3. Commit con force-add del build (está en .gitignore)
cd C:\Users\Leandro\Desktop\congreso-app
git add -f frontend/build/ frontend/src/App.css
git commit -m "Descripción del cambio"
git push
```

### En el servidor:
```cmd
cd "E:\Sistemas(no tocar)\Congreso-new"
git pull
pm2 restart congreso
```

### Verificar que funciona:
- Abrir https://iglesiacentromisioneromaranatha.com.ar
- Si da Error 521 = el servidor Node no está corriendo → `pm2 restart congreso`

## 6. Desarrollo Local

### Dev server React:
```bash
cd C:\Users\Leandro\Desktop\congreso-app\frontend
npm start
# Abre en http://localhost:3000
```

### Probar responsive:
1. Abrir Chrome
2. F12 (DevTools)
3. Click en icono de celular/tablet (arriba a la izquierda del panel)
4. Elegir dispositivo o poner tamaño custom

### Breakpoints estándar del responsive:
| Breakpoint | Tamaño | Dispositivo |
|---|---|---|
| Small phones | max-width: 400px | iPhone SE viejo, phones chicos |
| Phones | max-width: 600px | Mayoría de celulares |
| Tablets | max-width: 768px | iPad, tablets |
| Laptops | max-width: 992px | Notebooks, laptops chicas |
| Large | min-width: 1200px | Monitores, desktop |
| Extra large | min-width: 1920px | Monitores Full HD+ |

## 7. SEO Configurado

### Meta tags en index.html:
- `description`: Conferencia Aniversario 65 años
- `keywords`: iglesia maranatha, congreso maranatha, etc.
- `robots`: index, follow
- `canonical`: https://iglesiacentromisioneromaranatha.com.ar
- **Open Graph**: título, descripción, URL, tipo, locale (es_AR)

### Pendiente:
- [ ] Configurar Google Search Console
- [ ] Subir sitemap.xml
- [ ] Agregar og:image con imagen de la iglesia

## 8. Diseño Frontend

### Paleta de colores:
| Variable | Hex | Uso |
|---|---|---|
| --bg | #0a0a0f | Fondo principal (casi negro) |
| --gold | #d4a44a | Color principal (dorado) |
| --gold2 | #e8c068 | Dorado claro (hover) |
| --text | #f0f0f5 | Texto principal (blanco) |
| --text2 | rgba(240,240,245,0.6) | Texto secundario |
| --green | #22c55e | Éxito |
| --red | #ef4444 | Error |

### Tipografías:
- **Inter**: Texto general, botones, labels
- **Playfair Display**: Títulos decorativos, lema, cursivas
- **Petit Formal Script**: (cargada pero poco usada)

### Animaciones:
| Elemento | Animación | Duración | Detalle |
|---|---|---|---|
| Aceite (hero) | aceiteFloat | 12s | Sube 12px + respira opacidad (0.9→0.82) |
| Gotas de aceite | dropFall | 7-12s | Caen desde arriba, diferentes velocidades |
| Fondo ubicación | bgDrift | 20s | Zoom suave (scale 1.02→1.04) |
| Hero content | fadeUp | 1s | Aparece subiendo desde abajo |

### Problema del temblor ("parkinson"):
- **Causa:** `translate` con valores pequeños en pantallas sin GPU causa sub-pixel rendering jitter
- **Solución:** Movimiento lento (12s), valores redondos (12px), `translateZ(0)` para forzar GPU, `backface-visibility: hidden`
- **En servidores sin GPU:** Puede temblar levemente, pero los usuarios lo ven en sus dispositivos (con GPU)

## 9. Secciones de la Página

1. **Hero**: Imagen de fondo de la iglesia + aceite cascada + título + lema + botones
2. **Intro (65 Años)**: Badge + descripción + stats (65 años, 9-13 sept, Salta)
3. **Info**: Número grande + detalles del evento + card con horarios
4. **Inscripción**: Formulario (nombre, apellido, teléfono, iglesia, asistente) + selector de comidas por día
5. **Ubicación**: Mapa Google embebido + dirección (Córdoba 867, Salta)
6. **Contacto**: Redes sociales (Instagram, Facebook, WhatsApp)
7. **Admin**: Panel oculto para ver inscripciones (accesible por URL)

## 10. Seguridad

- **IMPORTANTE: El repositorio DEBE ser PRIVADO** — contiene la contraseña de la base de datos (`BD_2017#Express!`) en el .env del servidor
- Nunca hacer el repo público sin antes sacar las credenciales
- Las credenciales de la DB están en el .env del servidor, no en el código

## 11. Cloudflare

- **Modo SSL:** Flexible (Cloudflare maneja HTTPS, conexión a origen es HTTP)
- **Error 521:** Significa que el servidor Node no responde → verificar PM2
- **DNS:** Proxy activado (nube naranja)
- **Cache:** Cloudflare cachea los estáticos automáticamente

## 12. Problemas Comunes y Soluciones

| Problema | Causa | Solución |
|---|---|---|
| Error 521 | Servidor Node caído | `pm2 restart congreso` en el servidor |
| Página con estilos rotos | Build viejo, CSS con hash diferente | `npm run build` + `git add -f frontend/build/` + push + pull |
| EADDRINUSE | Puerto ocupado | Cambiar puerto en .env o matar proceso viejo |
| Aceite tiembla | translate sin GPU | Movimiento lento + translateZ(0) + backface-visibility |
| PM2 crash loop | Puerto ocupado por otro proceso | `netstat -ano | findstr :PUERTO` → matar PID |
| git pull falla | Conflictos | `git stash` → `git pull` → `git stash pop` |
| Router no accesible desde servidor | Gateway diferente | Router admin solo desde PC local (gateway 192.168.10.250) |

## 13. Pendientes

- [ ] Subdominio admin (admin.iglesiacentromisioneromaranatha.com.ar) para controlar las listas
- [ ] Google Search Console
- [ ] Sitemap.xml
- [ ] og:image para compartir en redes
- [ ] PM2 auto-start en Windows (tarea programada como alternativa)
- [ ] Backup automático de la base de datos

## 14. Comandos Útiles

```cmd
# Ver qué proceso usa un puerto
netstat -ano | findstr :2678

# Matar proceso por PID
taskkill /PID <numero> /F

# Ver port proxy de Windows
netsh interface portproxy show all

# Agregar port proxy
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=2678 connectaddress=127.0.0.1

# PM2 comandos
pm2 status
pm2 logs congreso
pm2 restart congreso
pm2 stop congreso
pm2 delete congreso
pm2 start server.js --name congreso
```

## 15. GitHub

- **Repo:** https://github.com/leandroflores2678-spec/congreso-app.git
- **Branch:** main
- **PRIVADO** (no hacer público por credenciales)
- El build/ está en .gitignore pero se sube con `git add -f`

---

*Documento generado el 4 de septiembre de 2026*
*Asistido por Claude Opus 4.6*

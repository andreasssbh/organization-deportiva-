# Editor del sitio (acceso de Víctor)

El Dr. Víctor Jiménez puede cambiar los textos, las fotos y los PDF de la página **desde el propio sitio**, sin
pasar por nosotros. Los cambios son permanentes: cada «Guardar» crea un commit en GitHub y Vercel vuelve a publicar
la web en uno o dos minutos.

## Cómo lo usa Víctor

1. Entra en la web y pulsa **«Acceso editor»** (al final de la página), o abre directamente `/#acceso`.
2. Escribe su contraseña. Aparece una barra negra abajo: **Modo edición**.
3. Hace clic en cualquier texto y escribe. Al hacer clic en un párrafo, un punto de una lista, una tarjeta o una foto
   aparece una barra pequeña:
   - **B**, *I*, 🔗: negrita, cursiva y enlaces (seleccionando antes el texto);
   - **↑ ↓**: mover el elemento; **⧉**: duplicarlo (así se añade algo nuevo: se duplica uno parecido y se cambia el
     texto); **🗑**: eliminarlo; **⤴**: seleccionar el bloque que lo contiene (la tarjeta, la sección entera…).
4. Fotos: botón **«Cambiar foto»** sobre cada foto (se reducen solas a 1800 px). **«Quitar»** la oculta.
5. Apuntes: botón **«Subir PDF»** junto a cada tema (máximo 3 MB por archivo).
6. Cada texto existe en español y en inglés: con **ES / EN** de la cabecera se cambia la versión que se edita.
   Un texto y su traducción se mueven, duplican y eliminan juntos.
7. **Guardar**. Si algo sale mal: **Historial → Restaurar** vuelve a poner el contenido de una versión anterior.

La sesión dura 12 horas. **Salir** la cierra.

## Qué se puede editar

Solo lo que está entre los comentarios `editable:nav`, `editable:main` y `editable:footer` de `index.html`:
el menú, todo el contenido y el pie. Los estilos, el script, la cabecera y el enlace «Acceso editor» quedan fuera,
así que el editor no puede romper el diseño ni bloquearse a sí mismo el acceso.

**Importante para nosotros**: Víctor guarda en la rama de producción. Antes de tocar `index.html`, hacer
`git pull` de esa rama para no pisar sus cambios, y no quitar ni duplicar los comentarios `editable:…`.

## Cómo funciona

| Pieza | Qué hace |
|---|---|
| `admin/editor.js` | El editor. `index.html` solo lo carga si existe la cookie `sm_editor` o se abre `#acceso`; los visitantes no descargan nada. |
| `api/login.js`, `api/logout.js`, `api/session.js` | Sesión: cookie firmada (HMAC, `HttpOnly`, `SameSite=Strict`, 12 h). Cambiar `ADMIN_PASSWORD` cierra todas las sesiones. |
| `api/upload.js` | Sube una foto o PDF a GitHub como *blob* (aún sin publicar). |
| `api/save.js` | Sustituye las zonas editables en `index.html` y crea **un solo commit** con el HTML y los archivos subidos. Limpia `<script>`, `on…=` y `javascript:` del contenido. |
| `api/history.js` | Lista las últimas versiones de `index.html` y restaura las zonas editables de una de ellas (sin deshacer cambios de código posteriores). |
| `api/_lib/` | Código compartido (no se publica como función). |

Si Víctor abre la página mientras todavía se está publicando un cambio, el editor lo detecta (versión publicada ≠
última versión en GitHub) y no deja guardar hasta recargar, para no borrar ese cambio.

## Puesta en marcha (una sola vez)

En Vercel → proyecto `organization-deportiva-` → **Settings → Environment Variables** (entorno *Production*):

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | La contraseña de Víctor (larga; se la damos en persona o por un canal seguro). |
| `GITHUB_TOKEN` | Token *fine-grained* de GitHub: **Repository access** → solo `organization-deportiva-`; **Permissions** → *Contents: Read and write*. Ponerle caducidad larga y apuntar la fecha. |
| `GITHUB_REPO` | `andreasssbh/organization-deportiva-` (valor por defecto). |
| `GITHUB_BRANCH` | La rama de producción de Vercel. Hoy: `claude/practical-lamport-54u3mt` (valor por defecto). |

Después, volver a desplegar (*Deployments → Redeploy*) para que las funciones lean las variables.

Si el token caduca, «Guardar» dará un error «GitHub 401»: crear uno nuevo y sustituir `GITHUB_TOKEN`.

## Probar en local

```bash
cp .env.example .env.local   # y poner una ADMIN_PASSWORD de prueba
python3 dev/server.py        # → http://localhost:8787/#acceso
```

`dev/server.py` imita las funciones de `api/` guardando en una copia (`.dev-site/`), sin GitHub ni Vercel; el
`index.html` del repositorio no se modifica.

## Límites

- PDF y fotos: máximo ~3 MB por archivo (límite de 4,5 MB por petición de Vercel). Las fotos se comprimen solas.
- Una sola cuenta de editor. Para dar acceso a otra persona se le da la misma contraseña (o se cambia).
- Si se borra una sección entera, su enlace del menú sigue ahí: hay que borrarlo también (el menú es editable).

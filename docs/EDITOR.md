# Editor del sitio (acceso de Víctor)

El Dr. Víctor Jiménez puede cambiar los textos, las fotos y los PDF de la página **desde el propio sitio**, sin
pasar por nosotros. Los cambios son permanentes: cada «Guardar» crea un commit en GitHub y Vercel vuelve a publicar
la web en uno o dos minutos.

## Cómo lo usa Víctor

1. Entra en la web y pulsa **«Acceso editor»** (al final de la página), o abre directamente `/#acceso`.
2. Escribe su contraseña. Aparece una barra negra abajo: **Modo edición**.
3. Hace clic en cualquier texto y escribe. Al hacer clic en un párrafo, un punto de una lista, un bloque o una foto
   (o en el título de una sección, para seleccionar la sección entera) aparece una barra pequeña de dos filas:
   - **Formato del texto**: **B** negrita, *I* cursiva, U subrayado, **A− / A+** tamaño (pequeño, normal, grande,
     muy grande), **color** (normal, rojo, gris), **alineación** (izquierda, centro, derecha), **listas** (dentro de
     un cuadro de texto), **🔗 enlace** y **T×** quitar formato. Con palabras seleccionadas se aplica a ellas; sin
     selección, al párrafo entero (y la alineación y el tamaño de un párrafo entero valen para los dos idiomas).
     El enlace abre una ventana con el **texto que se ve** y **adónde lleva**: una página web (basta con
     `www.ejemplo.com`), un correo, una sección de esta página o un PDF que se sube ahí mismo;
   - **El elemento**: **⠿ arrastrar** (mantener pulsado y soltar donde se quiera; una línea azul marca el sitio),
     **↑ ↓** mover, **✂ / 📋** cortar y pegar, **⧉** duplicar, **🗑** eliminar, **⤴** seleccionar lo que lo contiene y
     **＋** añadir algo nuevo al lado.
   - **Añadir**: el panel **«Añadir»** de la izquierda (en pantallas anchas; se arrastra un elemento a la página o
     se hace clic), los botones **«＋ Añadir en esta sección»** (al final de cada sección) y **«＋ Sección nueva
     aquí»** (entre secciones), o «＋ Añadir» en la barra de abajo. Se puede añadir texto, **cuadro de texto** (un
     recuadro libre con varios párrafos y listas), subtítulo, lista, foto, botón/enlace, **bloque** (un apartado con
     título dentro de la sección) o **sección nueva**.
   Las secciones nuevas reciben su enlace en el menú de arriba; al moverlas o borrarlas, el menú se reordena o pierde
   ese enlace solo.
4. Fotos: botón **«Cambiar foto»** sobre cada foto (se reducen solas a 1800 px). **«Quitar»** la oculta.
5. Apuntes: botón **«Subir PDF»** junto a cada tema (máximo 3 MB por archivo).
6. Cada **texto** existe en español y en inglés y se cambia en cada idioma por separado: con **ES / EN** de la
   cabecera se elige la versión que se edita. **Todo lo demás es común a los dos idiomas**: las fotos, el orden, y
   los bloques, secciones y elementos que se añaden, mueven, duplican o eliminan (un texto y su traducción siempre
   van juntos). Lo nuevo aparece en los dos idiomas con un texto provisional que hay que cambiar en cada uno. Un
   botón nuevo empieza con el mismo texto en los dos idiomas; un enlace dentro de una frase pertenece a esa frase, así
   que hay que ponerlo también en la frase del otro idioma.
7. **Deshacer**: «↶ Deshacer» / «↷ Rehacer» en la barra de abajo (o Ctrl/⌘ + Z y Ctrl/⌘ + Shift + Z) deshacen
   cualquier cambio desde que se abrió la página: escribir, formato, mover o arrastrar, añadir, eliminar y fotos.
   Para quitar una sección entera está el botón **«🗑 Eliminar esta sección»** al final de cada sección (quita también
   su enlace del menú). Al entrar en modo edición aparece un aviso de que los textos se cambian en cada idioma por
   separado, y la barra lo recuerda en amarillo mientras se edita.
8. **Guardar**. La barra dice «Publicando…» unos 30–60 segundos y luego «Publicado ✓»: hasta entonces, recargar la
   página muestra todavía la versión anterior (no es que no se haya guardado). Si algo sale mal:
   **Historial → Restaurar** vuelve a poner el contenido de una versión anterior.

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
| `GITHUB_BRANCH` | La rama de producción de Vercel: `main` (valor por defecto). |

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

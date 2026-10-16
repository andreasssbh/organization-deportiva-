# Sport Management · organizaciondeportiva.org — sitio modernizado

Rediseño del sitio [organizaciondeportiva.org](https://organizaciondeportiva.org/) (Joomla, 2015) como una
**única página estática** (`index.html`), sin dependencias externas, responsive, con tema **rojo / blanco / negro**
(modo claro: blanco y rojo con texto negro; modo oscuro: negro y rojo con texto blanco), **selector de idioma Español / English**, huecos para fotos y
contacto directo con el **Dr. Víctor Jiménez Díaz-Benito**.

## Uso

Abre `index.html` en cualquier navegador o sírvelo desde cualquier hosting estático (GitHub Pages, Netlify, Vercel…).
No hay build ni dependencias.

## Cómo funciona el bilingüismo

Cada bloque de texto existe dos veces en el HTML, con las clases `.es` y `.en`.
El atributo `data-lang` de `<html>` decide cuál se ve (CSS):

```css
html[data-lang="es"] .en { display: none !important; }
html[data-lang="en"] .es { display: none !important; }
```

El botón **ES | EN** de la cabecera cambia el atributo, actualiza `<html lang>` y el `<title>`, y guarda la
preferencia en `localStorage`. El idioma inicial es el guardado o, si no hay, el del navegador.

Para añadir o corregir un texto: edita el `<span class="es">…</span><span class="en">…</span>` correspondiente.

## Fotos

Cada `<figure class="photo" data-src="images/…">` es un hueco para una foto: se guarda el archivo en `images/` con
el nombre indicado y aparece solo, con su leyenda bilingüe. **Si el archivo no existe, el hueco se oculta** y no
deja ningún rastro en la página (ni marcadores ni columnas vacías). Hay diez fotos colocadas —portada, apuntes,
docencia, grupo, retrato del director y cinco en la galería— y dos huecos libres (`prodet.jpg`, `la-finta.jpg`).
La lista completa de nombres, proporciones y contenidos está en [`images/README.md`](images/README.md).

## Apuntes (PDF)

La sección `#apuntes` es la principal del sitio: cinco temas con un botón «PDF». Guarda `apuntes/tema-N.pdf` y el
botón se activa solo (ver [`apuntes/README.md`](apuntes/README.md)).

## Marca

No hay logo de la Universidad Europea (el sitio no es una web oficial de la universidad). La cabecera lleva un
distintivo «SM» en rojo, que también es el icono de la pestaña.

## Contacto: Víctor Jiménez

El correo `victor.jimenez@universidadeuropea.es` aparece en la ficha de "Nosotros", en tutorías, en PRODET® y en la
sección "Contacto". Para cambiarlo, buscar y reemplazar esa dirección en `index.html`.

## Editor del sitio (acceso de Víctor)

El Dr. Víctor Jiménez puede editar textos, fotos y PDF desde la propia web («Acceso editor», en el pie). Cada
«Guardar» crea un commit en GitHub y Vercel publica la nueva versión. Uso, configuración (variables de entorno en
Vercel) y funcionamiento en [`docs/EDITOR.md`](docs/EDITOR.md).

El sitio antiguo (Joomla) ya no existe: se han quitado todos los enlaces que llevaban a él (formulario de contacto,
registro, inicio de sesión y «Sitio original»).

## Correspondencia con el sitio original

Cada sección lleva un comentario `<!-- Origen: … -->` con la URL Joomla de la que procede.

| Sección nueva (`#ancla`) | Página original |
|---|---|
| `#inicio` | `/` — Sports Management (home) |
| `#nosotros`, `#victor` | `index.php?option=com_content&view=article&id=37&Itemid=197` — Nosotros |
| `#cursos` | `…&id=3&Itemid=159` — CURSOS / `…&id=3&Itemid=189` — Ordenación Jurídica 1º CAFYD (UCJC 2015-2022) |
| `#tutorias` | `…&id=23&Itemid=186` y `…&id=44&Itemid=211` — Organización del Deporte |
| `#apuntes` (sección destacada, con PDF por tema) | `…&id=6&Itemid=162` — Apuntes |
| `#prodet` | `…&id=25&Itemid=188` — PRODET® |
| `#grupos` | `…&id=14&Itemid=171` — Research groups |
| `#reviews` | `…&id=13&Itemid=168` — Recent reviews |
| `#motricidad` | `…&id=18&Itemid=173` — Ciencia y Motricidad Humana |
| `#bibliografia` | `…&id=11&Itemid=167` — Bibliography |
| `#revistas` | `…&id=19&Itemid=176` — Scientific Journals of Sport Management |
| `#bases` | `…&id=34&Itemid=196` — Electronic data bases in Sports Sciences |
| `#postgrado` | `…&id=16&Itemid=172` — Postgraduate courses |
| `#enlaces` | `…&id=12&Itemid=169` — Sports Management Links |
| `#ranking` | `…&id=46&Itemid=214` — Ranking facultades Ciencias del Deporte (ShanghaiRanking 2022) |
| `#galeria` | (nuevo) galería de fotos |
| `#media` | `…&id=41&Itemid=203` — Media & Management (La Finta) |
| `#contacto` | `index.php?option=com_mailto…` (contacto) y `index.php?option=com_users&view=registration` (registro) |

## Estado del contenido — pendiente de cotejo

Durante la reconstrucción **no fue posible descargar el sitio original** (dominio bloqueado por la política de red
del entorno de trabajo). La estructura y los textos se reconstruyeron a partir de los resúmenes indexados de cada
página, por lo que:

- Los textos son fieles en fondo pero **no son copia literal**; hay que contrastarlos con el original.
- Las listas largas (bibliografía completa, enlaces, revistas, postgrados, miembros) pueden estar **incompletas**.
- Las URL de los enlaces externos son las canónicas de cada organismo; conviene verificarlas contra las del sitio.

Mientras dure la revisión, la página muestra un aviso en la cabecera. Para retirarlo, pon
`SHOW_VERIFY_NOTICE = false` en el `<script>` final de `index.html` (o borra el bloque `#verifyNotice`).

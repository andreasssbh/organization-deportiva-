# Fotos del sitio

Cada hueco de foto de `index.html` es un `<figure class="photo" data-src="images/…">`. La página carga el archivo
indicado: **si existe se muestra con su leyenda; si no existe, el hueco se oculta** y no deja ningún rastro en la
página. Para cambiar una foto basta con sustituir el archivo conservando el nombre, o usar «Cambiar foto» desde el editor del sitio (ver [`docs/EDITOR.md`](../docs/EDITOR.md)).

Formato recomendado: JPG, ≤ 500 KB por foto.

## Fotos colocadas

| Archivo | Dónde aparece | Proporción | Contenido actual |
|---|---|---|---|
| `hero.jpg` | Portada, columna derecha | vertical 4:5 | Bannière EOSE — «Linking employment and education in sport» |
| `apuntes.jpg` | Sección **Apuntes**, junto al manual de referencia | 4:3 | Clase: «La organización privada» |
| `docencia.jpg` | Sección **Docencia**, tarjeta «Cursos» | 4:3 | Sesión con estudiantes en el aula |
| `grupo.jpg` | Sección **Nosotros**, tarjeta «El grupo» | panorámica 16:7 | El grupo en la Universidad Europea de Madrid |
| `victor-jimenez.jpg` | Sección **Nosotros**, ficha del director | vertical 4:5 | Retrato del Dr. Víctor Jiménez Díaz-Benito |
| `galeria-1.jpg` | Galería | 4:3 | Asamblea General y Seminario de Miembros de EOSE 2025 |
| `galeria-2.jpg` | Galería | 4:3 | Encuentro de la red EOSE |
| `galeria-3.jpg` | Galería | 4:3 | Congreso Iberoamericano de Economía del Deporte |
| `galeria-4.jpg` | Galería | 4:3 | Encuentro sobre la profesión de la Educación Física y Deportiva |
| `galeria-5.jpg` | Galería | 4:3 | Seminario sobre cualificaciones profesionales en el deporte |

## Huecos libres (ocultos hasta que exista el archivo)

| Archivo | Dónde aparecería | Proporción |
|---|---|---|
| `prodet.jpg` | Tarjeta PRODET® (sección Investigación) | panorámica 16:7 |
| `la-finta.jpg` | Media & Management (La Finta) | 4:3 |

## Añadir más fotos a la galería

Copiar en `index.html` (sección `#galeria`) un bloque como este, con el nombre del nuevo archivo y su leyenda:

```html
<figure class="photo" data-src="images/galeria-6.jpg"><img alt="" loading="lazy" decoding="async">
  <figcaption><span class="es">Leyenda en español</span><span class="en">Caption in English</span></figcaption>
</figure>
```

La galería es una rejilla justificada: se reparte sola y la última fila llena el ancho, cualquiera que sea el número
de fotos.

# PEAK — Landing

Landing estática de PEAK (exportada de Claude Design). No necesita build: `index.html` + `support.js` + assets en `uploads/`. Cada push a `main` se publica en Vercel.

## Actualizar precios y stock

En `index.html`, buscá el comentario `// ── Datos editables: actualizá precios y stock acá ──` y editá el array `PRODUCTS`:

```js
{ name: 'Creatina Star Nutrition', flavors: ['Sin sabor'], description: '...', price: 25500, image: 'creatina-star.jpg', stock: true },
```

- `price`: número entero en pesos, **sin** `$` ni puntos (se formatea solo como `$25.500`).
- `stock`: `true` = "Pedir"; `false` = muestra "Sin stock" y el botón pasa a "encargue".
- `image`: ruta relativa a la foto (por ejemplo `uploads/creatina-star.jpg`). Si falta, se muestra el nombre del producto.
- Para agregar un producto, copiá una línea y cambiá los valores; para sacarlo, borrá la línea.

- `hidden: true`: oculta la card sin borrarla (sacalo para volver a mostrarla).

En el mismo bloque están:

- `WA_NUMBER`: el único lugar con el número de WhatsApp (formato `549...`, sin `+`).
- `MSG_GENERAL`, `MSG_ENCARGUE`, `msgProducto`, `msgSinStock`: los textos que se precargan en WhatsApp.
- `SHOW_VENTAS` / `SHOW_FAQ`: muestran u ocultan "Ya están rindiendo" y "Preguntas" (`true` / `false`).
- `FAQS` y `MARQUEE`.

## Analytics

Usa Vercel Web Analytics. Hay que activarlo en Vercel (Project → Analytics → Enable). Cada click a WhatsApp manda el evento `click_whatsapp` con `origen` (`producto`, `hero`, `nav`, `flotante`, `encargue`, `cta`) y `producto`. Los eventos personalizados requieren el plan Pro de Vercel.

Después:

```bash
git add index.html && git commit -m "Actualizar precios" && git push
```

## Ver local

```bash
npx serve .
```

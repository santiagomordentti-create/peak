# PEAK — Landing

Landing estática de PEAK (exportada de Claude Design). No necesita build: `index.html` + `support.js` + assets en `uploads/`. Cada push a `main` se publica en Vercel.

## Actualizar precios y stock

En `index.html`, buscá el comentario `// ── Datos editables: actualizá precios y stock acá ──` y editá el array `PRODUCTS`:

```js
{ name: 'Creatina Star Nutrition', flavors: ['Sin sabor'], description: '...', price: 25500, image: 'uploads/creatina-star.webp', alt: 'Bolsa de Creatina Star Nutrition…', stock: true },
```

- `price`: número entero en pesos, **sin** `$` ni puntos (se formatea solo como `$25.500`).
- `stock`: `true` = "Pedir"; `false` = muestra "Sin stock" y el botón pasa a "encargue".
- `image`: ruta a la foto en `uploads/` (WebP, máx. 1000px de lado, < 200 KB), por ejemplo `uploads/creatina-star.webp`. Se muestra entera (`contain`). Si falta, se ve "PEAK." en su lugar.
- `alt`: descripción de la foto, por ejemplo "Pote de Whey Protein ENA sabor vainilla y chocolate".
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

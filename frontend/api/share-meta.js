export default async function handler(req, res) {
  try {
  const slug = (req.query.slug || '').toString();
  const site = 'https://www.radioconexionlatam.net.pe';
  const api = 'https://api.radioconexionlatam.net.pe';
  // La URL final puede ajustarse si encontramos un slug canónico diferente
  let canonicalSlug = slug;
  const twitterCard = process.env.TWITTER_CARD || 'summary';

    // Traer la noticia desde el backend público
    let noticia = null;
    try {
      const r = await fetch(`${api}/api/noticias/slug/${encodeURIComponent(slug)}`);
      if (r.ok) {
        noticia = await r.json();
      }
    } catch {}
    // Fallback: si no existe ese slug en BD, intentar buscar por título normalizado
    if (!noticia) {
      try {
        const r2 = await fetch(`${api}/api/noticias/?limite=200`);
        if (r2.ok) {
          const list = await r2.json();
          const found = Array.isArray(list) ? list.find(n => (n.slug && n.slug === slug) || slugify(n.titulo) === slug) : null;
          if (found) noticia = found;
        }
      } catch {}
    }
    if (noticia?.slug) {
      canonicalSlug = noticia.slug;
    }

    const title = noticia?.titulo ? `${noticia.titulo} | Radio Conexión Latam` : 'Radio Conexión Latam';
    const description = trimText(noticia?.resumen || 'Noticias, música y cultura para Latinoamérica.', 200);
    const image = (noticia?.imagen || '').startsWith('http')
      ? noticia?.imagen
      : (noticia?.imagen ? `${api}${noticia.imagen}` : `${site}/logo.jpg`);
    const imageSecure = image?.startsWith('http') ? image.replace(/^http:/, 'https:') : `${site}/logo.jpg`;
    const published = noticia?.fecha ? new Date(noticia.fecha).toISOString() : undefined;
    const section = noticia?.categoria || undefined;
    const tags = Array.isArray(noticia?.tags) ? noticia.tags.slice(0, 6) : [];

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${site}/noticia/${encodeURIComponent(canonicalSlug)}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imageSecure}" />
  <meta property="og:image:secure_url" content="${imageSecure}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${site}/noticia/${encodeURIComponent(canonicalSlug)}" />
  <meta property="og:site_name" content="Radio Conexión Latam" />
  <meta property="og:locale" content="es_LA" />
  <meta property="og:updated_time" content="${new Date().toISOString()}" />
  ${published ? `<meta property="article:published_time" content="${published}" />` : ''}
  ${section ? `<meta property="article:section" content="${escapeHtml(section)}" />` : ''}
  ${tags.map(t => `<meta property="article:tag" content="${escapeHtml(String(t))}" />`).join('\n  ')}

  <meta name="twitter:card" content="${twitterCard}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageSecure}" />

  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: [image],
    datePublished: published,
    dateModified: published,
    publisher: { '@type': 'Organization', name: 'Radio Conexión Latam', logo: { '@type': 'ImageObject', url: `${site}/logo.jpg` } },
    description,
  mainEntityOfPage: `${site}/noticia/${encodeURIComponent(canonicalSlug)}`,
  })}</script>
</head>
<body>
  <noscript>
    <meta http-equiv="refresh" content="0; url=${site}/noticia/${encodeURIComponent(canonicalSlug)}" />
    <p>Si no eres red social, abre la noticia aquí: <a href="${site}/noticia/${encodeURIComponent(canonicalSlug)}">${site}/noticia/${encodeURIComponent(canonicalSlug)}</a></p>
  </noscript>
  <script>location.replace(${JSON.stringify(`${site}/noticia/${encodeURIComponent(canonicalSlug)}`)});</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (e) {
    res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"><title>Radio Conexión Latam</title></head><body>Redirigiendo…<script>location.replace('https://www.radioconexionlatam.net.pe');</script></body></html>`);
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function trimText(str, max = 200) {
  const s = String(str || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[áäàâã]/g, 'a')
    .replace(/[éëèê]/g, 'e')
    .replace(/[íïìî]/g, 'i')
    .replace(/[óöòôõ]/g, 'o')
    .replace(/[úüùû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

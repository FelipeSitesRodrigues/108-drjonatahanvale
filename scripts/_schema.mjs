// JSON-LD do escritório (LegalService + Attorney) e das perguntas (FAQPage), puxado pelo build.
import * as cheerio from 'cheerio'

export function schemaAdvocacia(html, cfg) {
  const base = (cfg.dominio || '').replace(/\/$/, '')
  const escritorio = {
    '@type': ['LegalService', 'Attorney'],
    '@id': `${base}/#escritorio`,
    name: 'Jonathan Vale Advocacia e Consultoria Jurídica',
    legalName: 'Jonathan Vale - Sociedade Individual de Advocacia',
    taxID: '63.073.404/0001-25',
    description: cfg.descricao,
    telephone: `+${cfg.whatsapp}`,
    email: cfg.email,
    image: `${base}/assets/img/og.jpg`,
    logo: `${base}/icon-512.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida Getúlio Vargas, 322, Centro',
      addressLocality: 'Tumiritinga',
      addressRegion: 'MG',
      addressCountry: 'BR',
    },
    areaServed: [{ '@type': 'City', name: 'Tumiritinga' }, { '@type': 'AdministrativeArea', name: 'Vale do Rio Doce, MG' }],
    hasMap: cfg.mapa,
    founder: { '@type': 'Person', name: 'Jonathan Eduardo Pires da Silva Vale', jobTitle: 'Advogado' },
    knowsAbout: ['Direito Trabalhista', 'Direito Previdenciário', 'INSS', 'Aposentadoria', 'BPC/LOAS', 'Direito de Família', 'Divórcio', 'Pensão alimentícia', 'Guarda', 'Lei Maria da Penha', 'Medida protetiva'],
    knowsLanguage: 'pt-BR',
  }
  if (base) escritorio.url = `${base}/`
  const $ = cheerio.load(html)
  const perguntas = $('#perguntas .pergunta')
    .map((_, d) => ({
      '@type': 'Question',
      name: $(d).find('.pergunta__q').text().replace(/^\s*\d+\.\s*/, '').replace(/\s+/g, ' ').trim(),
      acceptedAnswer: { '@type': 'Answer', text: $(d).find('.pergunta__r').text().replace(/\s+/g, ' ').trim() },
    }))
    .get()
    .filter((q) => q.name && q.acceptedAnswer.text)
  const grafo = [escritorio]
  if (perguntas.length) grafo.push({ '@type': 'FAQPage', '@id': `${base}/#perguntas`, mainEntity: perguntas })
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })}</script>`
}

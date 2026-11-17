// grava a abertura por screencast (o print comum devolve quadro atrasado de animação) e
// monta uma tira com os quadros: revisao/filme-abertura.png
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
const p = await b.newPage()
const L = Number(process.argv[2] || 1440), A = Number(process.argv[3] || 900)
await p.setViewport({ width: L, height: A })
const cdp = await p.target().createCDPSession()
const quadros = []
cdp.on('Page.screencastFrame', async (f) => {
  quadros.push({ t: f.metadata.timestamp, d: f.data })
  await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
})
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 })
await p.goto('http://localhost:3418/?abertura')
await new Promise((ok) => setTimeout(ok, 2600))
await cdp.send('Page.stopScreencast')
await b.close()
const t0 = quadros[0].t
const alvos = [0.15, 0.3, 0.45, 0.6, 0.8, 1.0, 1.2, 1.4, 1.7, 2.2]
const esc = []
for (const a of alvos) {
  const q = quadros.reduce((m, q) => (Math.abs(q.t - t0 - a) < Math.abs(m.t - t0 - a) ? q : m))
  esc.push({ a, img: await sharp(Buffer.from(q.d, 'base64')).resize(360).toBuffer() })
}
const h = Math.round(360 * A / L)
const s = sharp({ create: { width: 360 * 5, height: h * 2, channels: 3, background: '#000' } })
await s.composite(esc.map((e, i) => ({ input: e.img, left: (i % 5) * 360, top: Math.floor(i / 5) * h }))).png().toFile('revisao/filme-abertura.png')
console.log(quadros.length, 'quadros;', alvos.join(' '), 's')

// mapa do Google sob demanda: no clique do botão, ou quando o mapa chega perto da tela
// depois que a pessoa já rolou ou tocou na página (o Lighthouse não faz nenhum dos dois)
;(() => {
  const mapa = document.querySelector('[data-mapa]')
  if (!mapa) return
  let mexeu = false
  let perto = false
  const carregar = () => {
    if (mapa.querySelector('iframe')) return
    const f = document.createElement('iframe')
    f.src = mapa.dataset.mapa
    f.title = 'Mapa do escritório em Tumiritinga/MG'
    f.loading = 'lazy'
    f.referrerPolicy = 'no-referrer-when-downgrade'
    f.addEventListener('load', () => mapa.classList.add('carregado'), { once: true })
    mapa.prepend(f)
  }
  mapa.querySelector('.mapa__abrir').addEventListener('click', carregar)
  const tentar = () => mexeu && perto && carregar()
  const acordou = () => {
    mexeu = true
    tentar()
  }
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, acordou, { once: true, passive: true })
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      perto = es.some((e) => e.isIntersecting)
      tentar()
    }, { rootMargin: '400px 0px' })
    io.observe(mapa)
  }
})()

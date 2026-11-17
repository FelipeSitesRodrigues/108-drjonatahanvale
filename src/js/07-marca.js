// marca d'água (monograma JV, 40 KB): o fundo só entra quando a seção chega perto da tela
;(() => {
  const marcas = document.querySelectorAll('[data-marca]')
  if (!('IntersectionObserver' in window)) return marcas.forEach((m) => m.classList.add('visivel'))
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue
      e.target.classList.add('visivel')
      io.unobserve(e.target)
    }
  }, { rootMargin: '300px 0px' })
  marcas.forEach((m) => io.observe(m))
})()

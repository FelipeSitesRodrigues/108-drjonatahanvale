// WhatsApp flutuante: só depois que o hero sai da tela
;(() => {
  const bt = document.querySelector('.flutuante')
  const hero = document.getElementById('inicio')
  if (!bt || !hero || !('IntersectionObserver' in window)) return bt && bt.classList.add('mostra')
  new IntersectionObserver(([e]) => bt.classList.toggle('mostra', !e.isIntersecting), { rootMargin: '-40% 0px 0px 0px' }).observe(hero)
})()

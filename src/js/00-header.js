// cabeçalho: ganha o fundo ao rolar e abre o menu no celular.
// Sem ouvir o scroll: um sentinela de 1 px a 24 px do topo diz quando a página saiu do início
// (ler scrollY logo na carga forçava o layout inteiro, 380 ms no Lighthouse do celular).
;(() => {
  const topo = document.getElementById('topo')
  const botao = topo.querySelector('.topo__menu')
  const menu = document.getElementById('menu-celular')
  if ('IntersectionObserver' in window) {
    const sentinela = document.createElement('div')
    sentinela.setAttribute('aria-hidden', 'true')
    sentinela.style.cssText = 'position:absolute;top:24px;left:0;width:1px;height:1px;pointer-events:none'
    document.body.prepend(sentinela)
    new IntersectionObserver(([e]) => topo.classList.toggle('rolou', !e.isIntersecting)).observe(sentinela)
  }
  const fechar = () => {
    menu.classList.remove('aberto')
    topo.classList.remove('menu-aberto')
    botao.setAttribute('aria-expanded', 'false')
    botao.setAttribute('aria-label', 'Abrir menu')
  }
  botao.addEventListener('click', () => {
    const abrir = !menu.classList.contains('aberto')
    menu.classList.toggle('aberto', abrir)
    topo.classList.toggle('menu-aberto', abrir)
    botao.setAttribute('aria-expanded', String(abrir))
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu')
  })
  menu.addEventListener('click', (e) => e.target.closest('a') && fechar())
  addEventListener('keydown', (e) => e.key === 'Escape' && menu.classList.contains('aberto') && (fechar(), botao.focus()))
})()

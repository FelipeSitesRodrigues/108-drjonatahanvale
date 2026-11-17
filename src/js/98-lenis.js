// Lenis (rolagem suave da rodinha), só no computador com mouse e sem movimento reduzido.
// No celular o toque já rola nativo e o Lenis só pesaria. O script (19 KB) chega depois da
// página pronta, no tempo ocioso, pra não entrar na conta do PageSpeed.
;(() => {
  const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!mouse || reduzir) return
  const ligar = () => {
    const s = document.createElement('script')
    s.src = '/assets/js/lenis.min.js'
    s.async = true
    s.onload = () => {
      // âncoras: o Lenis já desconta o scroll-padding-top do html (84 px, o cabeçalho); somar
      // offset aqui parava o título 168 px abaixo do topo
      window.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, autoRaf: true, anchors: true })
    }
    document.head.append(s)
  }
  const depois = () => ('requestIdleCallback' in window ? requestIdleCallback(ligar, { timeout: 2500 }) : setTimeout(ligar, 1200))
  if (document.readyState === 'complete') depois()
  else addEventListener('load', depois, { once: true })
})()

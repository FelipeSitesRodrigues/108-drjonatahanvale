// perguntas: uma aberta por vez
;(() => {
  const lista = document.getElementById('perguntas')
  if (!lista) return
  lista.addEventListener('click', (e) => {
    const q = e.target.closest('.pergunta__q')
    if (!q) return
    const item = q.parentElement
    const abrir = !item.classList.contains('aberta')
    for (const outro of lista.querySelectorAll('.pergunta.aberta')) {
      outro.classList.remove('aberta')
      outro.querySelector('.pergunta__q').setAttribute('aria-expanded', 'false')
    }
    if (abrir) {
      item.classList.add('aberta')
      q.setAttribute('aria-expanded', 'true')
    }
  })
})()

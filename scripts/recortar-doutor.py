"""
Recorta o Dr. Jonathan do fundo cinza liso (foto gerada no ChatGPT em 2026-11-16).
Só calcula a transparência e tira o cinza que ficou misturado na borda: o rosto não é tocado.

Como: a cor do fundo é estimada ponto a ponto (o cinza tem vinheta), a transparência sai da
distância de cada pixel até esse fundo e a cor da borda é "desmisturada" (cor = fundo +
(pixel - fundo) / alfa), senão o cabelo ficaria com um halo cinza no azul do site.

Uso: python scripts/recortar-doutor.py
Saída: insumos/doutor-recorte.png e insumos/doutor-conferir.png (sobre o marinho, pra olhar).
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as nd

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ.parent / '0108 - Jonathan Vale' / 'Recursos Site' / 'doutor-fundo-cinza.png'
SAIDA = RAIZ / 'insumos'
SAIDA.mkdir(exist_ok=True)

img = np.asarray(Image.open(ORIGEM).convert('RGB')).astype(np.float32)
h, w, _ = img.shape

# 1. fundo global pela borda e máscara grosseira
borda = np.concatenate([img[:8].reshape(-1, 3), img[:, :8].reshape(-1, 3), img[:, -8:].reshape(-1, 3)])
bg0 = np.median(borda, axis=0)
d0 = np.linalg.norm(img - bg0, axis=2)
fg = d0 > 38
fg = nd.binary_opening(fg, iterations=2)
rot, n = nd.label(fg)
maior = np.argmax(np.bincount(rot.ravel())[1:]) + 1
fg = nd.binary_fill_holes(rot == maior)

# 2. fundo local: média do cinza ao redor (convolução normalizada), cobre a vinheta
so_fundo = (~nd.binary_dilation(fg, iterations=12)).astype(np.float32)
sig = 45
peso = nd.gaussian_filter(so_fundo, sig)
bg = np.stack([nd.gaussian_filter(img[..., c] * so_fundo, sig) for c in range(3)], axis=2) / np.maximum(peso, 1e-4)[..., None]
bg[peso < 1e-3] = bg0

# 3. alfa pela distância até o fundo local, só na faixa da borda
d = np.linalg.norm(img - bg, axis=2)
T0, T1 = 9.0, 46.0
alfa = np.clip((d - T0) / (T1 - T0), 0, 1)
dentro = nd.binary_erosion(fg, iterations=5)
fora = ~nd.binary_dilation(fg, iterations=5)
alfa[dentro] = 1
alfa[fora] = 0
alfa = nd.gaussian_filter(alfa, 0.6)
alfa[dentro] = 1

# 4. desmistura da cor na borda
a = np.maximum(alfa, 1e-3)[..., None]
cor = np.where(a > 0.04, bg + (img - bg) / a, img)
cor = np.clip(cor, 0, 255)
cor[dentro] = img[dentro]  # miolo intocado (rosto incluído)

rgba = np.dstack([cor, alfa * 255]).round().astype(np.uint8)
rgba[alfa < 0.004] = 0  # sem cor escondida no transparente (memória png-recorte-cor-escondida)
Image.fromarray(rgba, 'RGBA').save(SAIDA / 'doutor-recorte.png')

marinho = np.zeros_like(img); marinho[:] = (10, 20, 36)
mix = cor * alfa[..., None] + marinho * (1 - alfa[..., None])
Image.fromarray(mix.round().astype(np.uint8)).save(SAIDA / 'doutor-conferir.png')
ys, xs = np.where(alfa > 0.02)
print('ok', w, h, 'caixa', xs.min(), ys.min(), xs.max(), ys.max())

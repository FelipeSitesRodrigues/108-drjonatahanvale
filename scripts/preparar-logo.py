"""
Monograma JV da logo (dourado sobre preto) com fundo transparente: o alfa sai do brilho
(o canal mais forte) e a cor é desmisturada do preto (cor / alfa), pra o brilho dourado
ficar certo sobre o marinho. Corta só o símbolo (linhas 0 a 400 da logo de 649x606).
Uso: python scripts/preparar-logo.py  ->  insumos/monograma.png
"""
from pathlib import Path
import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
LOGO = RAIZ.parent / '0108 - Jonathan Vale' / 'Recursos Site' / 'logo-jonathan-vale.png'
im = np.asarray(Image.open(LOGO).convert('RGB')).astype(np.float32)[0:402]
alfa = np.clip((im.max(axis=2) - 14) / (255 - 14), 0, 1) ** 0.85
cor = np.clip(im / np.maximum(alfa, 1e-3)[..., None], 0, 255)
rgba = np.dstack([cor, alfa * 255]).round().astype(np.uint8)
rgba[alfa < 0.01] = 0
ys, xs = np.where(alfa > 0.03)
rgba = rgba[max(ys.min() - 4, 0):ys.max() + 5, max(xs.min() - 4, 0):xs.max() + 5]
Image.fromarray(rgba, 'RGBA').save(RAIZ / 'insumos' / 'monograma.png')
print('ok', rgba.shape)

# ---------------------------------------------------------------- logo inteira pra abertura
# Mesmo tratamento (alfa pelo brilho, cor desmisturada do preto), recortada na caixa do
# conteúdo: colunas 16 a 636 e linhas 9 a 572 da logo de 649x606 -> 621x564. A abertura usa
# essa imagem uma vez só, repetida em 7 <img> com recortes diferentes (clip-path parado).
im = np.asarray(Image.open(LOGO).convert('RGB')).astype(np.float32)[9:573, 16:637]
alfa = np.clip((im.max(axis=2) - 14) / (255 - 14), 0, 1) ** 0.85
cor = np.clip(im / np.maximum(alfa, 1e-3)[..., None], 0, 255)
rgba = np.dstack([cor, alfa * 255]).round().astype(np.uint8)
rgba[alfa < 0.01] = 0
Image.fromarray(rgba, 'RGBA').save(RAIZ / 'insumos' / 'logo-inteira.png')
print('ok logo inteira', rgba.shape)

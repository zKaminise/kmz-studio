# Assets reais e processamento

## Origem e preservação

- Cinco mockups aprovados do `Kit_KMZ_Studio_Site_Codex.zip`: Acquagyn, Alçar Humà, BRASA, Odontologia FL e Salon 2Beauté ADN. Todos têm **1122 × 1402 px**.
- Identidade oficial do `KMZ_Studio_Kit_Logos.zip` localizado em Downloads: horizontal transparente, símbolo, favicon e demais versões preservadas.
- Capturas do portfólio anterior em `LP Gabriel Kaminise/kaminise/src/assets`, associadas pelos dados reais de `src/data/projects.ts`. Referências externas `portfolio-ref-*`, imagens de serviços e marcas antigas não foram incluídas.
- BKM TCG: duas capturas reais da homepage pública `https://lojabkm.com.br/`, em diferentes estágios da animação existente, obtidas durante esta implementação; 1265 × 712 px. Nenhum produto ou interface foi redesenhado.
- Clube das Zizas: captura desktop real de `https://clube-zizas.vercel.app/`, 1905 × 938 px, além da captura completa preservada do projeto anterior. Os elementos comerciais visíveis são parte da página original capturada.
- Os masters estão em `assets/originals/mockups`, `assets/originals/screenshots` e `assets/originals/brand`. Não são publicados por Astro.
- O vídeo de referência permanece somente em `work/kit/referencias/animacao-peak-referencia.mp4`; não está em `public/`.

## Saídas de produção

- `public/images/projects/{slug}-{width}.webp`: tamanhos responsivos, preservando proporção e conteúdo integral. Todas as dez imagens principais incluem versões **320 e 480 px** para celulares e miniaturas. Mockups: 320, 480, 640, 1000 e 1122 px. Capturas desktop: 320, 480, 640, 1000 e 1600 px, limitados à resolução nativa. BKM: 320, 480, 640, 1000 e 1265 px.
- `public/images/projects/{slug}-screen-{width}.webp`: capturas reais da abertura dos projetos quando disponíveis.
- `public/images/projects/full-{slug}.webp`: capturas completas do projeto anterior, sem corte ou distorção. São registros da versão documentada no portfólio anterior; o site publicado pode ter evoluído.
- `public/images/brand/logo-horizontal.webp`: **480 × 76 px**, WebP qualidade 90 para a dimensão de exibição do cabeçalho; foi removido somente o espaço transparente externo do original. Monograma e assinatura preservados; master integral guardado.
- `public/images/brand/symbol.webp`: **600 × 213 px**, também com remoção exclusiva do padding transparente.
- `public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png`: derivados dos arquivos oficiais.
- `public/og-image.png` e `.webp`: composição da logo real e três mockups reais sobre grafite; nenhuma nova tela foi criada.
- `src/data/project-images.json`: metadados consumíveis pela UI, com `width`, `height`, `src`, `srcSet` e `gallery` (origem, dimensões e texto alternativo).
- `public/images/asset-manifest.json`: inventário técnico dos arquivos gerados, dimensões e tamanhos, sem caminhos absolutos da máquina.

## Galerias

| Projeto | Imagens reais disponíveis |
| --- | --- |
| Acquagyn | Mockup aprovado, abertura e captura completa do portfólio anterior |
| Alçar Humà | Mockup aprovado, abertura e captura completa |
| BRASA | Mockup aprovado e abertura |
| Odontologia FL | Mockup aprovado, abertura e captura completa |
| Salon 2Beauté ADN | Mockup aprovado e abertura |
| Leandro Kaminise | Abertura e captura completa |
| Clube das Zizas | Abertura desktop atual e captura completa preservada |
| Saldanha Móveis | Abertura e captura completa |
| Ecos da Alma | Abertura e captura completa |
| BKM TCG | Duas etapas reais da animação publicada |

## Reprodução

Executar `python scripts/prepare-assets.py` com Pillow instalado. O script usa primeiro os masters preservados; os caminhos do kit e do projeto anterior são apenas fallback para a extração inicial. A exportação usa WebP qualidade 88, sem upscaling, sem reenquadrar as telas e sem alterar proporções. A galeria longa usa qualidade 90.

## Referência de movimento

O vídeo foi inspecionado em frames extraídos com FFmpeg, guardados somente em `work/frames/`. O trecho relevante mostra continuidade sobre fundo escuro: título à esquerda e elementos de produto à direita deixam o viewport com o scroll nativo; uma introdução centralizada e espaçosa antecede dois projetos grandes com alturas alternadas. A adaptação indicada é continuidade visual, revelação gradual e profundidade leve, sem reproduzir a identidade Peak nem publicar seu vídeo.

Não foram geradas telas, versões mobile, retratos ou imagens de clientes com IA. As versões de telefone existentes nos mockups são parte dos arquivos aprovados pelo proprietário.

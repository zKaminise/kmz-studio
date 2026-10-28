# Abertura KMZ Studio

A referência `2026-10-27 20-51-16.mp4` mostra logo central em contorno, preenchimento e painel escuro subindo para revelar a hero. Depois, o scroll nativo conduz ao título centralizado dos projetos e aos cards alternados. A versão anterior da KMZ só possuía reveals e parallax discretos.

## Sequência implementada

1. Contorno extraído da transparência da logo oficial por filtro SVG, sem redesenhar o monograma.
2. Preenchimento com o asset original prata/tangerina.
3. Cortina grafite subindo junto da marca em cerca de 1,8 segundo.
4. Título, apoio, CTAs e dois mockups reais entrando em sequência, acomodados até aproximadamente 2,4 segundos.
5. Scroll nativo até a introdução centralizada “Projetos selecionados” e os cards grandes.

O efeito está ativo em celular, tablet e desktop. No celular, as distâncias e a duração da cortina são menores; a sequência permanece completa. Não há pinning longo, cursor obrigatório, espera por imagem/API ou progresso de carregamento fictício.

## Controles e fallback

- “Pular abertura”, Escape, Tab, wheel e touchmove interrompem a abertura sem impedir a navegação.
- “Rever abertura” repete a sequência.
- Preferência de movimento reduzido do sistema ou do visitante desativa a abertura e o parallax.
- Sem JavaScript, o HTML segue disponível. Um bootstrap pequeno habilita a cortina antes do primeiro paint e evita o flash da homepage.
- Falha ou atraso no chunk libera o conteúdo automaticamente. Restauração pelo histórico não repete a abertura.

## Arquivos e verificação

`Opening.tsx` contém marca/painel/controles; `intro.css` define a composição responsiva; `animate.ts` contém timeline e ScrollTrigger com cleanup; `index.html` contém o bootstrap.

72/72 verificações específicas passaram em 360, 390, 768, 1024, 1440 e 1920 px, sem erros de JavaScript/hidratação. Contorno e preenchimento foram inspecionados. Gravações reais desktop/mobile mostram a abertura e o scroll até os projetos. Consulte `QA-motion.md`; evidências em `work/qa-motion`, fora dos arquivos publicados.

Lighthouse mobile desta versão: 96 desempenho, 100 acessibilidade, 100 boas práticas e 100 SEO; LCP 2,6 s, CLS 0,001 e TBT 0 ms em laboratório local. As medidas anteriores 98/LCP 2,3 s pertencem à versão sem esta abertura. Resultados em campo variam conforme rede, aparelho e hospedagem.

Nenhuma tela de cliente ou versão de celular foi gerada ou modificada. O vídeo da referência não é publicado.

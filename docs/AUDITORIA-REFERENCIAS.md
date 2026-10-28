# Auditoria do projeto anterior e links

Verificação em 27/10/2026. Nenhum arquivo do projeto anterior foi alterado.

## Arquitetura encontrada

A pasta-alvo estava vazia. O código anterior foi localizado em `D:\Importante\Codex\LP Gabriel Kaminise\kaminise`: React 18, TypeScript, Vite 7, Framer Motion 12, GSAP 3/ScrollTrigger, Lenis e prerender próprio. O HTML publicado em `https://www.gabrielmisao.com.br/` referencia os bundles Vite e confirmou o conteúdo do repositório.

Conteúdo reaproveitável: dados reais de nove projetos, serviços, seis etapas do processo, FAQ, manifest de imagens responsivas, galeria e tratamento de movimento reduzido. O menu usa `<dialog>` nativo, fechamento por Escape e gerenciamento do overflow. O FAQ usa `<details>`, funcionando pelo teclado e sem animação obrigatória.

Técnicas de movimento reutilizáveis: `gsap.matchMedia`, contextos com `revert()` na desmontagem, `ScrollTrigger` com `invalidateOnRefresh`, revelação escalonada do título e wrappers separados para movimento por scroll e por ponteiro. O antigo hero expandia a composição durante 210svh; a nova experiência deve encurtar esse percurso e manter scroll nativo. Evitar copiar o cursor personalizado e a interceptação de rolagem do Lenis. O estado persistido de redução de movimento deve ganhar chave da marca nova.

## Referências

- Peak: HTML/CSS/JavaScript com TweenMax, Parallax, Splide e Swiper. `js/home.js` revela a transição por fade da arte de abertura, mudança gradual de fundo e entradas dos cases. Aproveitar a continuidade visual e o espaço editorial, sem copiar código, marca ou imagens. Não reproduzir o atraso do carregador Pace.
- Wuzi: site Wix. Referência limitada à hierarquia tipográfica e CTAs diretos. Não reutilizar números, avaliações, promessas de vendas ou alegações sobre equipe.

## URLs verificadas

Todos os endereços abaixo responderam HTTP 200 via requisição HTTPS. Isso confirma disponibilidade da página, não valida fluxos privados ou transações.

| Projeto | Endereço confirmado | Conteúdo observável |
|---|---|---|
| Alçar Humà | https://alcarhuma.com.br/ | Apresentação de governança, gestão de riscos e desenvolvimento humano. |
| Odontologia FL | https://www.odontologiafl.com.br/ | Página da Dra. Flávia Moreira, apresentação odontológica e contato. |
| BRASA | https://hamburgerlp.vercel.app/ | Landing page de hamburgueria; cardápio/processo e caminho para WhatsApp. |
| Acquagyn | https://www.acquagyn.com.br/ | Modalidades, metodologia, etapas de aprendizagem, estrutura real, FAQ e contato. O domínio sem www redireciona para este. |
| Leandro Kaminise | https://curso-leandro.vercel.app/ | Página “Agenda Cheia no Piloto Automático”. |
| Clube das Zizas | https://clube-zizas.vercel.app/ | Apresentação de comunidade de desenvolvimento pessoal feminino. |
| Saldanha Móveis | https://www.saldanhamoveis.com.br/ | Apresentação de móveis para espaços de beleza. O domínio sem www redireciona para este. |
| Ecos da Alma | https://ecosdaalma.app.br/ | Apresentação do livro, autodescoberta e informações para compra. |
| Salon 2Beauté ADN | https://salon2beauteadn.com.br/ | Serviços do salão e agendamento online; URL exata confirmada também em `src/data/projects.ts` do projeto anterior. |
| BKM TCG | https://lojabkm.com.br/ | Experiência de abertura de booster 3D, busca, navegação por cartas/lacrados/coleções e carrinho. URL confirmada pelo canonical e README do repositório real `LP Vendas TCG Site`. |

A loja BKM informa que a seleção de produtos está sendo preparada. Não alegar estoque disponível, vendas realizadas ou checkout comercial validado. O case pode descrever a interface e os recursos implementados observáveis.

## Imagens reais adicionais

Além dos cinco mockups fornecidos no ZIP, o projeto anterior contém imagens reais para Leandro Kaminise (`portfolio-2` / `case-03`), Clube das Zizas (`case-04`), Saldanha Móveis (`portfolio-7` / `case-06`) e Ecos da Alma (`portfolio-3` / `case-07`). As imagens denominadas `portfolio-ref-*` pertencem ao arquivo de referências visuais e não devem aparecer como trabalhos da KMZ.

Duas capturas desktop do site BKM publicado foram feitas no navegador, preservando sua aparência real, com 1265×712 pixels: `work/bkm-tcg-screen.png` (abertura) e `work/bkm-tcg-reveal.png` (terceira etapa, carta Pikachu). São fontes reais para as variantes WebP; nenhuma versão mobile foi inventada.

## Limite da auditoria

Não foram feitas compras, logins, alterações de DNS, envios de mensagens ou modificações nos sites externos. Respostas comerciais e métricas não foram inferidas dos layouts.

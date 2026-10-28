# QA da abertura e movimento

Execução: 28 de outubro de 2026 às 00:55:50 (São Paulo). Build local em http://127.0.0.1:4175.

72/72 verificações passaram. 0 falhas.

## Escopo

- Chromium em 360, 390, 768, 1024, 1440 e 1920 px.
- Trace desde antes do primeiro paint: presença da intro, painel subindo e liberação da página.
- Título, CTA, overflow e scroll nativo.
- Capturas desktop e celular em 100, 450, 900, 1200, 1600 e 2300 ms após replay.
- Pular por botão, Escape e wheel; replay.
- Movimento reduzido do sistema e preferência manual; página sem JavaScript; case sem intro.
- Vídeos reais do navegador com abertura e scroll para os projetos.

## Falhas

Nenhuma falha nas verificações executadas.

## Console

Nenhum erro de JavaScript ou hidratação.

Nenhum aviso de navegador.

## Evidências

Capturas, traces e gravações: `work/qa-motion`. As gravações mostram a interface real, sem geração ou modificação das telas dos projetos.

- kmz-intro-desktop.webm: 1440×1000
- kmz-intro-mobile.webm: 390×844

Este teste verifica comportamento local. Não afirma métricas de usuários reais nem valida envio de e-mail.

## Smoke WebKit em celular

Executado separadamente em WebKit com viewport de 390 × 844 px: **8/8 verificações passaram**, sem erros de JavaScript ou hidratação.

- A intro passou de `pending` para `playing` e `done`.
- O filtro SVG de contorno está aplicado e sua captura foi conferida visualmente: a marca aparece em contorno antes do preenchimento.
- A cortina termina, o hero permanece acessível e não há rolagem horizontal.
- O botão de replay reinicia e conclui a sequência.

Evidências adicionais: `work/qa-motion/webkit-report.json`, `webkit-mobile-logo-outline.png` e `webkit-mobile-complete.png`. O teste não substitui uma verificação física em todos os modelos de iPhone.

# Verificação de qualidade — KMZ Studio

Data da entrega: 27 de outubro de 2026, horário de São Paulo.

## Código e publicação

`npm run validate` passou após as correções finais e atualização das dependências:

| Verificação                   | Resultado                                                    |
| ----------------------------- | ------------------------------------------------------------ |
| TypeScript estrito (`tsc -b`) | Passou                                                       |
| ESLint                        | Passou, sem avisos                                           |
| Testes Node do contato        | 13/13 passaram                                               |
| Vite build + pré-renderização | Passou; 17 páginas HTML                                      |
| Auditoria do build            | Passou; 10 cases, imagens locais, links internos e metadados |
| Sitemap                       | 16 URLs públicas; 404 excluído                               |
| `npm audit`                   | 0 vulnerabilidades após atualizações compatíveis             |

O build gera HTML independente por rota. A conferência verifica um H1 por página, títulos e descrições únicos, canonical no domínio correto, consistência de Open Graph/Twitter, JSON-LD, links e imagens existentes.

O preview foi corrigido para servir o HTML exato das URLs sem extensão. Isso evita a resposta da homepage para uma URL de case e permite verificar a hidratação de cada página corretamente. Caminhos inexistentes recebem status 404, conteúdo próprio e `noindex`. A Vercel utiliza os arquivos reais e `cleanUrls`, sem rewrite genérico para a homepage.

## Lighthouse medido

Lighthouse 12.8.2, navegação mobile com limitação simulada, build de produção servido localmente em `http://127.0.0.1:4174/`. Execução: 27/10/2026 às 21:20, horário de São Paulo.

| Categoria      | Nota |
| -------------- | ---: |
| Desempenho     |   98 |
| Acessibilidade |  100 |
| Boas práticas  |  100 |
| SEO            |  100 |

| Métrica de laboratório   | Valor |
| ------------------------ | ----: |
| First Contentful Paint   | 1,2 s |
| Largest Contentful Paint | 2,3 s |
| Cumulative Layout Shift  | 0,001 |
| Total Blocking Time      |  0 ms |

Os números pertencem a esta medição local. INP e Core Web Vitals de usuários reais precisam ser acompanhados após publicar. Uma nota de acessibilidade automática não cobre todas as situações; navegação por teclado e movimento reduzido também foram verificados no navegador.

Os achados da primeira medição foram corrigidos: fontes de leitura maiores, logo menor, variantes responsivas adicionais e reveals que preservam o contraste. As telas reais dos projetos não foram redesenhadas.

## Formulário

O endpoint foi testado com validação, origem, honeypot, limites, timeout, falhas do provedor e resposta confirmada simulada. A verificação no navegador exercita validação nativa, loading, sucesso com transporte simulado, erro sem credenciais e preservação dos campos. Os testes não enviaram e-mail real.

WhatsApp e e-mail usam os contatos autorizados. A ativação e verificação do recebimento por e-mail dependem de `RESEND_API_KEY` e de remetente verificado.

## Links e assets

Os dez URLs externos retornaram HTTP 200 na auditoria desta entrega. Salon e BKM foram confirmados também nos fontes locais e no conteúdo publicado. Isso verifica disponibilidade e identidade; não certifica todos os recursos ou a operação comercial dos sites externos.

Todos os dez cases utilizam 2–3 imagens reais. Masters, mockups e logos foram preservados. Os arquivos de referência e o vídeo não são publicados. Não há métricas comerciais, depoimentos ou pessoas inventados.

## Evidências de navegador

168/168 verificações de navegador passaram. Homepage em 360, 390, 768, 1024, 1440 e 1920 px; demais rotas em 390 e 1440 px. Nenhum erro inesperado de JavaScript ou hidratação. Também passaram menu/FAQ por teclado, filtros, campos e feedback de contato, preferência persistida e redução de movimento do sistema.

Consulte `QA-browser.md` para o resultado completo. Capturas e relatório estruturado ficam em `work/qa`, incluindo desktop, celular, cases, contato e movimento reduzido. Chromium e WebKit foram executados. Firefox possui limitação de inicialização neste ambiente.

## O que depende do proprietário

1. Configurar as credenciais de e-mail e o remetente verificado, para testar recebimento real do formulário.
2. Configurar futuramente o domínio próprio/DNS; a versão Vercel está publicada e foi verificada conforme `publicacao.md`.

Não há logo, mockup ou fotografia obrigatória ausente. Analytics é opcional e está desativado sem identificador. O site anterior e seu DNS permanecem preservados.

# QA de navegador

Execução local: 27/10/2026 23:48:02 (São Paulo). URL: http://127.0.0.1:4174.

168/168 verificações passaram. 0 falhas.

## Escopo

- Chromium: homepage em 360,390,768,1024,1440 e1920px; outras16 rotas em390 e1440px.
- Dez cases, portfólio e filtros, serviços, sobre, contato, privacidade e404.
- Menu por teclado/Escape, FAQ por teclado, links de contato, imagens e metadados.
- Formulário: validação nativa, erro usando handler real com ambiente vazio e transport bloqueado, preservação dos dados e alternativas. Sucesso e loading com resposta de rede simulada. Nenhum e-mail real foi enviado.
- Movimento reduzido por sistema e preferência manual persistida.
- Smoke Firefox/WebKit quando executáveis disponíveis.

## Falhas

Nenhuma falha nas verificações automatizadas.

## Respostas HTTP esperadas nos testes

- http://127.0.0.1:4174/pagina-inexistente: Failed to load resource: the server responded with a status of 404 (Not Found)
- http://127.0.0.1:4174/pagina-inexistente: Failed to load resource: the server responded with a status of 404 (Not Found)
- http://127.0.0.1:4174/contato?servico=sistemas-web&utm_source=qa-local&utm_medium=test&utm_campaign=verificacao: Failed to load resource: the server responded with a status of 503 (Service Unavailable)

As respostas404 correspondem ao teste de página inexistente;503 corresponde ao teste do formulário sem credenciais. Nenhum erro inesperado de JavaScript ou hidratação.

## Avisos de navegador

Nenhum.

## Outros navegadores

- firefox: indisponível — browserType.launch: spawn UNKNOWN
Call log:
[2m  - <launching> C:\Users\medab\AppData\Local\ms-playwright\firefox-1543\firefox\firefox.exe -no-remote -headless -profile C:\Users\medab\AppData\Local\Temp\playwright_firefoxdev_profile-sK97Sa -juggler-pipe -silent[22m

- webkit: executado

## Evidência

Capturas e relatório JSON: work/qa/. Os testes não medem Core Web Vitals de produção nem validam entrega de e-mail real.

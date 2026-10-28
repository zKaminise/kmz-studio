# Publicação na Vercel e GitHub

- Site público: https://kmz-studio.vercel.app
- Repositório: https://github.com/zKaminise/kmz-studio
- Branch de produção: `main`.
- Projeto Vercel: `kmz-studio`, conectado ao repositório GitHub.
- Framework: Vite; Node.js 22.x; build `npm run build`; saída `dist`.
- API publicada: `/api/contact`, função Node na região `iad1`.

## Verificação no endereço público

Sem autenticação ou bypass de proteção:

- As 16 rotas públicas responderam HTTP 200, com H1/títulos e canonical corretos.
- Duas rotas inexistentes responderam HTTP 404 e `noindex`.
- 79 assets responderam HTTP 200, incluindo mockups, fontes, ícones, CSS e os chunks JavaScript.
- Sitemap e robots responderam HTTP 200; sitemap contém 16 URLs.
- Headers de segurança e cache conferidos.
- `GET /api/contact` respondeu 405 JSON, com `Allow: POST`.
- Um POST técnico válido, usando a origem pública Vercel, respondeu 503 com feedback honesto de credenciais ausentes. Nenhum envio de e-mail foi confirmado ou simulado como real.

A validação local passou antes de publicar: typecheck, lint, 13 testes do backend, build e auditoria de 17 páginas HTML. O teste adicional do backend cobre os hosts Vercel confiáveis e rejeita uma origem externa.

O domínio canônico permanece `https://kmzstudio.com.br`, conforme o destino oficial do briefing. Sua conexão DNS será feita posteriormente. O domínio pessoal anterior permanece preservado.

## Configuração ainda necessária

Para ativar o formulário: `RESEND_API_KEY` e `CONTACT_FROM_EMAIL` de um domínio verificado. O destinatário inicial permanece `gabriel.misao08@gmail.com`. WhatsApp e mailto já estão configurados no site.

Credenciais, tokens OIDC, `.env.local`, `.vercel`, dependências e temporários não foram enviados ao GitHub. Masters autorizados e imagens otimizadas fazem parte do código; masters e materiais de referência não são publicados pela Vercel.

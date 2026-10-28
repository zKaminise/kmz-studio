# KMZ Studio

Implementação oficial preparada para `https://kmzstudio.com.br`, em `D:\Importante\Codex\LP KMZ Studio`.

## Publicação atual

- Site público: [kmz-studio.vercel.app](https://kmz-studio.vercel.app).
- Repositório: [zKaminise/kmz-studio](https://github.com/zKaminise/kmz-studio), branch `main`, conectado à Vercel.
- Configuração de hospedagem: Vite, Node.js 22.x, build `npm run build`, saída `dist` e função `/api/contact`.
- As 16 páginas públicas, 404, sitemap e assets foram verificados na hospedagem. Consulte `docs/publicacao.md`.
- O formulário depende das credenciais de envio abaixo. WhatsApp e links de e-mail já usam os contatos autorizados.

## Abertura e movimento

A homepage abre com a logo oficial em contorno, preenchimento prata/tangerina e uma cortina grafite que sobe para revelar o título e os mockups. A mesma sequência funciona no desktop e no celular, com distâncias adaptadas. O scroll continua nativo até a introdução centralizada dos projetos e seus cards alternados.

“Pular abertura”, Escape, Tab ou o primeiro gesto de scroll liberam a página imediatamente. “Rever abertura” repete a sequência. Movimento reduzido desliga a abertura; sem JavaScript, o conteúdo permanece disponível. O efeito usa o asset real da marca, sem redesenhá-la. Consulte `docs/motion.md` e `docs/QA-motion.md`.

## Rodar e verificar

Node.js 22.12+ e npm. A base foi instalada e testada com Node 22.20.

```powershell
cd 'D:\Importante\Codex\LP KMZ Studio'
npm ci
npm run dev
```

O servidor padrão abre em `http://127.0.0.1:8080`. Se a porta estiver ocupada, o Vite informa a próxima porta livre.

```powershell
npm run validate
npm run preview
```

`validate` executa typecheck, ESLint, testes do endpoint, build e auditoria dos arquivos publicados. `preview` serve o build e o endpoint de contato local, incluindo 404 correto. Não use o build apenas abrindo `index.html` pelo explorador de arquivos.

Para repetir a verificação em navegador, com Chrome instalado:

```powershell
$env:QA_URL='http://127.0.0.1:8080'
npm run qa:browser
```

`QA_CHROME` pode apontar para outro executável Chromium. As evidências ficam em `work/qa`. O teste simula a resposta de sucesso do provedor; não envia e-mail real.

Para o teste específico da abertura, use `npm run qa:motion` com `QA_URL` apontando ao preview. Ele confere as seis larguras, as fases da marca/cortina, replay, interrupção, redução de movimento e funcionamento sem JavaScript.

## Arquitetura entregue

- React 18 + TypeScript + Vite preservados do projeto anterior. Arquivos antigos não foram alterados.
- GSAP/ScrollTrigger em chunk separado. Reveals e profundidade discretos, scroll nativo e preferência de movimento reduzido do sistema e do visitante.
- Navegação por páginas reais, com HTML pré-renderizado para cada rota. O conteúdo principal existe sem JavaScript; menu compacto, filtros, animações e envio do formulário são aprimoramentos interativos.
- Tokens Grafite + Tangerina em `src/styles/site.css`. Componentes de navegação, CTA, projetos, galerias, FAQ, processo e formulário separados.
- Dados tipados em `src/data/projects.ts` e `src/data/site.ts`. Imagens em `src/data/project-images.json`.
- Endpoint independente `api/contact.mjs` para Vercel Functions, sem banco de dados ou CMS desnecessário.
- Canonical, title, description, Open Graph, Twitter, JSON-LD, sitemap e robots gerados no build. 404 com `noindex`.

## Rotas

| Página                | Caminho                                                                                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Início                | `/`                                                                                                                                                                                                                                                            |
| Portfólio com filtros | `/projetos`                                                                                                                                                                                                                                                    |
| Serviços              | `/servicos`                                                                                                                                                                                                                                                    |
| Empresa               | `/sobre`                                                                                                                                                                                                                                                       |
| Contato               | `/contato`                                                                                                                                                                                                                                                     |
| Privacidade           | `/privacidade`                                                                                                                                                                                                                                                 |
| Cases                 | `/projetos/acquagyn`, `/projetos/alcar-huma`, `/projetos/brasa`, `/projetos/salon-2-beaute`, `/projetos/bkm-tcg`, `/projetos/odontologia-fl`, `/projetos/leandro-kaminise`, `/projetos/clube-das-zizas`, `/projetos/saldanha-moveis`, `/projetos/ecos-da-alma` |
| Erro                  | `404.html`, servido automaticamente para URLs desconhecidas                                                                                                                                                                                                    |

## Conteúdo e assets

Os cinco mockups aprovados são usados integralmente, sem redesenhar telas, inventar versão mobile ou cortar o conteúdo. Foram acrescentadas capturas reais dos projetos anteriores e capturas desktop dos sites BKM/Zizas. Os dez cases possuem 2–3 imagens reais, com galerias de versões documentadas do projeto. Não há alegação de resultado comercial.

Logo horizontal, monograma e favicons vêm do kit verdadeiro da KMZ. Masters ficam em `assets/originals`, fora da publicação. WebP responsivo e versões menores são selecionados com `srcSet/sizes`. Vídeo Peak fica apenas em `work`, fora de `public` e da publicação. Consulte `docs/assets.md`.

## Contato: valores atuais e troca futura

O usuário autorizou inicialmente:

- E-mail: `gabriel.misao08@gmail.com`.
- WhatsApp: `5534998275292`.
- Instagram: `https://www.instagram.com/kmzstudio_/`.

Estes valores ficam centralizados em `src/data/site.ts`, com substituição por `VITE_CONTACT_EMAIL` e `VITE_WHATSAPP_NUMBER`. A troca de variáveis públicas requer novo build. Não reutilizamos outro número silenciosamente. Um número vazio desativa o link WhatsApp e direciona ao contato.

## Ativar envio real do formulário

Copie `.env.example` para `.env.local` apenas no ambiente local. Não versione segredos. Na Vercel, use **Settings → Environment Variables**.

| Variável               | Uso                                                                |
| ---------------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY`       | Chave de envio da sua conta Resend, somente servidor               |
| `CONTACT_FROM_EMAIL`   | Endereço de um domínio realmente verificado na Resend              |
| `CONTACT_TO_EMAIL`     | `gabriel.misao08@gmail.com` inicialmente, ou o destinatário futuro |
| `SITE_URL`             | `https://kmzstudio.com.br`                                         |
| `VITE_CONTACT_EMAIL`   | Contato público e links mailto                                     |
| `VITE_WHATSAPP_NUMBER` | Número completo com país, DDD e sem pontuação                      |
| `VITE_GA4_ID`          | Opcional; em branco mantém analytics desativado                    |

O Gmail informado é o destinatário, não um remetente validado na Resend. Configure e verifique o domínio do remetente antes de preencher `CONTACT_FROM_EMAIL`.

O formulário valida campos no cliente e servidor, consentimento, honeypot, tamanho e tempo de preenchimento. Possui estados de envio/sucesso/erro, timeout, limite básico por instância e validação de origem. Só mostra sucesso quando o provedor confirma com ID. Sem credenciais, retorna 503 honesto, mantém o texto e oferece WhatsApp/e-mail. A proteção em memória não é um limitador distribuído; um WAF/limite compartilhado pode ser configurado na hospedagem se necessário.

Após configurar, faça uma solicitação de teste no domínio publicado, confirme a resposta da API e o recebimento na caixa de destino. A entrega real não foi testada nesta implementação, pois não foram fornecidas credenciais.

## Publicar na Vercel

1. Importe esta pasta como projeto Vite. Comando: `npm run build`; saída: `dist`; Node: 22.x. O `vercel.json` já declara estas opções.
2. Configure as variáveis anteriores para os ambientes desejados. As funções `/api` são publicadas junto do build; publicar apenas `dist` em hospedagem estática não executa o formulário.
3. Gere um deployment de preview e revise navegação, cases, imagens, API e contato. A API aceita os hosts confiáveis fornecidos pela Vercel em `VERCEL_URL` e, na produção, `VERCEL_PROJECT_PRODUCTION_URL`, além do domínio configurado em `SITE_URL`.
4. Em **Settings → Domains**, adicione `kmzstudio.com.br` e `www.kmzstudio.com.br`. Use exatamente os registros DNS que a Vercel apresentar para este projeto. Não há registros fixos inventados nesta entrega. Preserve os registros MX/TXT do e-mail.
5. Defina `kmzstudio.com.br` como principal e redirecione `www` no painel. Confirme DNS, certificado HTTPS e acesso ao domínio final antes de alterar a versão anterior.
6. Reimplante após alterar variáveis de build. Verifique `/sitemap.xml`, os dez cases, um caminho inexistente e o envio de teste.

Alternativa por CLI, autenticado na sua conta: `npx vercel` para preview e `npx vercel --prod` para produção. O projeto está publicado no endereço Vercel acima. DNS e redirecionamentos do site anterior permanecem preservados.

## Analytics e privacidade

Sem ID configurado, nenhum analytics é carregado. Com GA4 válido, o script só carrega após consentimento; há opção de recusar e rever a escolha em Privacidade. Eventos previstos: orçamento, envio confirmado, visualização de case e clique externo. Não são enviados nomes, e-mails ou mensagens nesses eventos. UTM permanece na sessão e pode acompanhar o contato, conforme a política apresentada.

## Evidências e pendências

Auditoria anterior: `docs/auditoria-inicial.md` e `docs/AUDITORIA-REFERENCIAS.md`. Inventário de assets: `docs/assets.md`. Backend: `docs/contato.md`. Navegador e métricas: `docs/QA-browser.md` e `docs/QUALIDADE.md`.

Pendências do proprietário: credenciais de envio/remetente verificado e configuração futura do domínio próprio/DNS. Não há logo ou mockup obrigatório ausente.

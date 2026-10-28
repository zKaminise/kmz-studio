# Contato e envio de solicitações

O proprietário autorizou inicialmente `gabriel.misao08@gmail.com` e o WhatsApp Business `+55 34 99827-5292`. Esses contatos podem ser trocados na configuração pública do site. O número anterior não foi reutilizado sem autorização.

## Integração entregue

`POST /api/contact` é uma função Node para a Vercel. O site envia JSON com `name`, `email`, `phone` opcional, `service`, `message`, `consent: true`, honeypot `website` vazio e `startedAt` (timestamp em milissegundos da abertura do formulário). A origem de campanha opcional contém somente `utm.source`, `utm.medium` e `utm.campaign`, com limite de tamanho; o backend não coleta URL completa, cookies de analytics ou informações de navegação.

O servidor valida campos, consentimento, origem da requisição, tamanho real do corpo (16 KiB) e tempo de preenchimento (mínimo 1,5 segundo; formulário expira em 24 horas). Respostas distinguem validação, indisponibilidade, falha do provedor e confirmação. Somente uma resposta bem-sucedida da API Resend com um identificador de mensagem permite retornar `ok: true`. A confirmação significa que o provedor aceitou a mensagem; não comprova leitura nem chegada à caixa de entrada.

Não é permitido definir destinatário pelo navegador. O e-mail da pessoa fica em `reply_to`; a mensagem é texto simples para evitar HTML injetado. O token nunca é enviado ao cliente. O serviço possui timeout de dez segundos. O formulário deve preservar os campos após falhas e oferecer WhatsApp/e-mail como alternativa.

## Configuração real para publicação

1. Crie ou use uma conta Resend e verifique o domínio remetente que você controla.
2. Na Vercel, configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (endereço real do domínio verificado), `CONTACT_TO_EMAIL=gabriel.misao08@gmail.com` e `SITE_URL=https://kmzstudio.com.br`.
3. Use `.env.example` como referência; não versione credenciais. Nunca coloque variáveis privadas com prefixo `VITE_`.
4. Publique e faça um envio manual autorizado pelo formulário. Confira a mensagem recebida e a capacidade de responder à pessoa. Verifique também o fluxo de erro antes de substituir o contato em produção.

Sem as credenciais, a API retorna HTTP 503 com uma mensagem honesta de indisponibilidade. Nenhum envio real foi realizado durante a implementação. Os testes de sucesso usam um transporte simulado e não comprovam entrega de e-mail em produção.

O domínio principal e a variante `www` são aceitos como origem. Em deployments Vercel de preview/produção, o host confiável `VERCEL_URL` também é aceito; na produção, o alias do projeto em `VERCEL_PROJECT_PRODUCTION_URL` é aceito. Apenas hosts `*.vercel.app` fornecidos por essas variáveis da plataforma são liberados, sem confiar no header Host de quem envia. Em desenvolvimento, somente origens HTTP de loopback são liberadas adicionalmente. Se usar outro domínio próprio, atualize `SITE_URL`.

## Proteção contra abuso

Há honeypot, verificação de origem e um limite de cinco tentativas por IP a cada quinze minutos por instância. Os IPs são usados apenas como chaves temporárias em memória; o handler não grava logs do conteúdo dos leads. O limite em memória é básico: instâncias serverless diferentes não compartilham contagem e reinícios limpam esse estado. Antes de tráfego público relevante, configure também uma regra de rate limiting no Firewall/WAF da Vercel para `/api/contact` ou substitua o limitador por armazenamento compartilhado. O frontend não deve prometer proteção distribuída.

O Gmail é o destinatário inicial; isso não permite usá-lo automaticamente como remetente verificado na Resend. Não há senha de Gmail, SMTP pessoal nem acesso à conta de e-mail no código.

## Verificações

Execute `node --test tests/contact.test.mjs`. Os testes cobrem campos e consentimento, origem, método, formato, tamanho em UTF-8, honeypot, timestamp, ausência de configuração, destinatário fixo, origem de campanha, limite de tentativas, confirmação simulada e falhas do provedor. Nenhum teste envia e-mail.

Política de privacidade, dados publicados e eventual prazo de retenção precisam refletir a operação real: os leads ficam na caixa de e-mail configurada e no provedor de envio conforme as políticas dessas contas. Os contatos são usados para responder à solicitação; o consentimento do formulário não autoriza campanhas de marketing.

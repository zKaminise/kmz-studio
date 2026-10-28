# Migração de domínio

O projeto antigo em `D:/Importante/Codex/LP Gabriel Kaminise/kaminise` e o domínio `gabrielmisao.com.br` permanecem preservados.

Após publicar e verificar `kmzstudio.com.br`, o proprietário pode decidir se o domínio pessoal continua ativo ou se será migrado. Não foi instalado redirecionamento 301 nesta entrega.

O site anterior consultado apresenta uma homepage com âncoras. Mapeamento de conteúdo:

| Origem | Destino proposto |
| --- | --- |
| `/` | `https://kmzstudio.com.br/` |
| `/#projetos` | `/projetos` |
| `/#servicos` | `/servicos` |
| `/#sobre` | `/sobre` |
| `/#processo` | seção de processo na homepage/serviços |

Fragmentos `#...` não chegam ao servidor: não é possível criar 301 individual por fragmento. Revise links publicados externamente e, se necessário, preserve âncoras no conteúdo antes de decidir o redirecionamento da raiz. Outras URLs devem ser inventariadas no Search Console e nos logs reais, sem inventar páginas históricas.

Somente depois da decisão e com acesso autorizado à hospedagem antiga: aplicar os redirecionamentos aprovados, cadastrar sitemap novo, acompanhar cobertura/indexação e atualizar links oficiais. Não alterar DNS antes de validar domínio, HTTPS, formulários e comportamento do destino.

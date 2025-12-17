# Sistema OS ORÇAMENTOS-ESTOQUE - Refrigeração Campo Frio

Sistema completo para gerenciamento de orçamentos, ordens de serviço e estoque para empresas de refrigeração.

## Funcionalidades

### Clientes
- Cadastro completo de clientes (nome, CPF/CNPJ, telefone, email, endereço)
- Busca e filtros rápidos
- Edição e exclusão

### Orçamentos
- Criação de orçamentos com itens (peças e serviços)
- Cálculo automático de totais (peças, mão de obra, desconto)
- Definição de garantia e forma de pagamento
- Envio automático de email ao criar orçamento
- Aprovação de orçamento (gera OS automaticamente)
- Cancelamento com motivo
- Visualização e impressão

### Ordens de Serviço (OS)
- Criação direta ou a partir de orçamento aprovado
- Controle de status (Em Andamento, Concluída, Cancelada)
- Registro de técnico responsável
- Data prevista de conclusão
- Conclusão com observações
- Baixa automática no estoque ao concluir
- Envio de emails automáticos

### Estoque/Peças
- Cadastro de peças com código, nome, categoria
- Preço de custo e venda
- Controle de estoque atual e mínimo
- Alerta de estoque baixo
- Localização e fornecedor

### Sistema de Emails
- Templates personalizáveis para cada situação:
  - Orçamento Criado
  - Orçamento Aprovado
  - Serviço Concluído
  - Serviço Cancelado
- Variáveis dinâmicas nos templates
- Suporte a HTML

### Configurações
- Dados da empresa
- Prefixos de documentos
- Validade padrão do orçamento
- Garantia padrão
- Formas de pagamento

## Como Instalar

### Passo 1: Criar Projeto no Google Apps Script

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **Novo Projeto**
3. Renomeie o projeto para: `Sistema OS Refrigeração Campo Frio`

### Passo 2: Adicionar os Arquivos

1. **Code.gs** (já existe por padrão)
   - Apague todo o conteúdo existente
   - Cole o conteúdo do arquivo `Code.gs`

2. **Index.html**
   - Clique em **+** ao lado de "Arquivos"
   - Selecione **HTML**
   - Nomeie como `Index`
   - Cole o conteúdo do arquivo `Index.html`

3. **Styles.html**
   - Clique em **+** > **HTML**
   - Nomeie como `Styles`
   - Cole o conteúdo do arquivo `Styles.html`

4. **JavaScript.html**
   - Clique em **+** > **HTML**
   - Nomeie como `JavaScript`
   - Cole o conteúdo do arquivo `JavaScript.html`

### Passo 3: Implantar como Aplicativo Web

1. Clique em **Implantar** > **Nova implantação**
2. Clique na engrenagem e selecione **Aplicativo da web**
3. Configure:
   - **Descrição**: `Sistema OS Refrigeração Campo Frio`
   - **Executar como**: `Eu`
   - **Quem pode acessar**: `Qualquer pessoa` (ou conforme sua preferência)
4. Clique em **Implantar**
5. Autorize o aplicativo quando solicitado
6. Copie a URL gerada - este é o link do seu sistema!

### Passo 4: Primeira Execução

1. Acesse a URL do aplicativo
2. O sistema irá criar automaticamente:
   - A planilha de dados (`BD_REFRIGERACAO_CAMPO_FRIO`)
   - Todas as abas necessárias
   - Configurações padrão
   - Templates de email

## Fluxo de Trabalho

```
1. Cadastrar Cliente
       ↓
2. Criar Orçamento → Email enviado ao cliente
       ↓
3. Cliente Aprova → Orçamento vira OS + Email de aprovação
       ↓
4. Executar Serviço
       ↓
5. Concluir OS → Baixa no estoque + Email de conclusão
```

**Se o cliente cancelar em qualquer etapa:**
- Email de cancelamento é enviado automaticamente

## Variáveis Disponíveis nos Templates de Email

| Variável | Descrição |
|----------|-----------|
| `{NUMERO}` | Número do documento |
| `{CLIENTE_NOME}` | Nome do cliente |
| `{CLIENTE_EMAIL}` | Email do cliente |
| `{DATA_CRIACAO}` | Data de criação |
| `{DATA_VALIDADE}` | Validade do orçamento |
| `{DATA_PREVISTA}` | Data prevista de conclusão |
| `{DATA_CONCLUSAO}` | Data de conclusão |
| `{DESCRICAO}` | Descrição do serviço |
| `{TOTAL_PECAS}` | Total em peças |
| `{TOTAL_MAO_OBRA}` | Total de mão de obra |
| `{DESCONTO}` | Valor do desconto |
| `{TOTAL_GERAL}` | Valor total |
| `{GARANTIA}` | Prazo de garantia |
| `{FORMA_PAGAMENTO}` | Forma de pagamento |
| `{TECNICO}` | Técnico responsável |
| `{OBSERVACOES}` | Observações |
| `{EMPRESA_NOME}` | Nome da empresa |
| `{EMPRESA_TELEFONE}` | Telefone da empresa |
| `{MOTIVO_CANCELAMENTO}` | Motivo do cancelamento |

## Estrutura das Planilhas

O sistema cria automaticamente as seguintes abas:

- **Clientes**: Cadastro de clientes
- **Orcamentos**: Orçamentos criados
- **OrdensServico**: Ordens de serviço
- **Pecas**: Estoque de peças
- **ItensOrcamento**: Itens dos orçamentos
- **ItensOS**: Itens das OS
- **Configuracoes**: Configurações do sistema
- **EmailTemplates**: Templates de email
- **Historico**: Log de ações

## Suporte

Para dúvidas ou problemas, verifique:
1. Se todas as permissões foram concedidas
2. Se a planilha foi criada corretamente
3. Os logs em **Exibir** > **Registros de execução**

---

Desenvolvido para **Refrigeração Campo Frio**

/**
 * Sistema OS ORÇAMENTOS-ESTOQUE REFRIGERAÇÃO CAMPO FRIO
 * Desenvolvido para gerenciamento completo de orçamentos, ordens de serviço e estoque
 * @author Sistema Automatizado
 * @version 1.0.0
 */

// ==================== CONFIGURAÇÕES GLOBAIS ====================
const CONFIG = {
  SPREADSHEET_NAME: 'BD_REFRIGERACAO_CAMPO_FRIO',
  SHEETS: {
    CLIENTES: 'Clientes',
    ORCAMENTOS: 'Orcamentos',
    ORDEM_SERVICO: 'OrdensServico',
    PECAS: 'Pecas',
    ITENS_ORCAMENTO: 'ItensOrcamento',
    ITENS_OS: 'ItensOS',
    CONFIGURACOES: 'Configuracoes',
    EMAIL_TEMPLATES: 'EmailTemplates',
    HISTORICO: 'Historico'
  }
};

// ==================== FUNÇÕES DE INICIALIZAÇÃO ====================

/**
 * Função para servir a aplicação web
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Sistema OS ORÇAMENTOS - Refrigeração Campo Frio')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Inclui arquivos HTML externos
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Inicializa a planilha com todas as abas necessárias
 */
function inicializarSistema() {
  const ss = getOrCreateSpreadsheet();

  // Criar abas se não existirem
  createSheetIfNotExists(ss, CONFIG.SHEETS.CLIENTES, [
    'ID', 'Nome', 'CPF_CNPJ', 'Telefone', 'Email', 'Endereco', 'Cidade', 'Estado', 'CEP', 'Observacoes', 'DataCadastro', 'Ativo'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.ORCAMENTOS, [
    'ID', 'Numero', 'ClienteID', 'ClienteNome', 'ClienteEmail', 'DataCriacao', 'DataValidade', 'Status',
    'Descricao', 'TotalPecas', 'TotalMaoObra', 'Desconto', 'TotalGeral', 'Garantia', 'FormaPagamento',
    'Observacoes', 'MotivoCancel', 'DataAprovacao', 'DataCancel'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.ORDEM_SERVICO, [
    'ID', 'Numero', 'OrcamentoID', 'ClienteID', 'ClienteNome', 'ClienteEmail', 'DataCriacao', 'DataPrevista',
    'DataConclusao', 'Status', 'Descricao', 'TotalPecas', 'TotalMaoObra', 'Desconto', 'TotalGeral',
    'Garantia', 'FormaPagamento', 'Tecnico', 'Observacoes', 'ObsConclusao'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.PECAS, [
    'ID', 'Codigo', 'Nome', 'Descricao', 'Categoria', 'Unidade', 'PrecoCusto', 'PrecoVenda',
    'EstoqueAtual', 'EstoqueMinimo', 'Fornecedor', 'Localizacao', 'Ativo'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.ITENS_ORCAMENTO, [
    'ID', 'OrcamentoID', 'Tipo', 'PecaID', 'Descricao', 'Quantidade', 'PrecoUnitario', 'PrecoTotal'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.ITENS_OS, [
    'ID', 'OSID', 'Tipo', 'PecaID', 'Descricao', 'Quantidade', 'PrecoUnitario', 'PrecoTotal'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.CONFIGURACOES, [
    'Chave', 'Valor', 'Descricao'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.EMAIL_TEMPLATES, [
    'Tipo', 'Assunto', 'Corpo', 'Ativo'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEETS.HISTORICO, [
    'ID', 'DataHora', 'Tipo', 'RefID', 'Acao', 'Usuario', 'Detalhes'
  ]);

  // Inicializar configurações padrão
  inicializarConfiguracoesPadrao(ss);

  // Inicializar templates de email padrão
  inicializarEmailTemplates(ss);

  return { success: true, message: 'Sistema inicializado com sucesso!' };
}

/**
 * Obtém ou cria a planilha principal
 */
function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);

  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }

  const ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  return ss;
}

/**
 * Cria uma aba se não existir
 */
function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Inicializa configurações padrão
 */
function inicializarConfiguracoesPadrao(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIGURACOES);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) {
    const configPadrao = [
      ['EMPRESA_NOME', 'Refrigeração Campo Frio', 'Nome da empresa'],
      ['EMPRESA_TELEFONE', '(11) 99999-9999', 'Telefone da empresa'],
      ['EMPRESA_EMAIL', 'contato@campofrio.com.br', 'Email da empresa'],
      ['EMPRESA_ENDERECO', 'Rua Principal, 123 - Centro', 'Endereço da empresa'],
      ['EMPRESA_CNPJ', '00.000.000/0001-00', 'CNPJ da empresa'],
      ['GARANTIA_PADRAO', '90 dias', 'Garantia padrão dos serviços'],
      ['VALIDADE_ORCAMENTO', '15', 'Dias de validade do orçamento'],
      ['FORMAS_PAGAMENTO', 'Dinheiro, PIX, Cartão de Crédito, Cartão de Débito, Boleto, Transferência', 'Formas de pagamento aceitas'],
      ['PREFIXO_ORCAMENTO', 'ORC', 'Prefixo para numeração de orçamentos'],
      ['PREFIXO_OS', 'OS', 'Prefixo para numeração de OS']
    ];

    sheet.getRange(2, 1, configPadrao.length, 3).setValues(configPadrao);
  }
}

/**
 * Inicializa templates de email padrão
 */
function inicializarEmailTemplates(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_TEMPLATES);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) {
    const templates = [
      ['ORCAMENTO_CRIADO',
       'Orçamento #{NUMERO} - Refrigeração Campo Frio',
       `<h2>Olá {CLIENTE_NOME}!</h2>
<p>Seu orçamento foi criado com sucesso.</p>
<hr>
<h3>Detalhes do Orçamento #{NUMERO}</h3>
<p><strong>Data:</strong> {DATA_CRIACAO}</p>
<p><strong>Validade:</strong> {DATA_VALIDADE}</p>
<p><strong>Descrição:</strong> {DESCRICAO}</p>
<hr>
<h4>Valores:</h4>
<p>Peças: R$ {TOTAL_PECAS}</p>
<p>Mão de Obra: R$ {TOTAL_MAO_OBRA}</p>
<p>Desconto: R$ {DESCONTO}</p>
<p><strong>Total: R$ {TOTAL_GERAL}</strong></p>
<hr>
<p><strong>Garantia:</strong> {GARANTIA}</p>
<p><strong>Forma de Pagamento:</strong> {FORMA_PAGAMENTO}</p>
<hr>
<p>Para aprovar este orçamento, por favor entre em contato conosco.</p>
<p>Atenciosamente,<br>{EMPRESA_NOME}<br>{EMPRESA_TELEFONE}</p>`,
       'Sim'],

      ['ORCAMENTO_APROVADO',
       'Orçamento #{NUMERO} APROVADO - Ordem de Serviço #{OS_NUMERO} Criada',
       `<h2>Olá {CLIENTE_NOME}!</h2>
<p>Seu orçamento foi <strong style="color: green;">APROVADO</strong> com sucesso!</p>
<hr>
<h3>Ordem de Serviço #{OS_NUMERO}</h3>
<p><strong>Data de Criação:</strong> {DATA_CRIACAO}</p>
<p><strong>Previsão de Conclusão:</strong> {DATA_PREVISTA}</p>
<p><strong>Descrição:</strong> {DESCRICAO}</p>
<hr>
<h4>Valores:</h4>
<p>Peças: R$ {TOTAL_PECAS}</p>
<p>Mão de Obra: R$ {TOTAL_MAO_OBRA}</p>
<p>Desconto: R$ {DESCONTO}</p>
<p><strong>Total: R$ {TOTAL_GERAL}</strong></p>
<hr>
<p><strong>Garantia:</strong> {GARANTIA}</p>
<p><strong>Forma de Pagamento:</strong> {FORMA_PAGAMENTO}</p>
<hr>
<p>Em breve nossa equipe técnica entrará em contato para agendar o serviço.</p>
<p>Atenciosamente,<br>{EMPRESA_NOME}<br>{EMPRESA_TELEFONE}</p>`,
       'Sim'],

      ['SERVICO_CONCLUIDO',
       'Serviço Concluído - OS #{NUMERO} - Refrigeração Campo Frio',
       `<h2>Olá {CLIENTE_NOME}!</h2>
<p>Temos o prazer de informar que seu serviço foi <strong style="color: green;">CONCLUÍDO</strong> com sucesso!</p>
<hr>
<h3>Detalhes da Ordem de Serviço #{NUMERO}</h3>
<p><strong>Data de Conclusão:</strong> {DATA_CONCLUSAO}</p>
<p><strong>Técnico Responsável:</strong> {TECNICO}</p>
<p><strong>Descrição:</strong> {DESCRICAO}</p>
<hr>
<h4>Valores:</h4>
<p>Peças: R$ {TOTAL_PECAS}</p>
<p>Mão de Obra: R$ {TOTAL_MAO_OBRA}</p>
<p>Desconto: R$ {DESCONTO}</p>
<p><strong>Total: R$ {TOTAL_GERAL}</strong></p>
<hr>
<p><strong>Garantia:</strong> {GARANTIA}</p>
<p><strong>Observações:</strong> {OBSERVACOES_CONCLUSAO}</p>
<hr>
<p>Agradecemos pela preferência!</p>
<p>Atenciosamente,<br>{EMPRESA_NOME}<br>{EMPRESA_TELEFONE}</p>`,
       'Sim'],

      ['SERVICO_CANCELADO',
       'Serviço Cancelado - #{NUMERO} - Refrigeração Campo Frio',
       `<h2>Olá {CLIENTE_NOME}!</h2>
<p>Informamos que seu orçamento/serviço foi <strong style="color: red;">CANCELADO</strong>.</p>
<hr>
<h3>Detalhes</h3>
<p><strong>Número:</strong> #{NUMERO}</p>
<p><strong>Data do Cancelamento:</strong> {DATA_CANCELAMENTO}</p>
<p><strong>Motivo:</strong> {MOTIVO_CANCELAMENTO}</p>
<hr>
<p>Caso tenha alguma dúvida, entre em contato conosco.</p>
<p>Atenciosamente,<br>{EMPRESA_NOME}<br>{EMPRESA_TELEFONE}</p>`,
       'Sim']
    ];

    sheet.getRange(2, 1, templates.length, 4).setValues(templates);
  }
}

// ==================== FUNÇÕES DE CLIENTES ====================

/**
 * Obtém todos os clientes
 */
function getClientes() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const clientes = [];

  for (let i = 1; i < dados.length; i++) {
    const cliente = {};
    headers.forEach((header, index) => {
      cliente[header] = dados[i][index];
    });
    if (cliente.Ativo !== 'Não') {
      clientes.push(cliente);
    }
  }

  return clientes;
}

/**
 * Obtém um cliente pelo ID
 */
function getClienteById(id) {
  const clientes = getClientes();
  return clientes.find(c => c.ID == id) || null;
}

/**
 * Salva um cliente (novo ou atualização)
 */
function salvarCliente(dados) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);

  if (dados.ID) {
    // Atualizar cliente existente
    const dataRange = sheet.getDataRange();
    const valores = dataRange.getValues();

    for (let i = 1; i < valores.length; i++) {
      if (valores[i][0] == dados.ID) {
        sheet.getRange(i + 1, 2, 1, 10).setValues([[
          dados.Nome, dados.CPF_CNPJ, dados.Telefone, dados.Email, dados.Endereco,
          dados.Cidade, dados.Estado, dados.CEP, dados.Observacoes, dados.DataCadastro
        ]]);
        break;
      }
    }

    registrarHistorico('CLIENTE', dados.ID, 'ATUALIZADO', JSON.stringify(dados));
    return { success: true, message: 'Cliente atualizado com sucesso!' };
  } else {
    // Novo cliente
    const novoId = gerarNovoId(sheet);
    const dataAtual = formatarData(new Date());

    sheet.appendRow([
      novoId, dados.Nome, dados.CPF_CNPJ, dados.Telefone, dados.Email, dados.Endereco,
      dados.Cidade, dados.Estado, dados.CEP, dados.Observacoes, dataAtual, 'Sim'
    ]);

    registrarHistorico('CLIENTE', novoId, 'CRIADO', JSON.stringify(dados));
    return { success: true, message: 'Cliente cadastrado com sucesso!', id: novoId };
  }
}

/**
 * Exclui um cliente (soft delete)
 */
function excluirCliente(id) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
  const dataRange = sheet.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] == id) {
      sheet.getRange(i + 1, 12).setValue('Não');
      registrarHistorico('CLIENTE', id, 'EXCLUIDO', '');
      return { success: true, message: 'Cliente excluído com sucesso!' };
    }
  }

  return { success: false, message: 'Cliente não encontrado!' };
}

// ==================== FUNÇÕES DE ORÇAMENTOS ====================

/**
 * Obtém todos os orçamentos
 */
function getOrcamentos() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORCAMENTOS);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const orcamentos = [];

  for (let i = 1; i < dados.length; i++) {
    const orcamento = {};
    headers.forEach((header, index) => {
      orcamento[header] = dados[i][index];
    });
    orcamentos.push(orcamento);
  }

  return orcamentos.reverse();
}

/**
 * Obtém um orçamento pelo ID
 */
function getOrcamentoById(id) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORCAMENTOS);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return null;

  const headers = dados[0];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] == id) {
      const orcamento = {};
      headers.forEach((header, index) => {
        orcamento[header] = dados[i][index];
      });

      // Obter itens do orçamento
      orcamento.Itens = getItensOrcamento(id);

      return orcamento;
    }
  }

  return null;
}

/**
 * Obtém itens de um orçamento
 */
function getItensOrcamento(orcamentoId) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ITENS_ORCAMENTO);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const itens = [];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][1] == orcamentoId) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = dados[i][index];
      });
      itens.push(item);
    }
  }

  return itens;
}

/**
 * Salva um orçamento
 */
function salvarOrcamento(dados) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORCAMENTOS);
  const config = getConfiguracoes();

  if (dados.ID) {
    // Atualizar orçamento existente
    const dataRange = sheet.getDataRange();
    const valores = dataRange.getValues();

    for (let i = 1; i < valores.length; i++) {
      if (valores[i][0] == dados.ID) {
        sheet.getRange(i + 1, 9, 1, 8).setValues([[
          dados.Descricao, dados.TotalPecas, dados.TotalMaoObra, dados.Desconto,
          dados.TotalGeral, dados.Garantia, dados.FormaPagamento, dados.Observacoes
        ]]);
        break;
      }
    }

    // Atualizar itens
    salvarItensOrcamento(dados.ID, dados.Itens);

    registrarHistorico('ORCAMENTO', dados.ID, 'ATUALIZADO', JSON.stringify(dados));
    return { success: true, message: 'Orçamento atualizado com sucesso!' };
  } else {
    // Novo orçamento
    const novoId = gerarNovoId(sheet);
    const numero = gerarNumeroDocumento(sheet, config.PREFIXO_ORCAMENTO || 'ORC');
    const dataAtual = formatarData(new Date());
    const dataValidade = formatarData(new Date(Date.now() + (parseInt(config.VALIDADE_ORCAMENTO || 15) * 24 * 60 * 60 * 1000)));

    // Obter dados do cliente
    const cliente = getClienteById(dados.ClienteID);

    sheet.appendRow([
      novoId, numero, dados.ClienteID, cliente ? cliente.Nome : '', cliente ? cliente.Email : '',
      dataAtual, dataValidade, 'Pendente', dados.Descricao, dados.TotalPecas, dados.TotalMaoObra,
      dados.Desconto, dados.TotalGeral, dados.Garantia || config.GARANTIA_PADRAO, dados.FormaPagamento,
      dados.Observacoes, '', '', ''
    ]);

    // Salvar itens
    if (dados.Itens && dados.Itens.length > 0) {
      salvarItensOrcamento(novoId, dados.Itens);
    }

    registrarHistorico('ORCAMENTO', novoId, 'CRIADO', JSON.stringify(dados));

    // Enviar email se configurado
    if (cliente && cliente.Email && dados.enviarEmail !== false) {
      enviarEmailOrcamentoCriado(novoId);
    }

    return { success: true, message: 'Orçamento criado com sucesso!', id: novoId, numero: numero };
  }
}

/**
 * Salva itens de um orçamento
 */
function salvarItensOrcamento(orcamentoId, itens) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ITENS_ORCAMENTO);

  // Remover itens antigos
  const dados = sheet.getDataRange().getValues();
  for (let i = dados.length - 1; i >= 1; i--) {
    if (dados[i][1] == orcamentoId) {
      sheet.deleteRow(i + 1);
    }
  }

  // Adicionar novos itens
  if (itens && itens.length > 0) {
    itens.forEach((item, index) => {
      const itemId = gerarNovoId(sheet);
      sheet.appendRow([
        itemId, orcamentoId, item.Tipo, item.PecaID || '', item.Descricao,
        item.Quantidade, item.PrecoUnitario, item.PrecoTotal
      ]);
    });
  }
}

/**
 * Aprova um orçamento e cria ordem de serviço
 */
function aprovarOrcamento(orcamentoId, dataPrevista) {
  const ss = getOrCreateSpreadsheet();
  const sheetOrc = ss.getSheetByName(CONFIG.SHEETS.ORCAMENTOS);
  const orcamento = getOrcamentoById(orcamentoId);

  if (!orcamento) {
    return { success: false, message: 'Orçamento não encontrado!' };
  }

  if (orcamento.Status !== 'Pendente') {
    return { success: false, message: 'Este orçamento já foi processado!' };
  }

  // Atualizar status do orçamento
  const dataRange = sheetOrc.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] == orcamentoId) {
      sheetOrc.getRange(i + 1, 8).setValue('Aprovado');
      sheetOrc.getRange(i + 1, 18).setValue(formatarData(new Date()));
      break;
    }
  }

  // Criar ordem de serviço
  const osResult = criarOrdemServicoFromOrcamento(orcamento, dataPrevista);

  registrarHistorico('ORCAMENTO', orcamentoId, 'APROVADO', 'OS criada: ' + osResult.numero);

  // Enviar email de aprovação
  if (orcamento.ClienteEmail) {
    enviarEmailOrcamentoAprovado(orcamentoId, osResult.id);
  }

  return {
    success: true,
    message: 'Orçamento aprovado e Ordem de Serviço criada!',
    osId: osResult.id,
    osNumero: osResult.numero
  };
}

/**
 * Cancela um orçamento
 */
function cancelarOrcamento(orcamentoId, motivo) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORCAMENTOS);
  const orcamento = getOrcamentoById(orcamentoId);

  if (!orcamento) {
    return { success: false, message: 'Orçamento não encontrado!' };
  }

  const dataRange = sheet.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] == orcamentoId) {
      sheet.getRange(i + 1, 8).setValue('Cancelado');
      sheet.getRange(i + 1, 17).setValue(motivo);
      sheet.getRange(i + 1, 19).setValue(formatarData(new Date()));
      break;
    }
  }

  registrarHistorico('ORCAMENTO', orcamentoId, 'CANCELADO', motivo);

  // Enviar email de cancelamento
  if (orcamento.ClienteEmail) {
    enviarEmailCancelamento(orcamentoId, 'ORCAMENTO', motivo);
  }

  return { success: true, message: 'Orçamento cancelado com sucesso!' };
}

// ==================== FUNÇÕES DE ORDEM DE SERVIÇO ====================

/**
 * Obtém todas as ordens de serviço
 */
function getOrdensServico() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const ordensServico = [];

  for (let i = 1; i < dados.length; i++) {
    const os = {};
    headers.forEach((header, index) => {
      os[header] = dados[i][index];
    });
    ordensServico.push(os);
  }

  return ordensServico.reverse();
}

/**
 * Obtém uma OS pelo ID
 */
function getOrdemServicoById(id) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return null;

  const headers = dados[0];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] == id) {
      const os = {};
      headers.forEach((header, index) => {
        os[header] = dados[i][index];
      });

      // Obter itens da OS
      os.Itens = getItensOS(id);

      return os;
    }
  }

  return null;
}

/**
 * Obtém itens de uma OS
 */
function getItensOS(osId) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ITENS_OS);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const itens = [];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][1] == osId) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = dados[i][index];
      });
      itens.push(item);
    }
  }

  return itens;
}

/**
 * Cria OS a partir de um orçamento aprovado
 */
function criarOrdemServicoFromOrcamento(orcamento, dataPrevista) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const config = getConfiguracoes();

  const novoId = gerarNovoId(sheet);
  const numero = gerarNumeroDocumento(sheet, config.PREFIXO_OS || 'OS');
  const dataAtual = formatarData(new Date());

  sheet.appendRow([
    novoId, numero, orcamento.ID, orcamento.ClienteID, orcamento.ClienteNome, orcamento.ClienteEmail,
    dataAtual, dataPrevista || '', '', 'Em Andamento', orcamento.Descricao, orcamento.TotalPecas,
    orcamento.TotalMaoObra, orcamento.Desconto, orcamento.TotalGeral, orcamento.Garantia,
    orcamento.FormaPagamento, '', orcamento.Observacoes, ''
  ]);

  // Copiar itens do orçamento para a OS
  copiarItensParaOS(orcamento.ID, novoId);

  registrarHistorico('OS', novoId, 'CRIADA', 'Origem: Orçamento ' + orcamento.Numero);

  return { id: novoId, numero: numero };
}

/**
 * Cria OS diretamente (sem orçamento)
 */
function salvarOrdemServico(dados) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const config = getConfiguracoes();

  if (dados.ID) {
    // Atualizar OS existente
    const dataRange = sheet.getDataRange();
    const valores = dataRange.getValues();

    for (let i = 1; i < valores.length; i++) {
      if (valores[i][0] == dados.ID) {
        sheet.getRange(i + 1, 8, 1, 13).setValues([[
          dados.DataPrevista, valores[i][8], dados.Status, dados.Descricao, dados.TotalPecas,
          dados.TotalMaoObra, dados.Desconto, dados.TotalGeral, dados.Garantia, dados.FormaPagamento,
          dados.Tecnico, dados.Observacoes, dados.ObsConclusao
        ]]);
        break;
      }
    }

    // Atualizar itens
    salvarItensOS(dados.ID, dados.Itens);

    registrarHistorico('OS', dados.ID, 'ATUALIZADA', JSON.stringify(dados));
    return { success: true, message: 'Ordem de Serviço atualizada com sucesso!' };
  } else {
    // Nova OS
    const novoId = gerarNovoId(sheet);
    const numero = gerarNumeroDocumento(sheet, config.PREFIXO_OS || 'OS');
    const dataAtual = formatarData(new Date());

    // Obter dados do cliente
    const cliente = getClienteById(dados.ClienteID);

    sheet.appendRow([
      novoId, numero, '', dados.ClienteID, cliente ? cliente.Nome : '', cliente ? cliente.Email : '',
      dataAtual, dados.DataPrevista || '', '', 'Em Andamento', dados.Descricao, dados.TotalPecas,
      dados.TotalMaoObra, dados.Desconto, dados.TotalGeral, dados.Garantia || config.GARANTIA_PADRAO,
      dados.FormaPagamento, dados.Tecnico, dados.Observacoes, ''
    ]);

    // Salvar itens
    if (dados.Itens && dados.Itens.length > 0) {
      salvarItensOS(novoId, dados.Itens);
    }

    registrarHistorico('OS', novoId, 'CRIADA', JSON.stringify(dados));

    return { success: true, message: 'Ordem de Serviço criada com sucesso!', id: novoId, numero: numero };
  }
}

/**
 * Salva itens de uma OS
 */
function salvarItensOS(osId, itens) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ITENS_OS);

  // Remover itens antigos
  const dados = sheet.getDataRange().getValues();
  for (let i = dados.length - 1; i >= 1; i--) {
    if (dados[i][1] == osId) {
      sheet.deleteRow(i + 1);
    }
  }

  // Adicionar novos itens
  if (itens && itens.length > 0) {
    itens.forEach((item) => {
      const itemId = gerarNovoId(sheet);
      sheet.appendRow([
        itemId, osId, item.Tipo, item.PecaID || '', item.Descricao,
        item.Quantidade, item.PrecoUnitario, item.PrecoTotal
      ]);
    });
  }
}

/**
 * Copia itens do orçamento para a OS
 */
function copiarItensParaOS(orcamentoId, osId) {
  const itensOrc = getItensOrcamento(orcamentoId);
  salvarItensOS(osId, itensOrc);
}

/**
 * Conclui uma ordem de serviço
 */
function concluirOrdemServico(osId, obsConclusao) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const os = getOrdemServicoById(osId);

  if (!os) {
    return { success: false, message: 'Ordem de Serviço não encontrada!' };
  }

  const dataRange = sheet.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] == osId) {
      sheet.getRange(i + 1, 9).setValue(formatarData(new Date())); // DataConclusao
      sheet.getRange(i + 1, 10).setValue('Concluída'); // Status
      sheet.getRange(i + 1, 20).setValue(obsConclusao); // ObsConclusao
      break;
    }
  }

  // Dar baixa no estoque das peças
  darBaixaEstoque(osId);

  registrarHistorico('OS', osId, 'CONCLUIDA', obsConclusao);

  // Enviar email de conclusão
  if (os.ClienteEmail) {
    enviarEmailServicoConcluido(osId);
  }

  return { success: true, message: 'Serviço concluído com sucesso!' };
}

/**
 * Cancela uma ordem de serviço
 */
function cancelarOrdemServico(osId, motivo) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.ORDEM_SERVICO);
  const os = getOrdemServicoById(osId);

  if (!os) {
    return { success: false, message: 'Ordem de Serviço não encontrada!' };
  }

  const dataRange = sheet.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] == osId) {
      sheet.getRange(i + 1, 10).setValue('Cancelada'); // Status
      sheet.getRange(i + 1, 20).setValue('CANCELADO: ' + motivo); // ObsConclusao
      break;
    }
  }

  registrarHistorico('OS', osId, 'CANCELADA', motivo);

  // Enviar email de cancelamento
  if (os.ClienteEmail) {
    enviarEmailCancelamento(osId, 'OS', motivo);
  }

  return { success: true, message: 'Ordem de Serviço cancelada!' };
}

// ==================== FUNÇÕES DE PEÇAS/ESTOQUE ====================

/**
 * Obtém todas as peças
 */
function getPecas() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PECAS);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const headers = dados[0];
  const pecas = [];

  for (let i = 1; i < dados.length; i++) {
    const peca = {};
    headers.forEach((header, index) => {
      peca[header] = dados[i][index];
    });
    if (peca.Ativo !== 'Não') {
      pecas.push(peca);
    }
  }

  return pecas;
}

/**
 * Salva uma peça
 */
function salvarPeca(dados) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PECAS);

  if (dados.ID) {
    // Atualizar peça existente
    const dataRange = sheet.getDataRange();
    const valores = dataRange.getValues();

    for (let i = 1; i < valores.length; i++) {
      if (valores[i][0] == dados.ID) {
        sheet.getRange(i + 1, 2, 1, 11).setValues([[
          dados.Codigo, dados.Nome, dados.Descricao, dados.Categoria, dados.Unidade,
          dados.PrecoCusto, dados.PrecoVenda, dados.EstoqueAtual, dados.EstoqueMinimo,
          dados.Fornecedor, dados.Localizacao
        ]]);
        break;
      }
    }

    registrarHistorico('PECA', dados.ID, 'ATUALIZADA', JSON.stringify(dados));
    return { success: true, message: 'Peça atualizada com sucesso!' };
  } else {
    // Nova peça
    const novoId = gerarNovoId(sheet);

    sheet.appendRow([
      novoId, dados.Codigo, dados.Nome, dados.Descricao, dados.Categoria, dados.Unidade,
      dados.PrecoCusto, dados.PrecoVenda, dados.EstoqueAtual || 0, dados.EstoqueMinimo || 0,
      dados.Fornecedor, dados.Localizacao, 'Sim'
    ]);

    registrarHistorico('PECA', novoId, 'CRIADA', JSON.stringify(dados));
    return { success: true, message: 'Peça cadastrada com sucesso!', id: novoId };
  }
}

/**
 * Dá baixa no estoque após conclusão de OS
 */
function darBaixaEstoque(osId) {
  const itens = getItensOS(osId);
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PECAS);
  const dados = sheet.getDataRange().getValues();

  itens.forEach(item => {
    if (item.Tipo === 'Peca' && item.PecaID) {
      for (let i = 1; i < dados.length; i++) {
        if (dados[i][0] == item.PecaID) {
          const estoqueAtual = dados[i][8] || 0;
          const novoEstoque = Math.max(0, estoqueAtual - item.Quantidade);
          sheet.getRange(i + 1, 9).setValue(novoEstoque);

          registrarHistorico('ESTOQUE', item.PecaID, 'BAIXA',
            `OS ${osId}: -${item.Quantidade} unidades. Novo estoque: ${novoEstoque}`);
          break;
        }
      }
    }
  });
}

/**
 * Obtém peças com estoque baixo
 */
function getPecasEstoqueBaixo() {
  const pecas = getPecas();
  return pecas.filter(p => p.EstoqueAtual <= p.EstoqueMinimo);
}

// ==================== FUNÇÕES DE EMAIL ====================

/**
 * Envia email de orçamento criado
 */
function enviarEmailOrcamentoCriado(orcamentoId) {
  const orcamento = getOrcamentoById(orcamentoId);
  const config = getConfiguracoes();
  const template = getEmailTemplate('ORCAMENTO_CRIADO');

  if (!orcamento || !orcamento.ClienteEmail || !template) {
    return { success: false, message: 'Dados insuficientes para envio do email' };
  }

  const assunto = substituirVariaveis(template.Assunto, orcamento, config);
  const corpo = substituirVariaveis(template.Corpo, orcamento, config);

  try {
    MailApp.sendEmail({
      to: orcamento.ClienteEmail,
      subject: assunto,
      htmlBody: corpo,
      name: config.EMPRESA_NOME || 'Refrigeração Campo Frio'
    });

    registrarHistorico('EMAIL', orcamentoId, 'ORCAMENTO_CRIADO', 'Enviado para: ' + orcamento.ClienteEmail);
    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao enviar email: ' + e.message };
  }
}

/**
 * Envia email de orçamento aprovado
 */
function enviarEmailOrcamentoAprovado(orcamentoId, osId) {
  const orcamento = getOrcamentoById(orcamentoId);
  const os = getOrdemServicoById(osId);
  const config = getConfiguracoes();
  const template = getEmailTemplate('ORCAMENTO_APROVADO');

  if (!orcamento || !orcamento.ClienteEmail || !template) {
    return { success: false, message: 'Dados insuficientes para envio do email' };
  }

  // Merge de dados
  const dados = { ...orcamento, OS_NUMERO: os.Numero, DataPrevista: os.DataPrevista };

  const assunto = substituirVariaveis(template.Assunto, dados, config);
  const corpo = substituirVariaveis(template.Corpo, dados, config);

  try {
    MailApp.sendEmail({
      to: orcamento.ClienteEmail,
      subject: assunto,
      htmlBody: corpo,
      name: config.EMPRESA_NOME || 'Refrigeração Campo Frio'
    });

    registrarHistorico('EMAIL', orcamentoId, 'ORCAMENTO_APROVADO', 'Enviado para: ' + orcamento.ClienteEmail);
    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao enviar email: ' + e.message };
  }
}

/**
 * Envia email de serviço concluído
 */
function enviarEmailServicoConcluido(osId) {
  const os = getOrdemServicoById(osId);
  const config = getConfiguracoes();
  const template = getEmailTemplate('SERVICO_CONCLUIDO');

  if (!os || !os.ClienteEmail || !template) {
    return { success: false, message: 'Dados insuficientes para envio do email' };
  }

  const assunto = substituirVariaveis(template.Assunto, os, config);
  const corpo = substituirVariaveis(template.Corpo, os, config);

  try {
    MailApp.sendEmail({
      to: os.ClienteEmail,
      subject: assunto,
      htmlBody: corpo,
      name: config.EMPRESA_NOME || 'Refrigeração Campo Frio'
    });

    registrarHistorico('EMAIL', osId, 'SERVICO_CONCLUIDO', 'Enviado para: ' + os.ClienteEmail);
    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao enviar email: ' + e.message };
  }
}

/**
 * Envia email de cancelamento
 */
function enviarEmailCancelamento(id, tipo, motivo) {
  const dados = tipo === 'ORCAMENTO' ? getOrcamentoById(id) : getOrdemServicoById(id);
  const config = getConfiguracoes();
  const template = getEmailTemplate('SERVICO_CANCELADO');

  if (!dados || !dados.ClienteEmail || !template) {
    return { success: false, message: 'Dados insuficientes para envio do email' };
  }

  // Adicionar informações de cancelamento
  dados.MOTIVO_CANCELAMENTO = motivo;
  dados.DATA_CANCELAMENTO = formatarData(new Date());

  const assunto = substituirVariaveis(template.Assunto, dados, config);
  const corpo = substituirVariaveis(template.Corpo, dados, config);

  try {
    MailApp.sendEmail({
      to: dados.ClienteEmail,
      subject: assunto,
      htmlBody: corpo,
      name: config.EMPRESA_NOME || 'Refrigeração Campo Frio'
    });

    registrarHistorico('EMAIL', id, 'CANCELAMENTO', 'Enviado para: ' + dados.ClienteEmail);
    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao enviar email: ' + e.message };
  }
}

/**
 * Envia email manual/personalizado
 */
function enviarEmailManual(destinatario, assunto, corpo, nomeRemetente) {
  const config = getConfiguracoes();

  try {
    MailApp.sendEmail({
      to: destinatario,
      subject: assunto,
      htmlBody: corpo,
      name: nomeRemetente || config.EMPRESA_NOME || 'Refrigeração Campo Frio'
    });

    registrarHistorico('EMAIL', 0, 'MANUAL', 'Enviado para: ' + destinatario);
    return { success: true, message: 'Email enviado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao enviar email: ' + e.message };
  }
}

/**
 * Obtém template de email pelo tipo
 */
function getEmailTemplate(tipo) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_TEMPLATES);
  const dados = sheet.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === tipo && dados[i][3] === 'Sim') {
      return {
        Tipo: dados[i][0],
        Assunto: dados[i][1],
        Corpo: dados[i][2],
        Ativo: dados[i][3]
      };
    }
  }

  return null;
}

/**
 * Obtém todos os templates de email
 */
function getEmailTemplates() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_TEMPLATES);
  const dados = sheet.getDataRange().getValues();

  if (dados.length <= 1) return [];

  const templates = [];
  for (let i = 1; i < dados.length; i++) {
    templates.push({
      Tipo: dados[i][0],
      Assunto: dados[i][1],
      Corpo: dados[i][2],
      Ativo: dados[i][3]
    });
  }

  return templates;
}

/**
 * Salva template de email
 */
function salvarEmailTemplate(dados) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_TEMPLATES);
  const dataRange = sheet.getDataRange();
  const valores = dataRange.getValues();

  for (let i = 1; i < valores.length; i++) {
    if (valores[i][0] === dados.Tipo) {
      sheet.getRange(i + 1, 2, 1, 3).setValues([[dados.Assunto, dados.Corpo, dados.Ativo]]);
      return { success: true, message: 'Template atualizado com sucesso!' };
    }
  }

  // Novo template
  sheet.appendRow([dados.Tipo, dados.Assunto, dados.Corpo, dados.Ativo || 'Sim']);
  return { success: true, message: 'Template criado com sucesso!' };
}

/**
 * Substitui variáveis no template de email
 */
function substituirVariaveis(texto, dados, config) {
  const variaveis = {
    '{NUMERO}': dados.Numero || '',
    '{OS_NUMERO}': dados.OS_NUMERO || dados.Numero || '',
    '{CLIENTE_NOME}': dados.ClienteNome || '',
    '{CLIENTE_EMAIL}': dados.ClienteEmail || '',
    '{DATA_CRIACAO}': dados.DataCriacao || '',
    '{DATA_VALIDADE}': dados.DataValidade || '',
    '{DATA_PREVISTA}': dados.DataPrevista || '',
    '{DATA_CONCLUSAO}': dados.DataConclusao || '',
    '{DATA_CANCELAMENTO}': dados.DATA_CANCELAMENTO || '',
    '{DESCRICAO}': dados.Descricao || '',
    '{TOTAL_PECAS}': formatarMoeda(dados.TotalPecas || 0),
    '{TOTAL_MAO_OBRA}': formatarMoeda(dados.TotalMaoObra || 0),
    '{DESCONTO}': formatarMoeda(dados.Desconto || 0),
    '{TOTAL_GERAL}': formatarMoeda(dados.TotalGeral || 0),
    '{GARANTIA}': dados.Garantia || config.GARANTIA_PADRAO || '',
    '{FORMA_PAGAMENTO}': dados.FormaPagamento || '',
    '{TECNICO}': dados.Tecnico || '',
    '{OBSERVACOES}': dados.Observacoes || '',
    '{OBSERVACOES_CONCLUSAO}': dados.ObsConclusao || '',
    '{MOTIVO_CANCELAMENTO}': dados.MOTIVO_CANCELAMENTO || dados.MotivoCancel || '',
    '{EMPRESA_NOME}': config.EMPRESA_NOME || 'Refrigeração Campo Frio',
    '{EMPRESA_TELEFONE}': config.EMPRESA_TELEFONE || '',
    '{EMPRESA_EMAIL}': config.EMPRESA_EMAIL || '',
    '{EMPRESA_ENDERECO}': config.EMPRESA_ENDERECO || '',
    '{EMPRESA_CNPJ}': config.EMPRESA_CNPJ || ''
  };

  let resultado = texto;
  for (const [chave, valor] of Object.entries(variaveis)) {
    resultado = resultado.split(chave).join(valor);
  }

  return resultado;
}

// ==================== FUNÇÕES DE CONFIGURAÇÕES ====================

/**
 * Obtém todas as configurações
 */
function getConfiguracoes() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIGURACOES);
  const dados = sheet.getDataRange().getValues();

  const config = {};
  for (let i = 1; i < dados.length; i++) {
    config[dados[i][0]] = dados[i][1];
  }

  return config;
}

/**
 * Salva uma configuração
 */
function salvarConfiguracao(chave, valor) {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIGURACOES);
  const dados = sheet.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === chave) {
      sheet.getRange(i + 1, 2).setValue(valor);
      return { success: true, message: 'Configuração atualizada!' };
    }
  }

  // Nova configuração
  sheet.appendRow([chave, valor, '']);
  return { success: true, message: 'Configuração criada!' };
}

/**
 * Salva múltiplas configurações
 */
function salvarConfiguracoes(configs) {
  for (const [chave, valor] of Object.entries(configs)) {
    salvarConfiguracao(chave, valor);
  }
  return { success: true, message: 'Configurações salvas com sucesso!' };
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Gera um novo ID único
 */
function gerarNovoId(sheet) {
  const dados = sheet.getDataRange().getValues();
  let maxId = 0;

  for (let i = 1; i < dados.length; i++) {
    const id = parseInt(dados[i][0]) || 0;
    if (id > maxId) maxId = id;
  }

  return maxId + 1;
}

/**
 * Gera número de documento (Orçamento ou OS)
 */
function gerarNumeroDocumento(sheet, prefixo) {
  const ano = new Date().getFullYear();
  const dados = sheet.getDataRange().getValues();
  let contador = 0;

  for (let i = 1; i < dados.length; i++) {
    const numero = dados[i][1];
    if (numero && numero.includes(ano.toString())) {
      contador++;
    }
  }

  return `${prefixo}${ano}${String(contador + 1).padStart(4, '0')}`;
}

/**
 * Formata data para DD/MM/YYYY
 */
function formatarData(data) {
  if (!data) return '';
  const d = new Date(data);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Formata valor monetário
 */
function formatarMoeda(valor) {
  return parseFloat(valor || 0).toFixed(2).replace('.', ',');
}

/**
 * Registra histórico de ações
 */
function registrarHistorico(tipo, refId, acao, detalhes) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.HISTORICO);
    const id = gerarNovoId(sheet);
    const dataHora = new Date().toLocaleString('pt-BR');
    const usuario = Session.getActiveUser().getEmail() || 'Sistema';

    sheet.appendRow([id, dataHora, tipo, refId, acao, usuario, detalhes]);
  } catch (e) {
    console.log('Erro ao registrar histórico: ' + e.message);
  }
}

// ==================== FUNÇÕES DE DASHBOARD ====================

/**
 * Obtém dados para o dashboard
 */
function getDashboardData() {
  const orcamentos = getOrcamentos();
  const ordensServico = getOrdensServico();
  const pecas = getPecas();
  const clientes = getClientes();

  // Estatísticas de orçamentos
  const orcPendentes = orcamentos.filter(o => o.Status === 'Pendente').length;
  const orcAprovados = orcamentos.filter(o => o.Status === 'Aprovado').length;
  const orcCancelados = orcamentos.filter(o => o.Status === 'Cancelado').length;

  // Estatísticas de OS
  const osEmAndamento = ordensServico.filter(os => os.Status === 'Em Andamento').length;
  const osConcluidas = ordensServico.filter(os => os.Status === 'Concluída').length;
  const osCanceladas = ordensServico.filter(os => os.Status === 'Cancelada').length;

  // Peças com estoque baixo
  const pecasEstoqueBaixo = pecas.filter(p => p.EstoqueAtual <= p.EstoqueMinimo).length;

  // Totais do mês atual
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  let totalMes = 0;
  ordensServico.forEach(os => {
    if (os.Status === 'Concluída' && os.DataConclusao) {
      const dataOS = parseData(os.DataConclusao);
      if (dataOS && dataOS.getMonth() === mesAtual && dataOS.getFullYear() === anoAtual) {
        totalMes += parseFloat(os.TotalGeral) || 0;
      }
    }
  });

  return {
    clientes: clientes.length,
    orcamentos: {
      total: orcamentos.length,
      pendentes: orcPendentes,
      aprovados: orcAprovados,
      cancelados: orcCancelados
    },
    ordensServico: {
      total: ordensServico.length,
      emAndamento: osEmAndamento,
      concluidas: osConcluidas,
      canceladas: osCanceladas
    },
    estoque: {
      totalPecas: pecas.length,
      estoqueBaixo: pecasEstoqueBaixo
    },
    financeiro: {
      totalMes: totalMes
    },
    ultimosOrcamentos: orcamentos.slice(0, 5),
    ultimasOS: ordensServico.slice(0, 5)
  };
}

/**
 * Converte string de data para objeto Date
 */
function parseData(dataStr) {
  if (!dataStr) return null;
  const partes = dataStr.split('/');
  if (partes.length === 3) {
    return new Date(partes[2], partes[1] - 1, partes[0]);
  }
  return new Date(dataStr);
}

// ==================== FUNÇÃO DE TESTE ====================

/**
 * Função para testar o sistema
 */
function testarSistema() {
  console.log('Inicializando sistema...');
  const resultado = inicializarSistema();
  console.log(resultado);

  console.log('Obtendo configurações...');
  const config = getConfiguracoes();
  console.log(config);

  console.log('Sistema testado com sucesso!');
}

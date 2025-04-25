const models = require("../../models");

const { Swot_Oportunidades } = models;
const { Swot_Ameacas } = models;
const Handler = require("../handler");
const {
  gravarPontosSwot,
  removerPontosSwot,
  calcularPontosSwot,
} = require("../diagnostico/externo/Swot");
const Logger = require("../../auth/logService");

const swot_oportunidades = (resource) => {
  const oportunidades = {
    concorrentes: [
      "Desenvolver produtos e serviços similares aos principais concorrentes",
      "Atrair clientes chave dos concorrentes",
      "Desenvolver produtos e serviços que nos diferencie dos concorrentes",
      "Oferecer produtos inovadores",
      "Agregar serviços aos produtos",
      "Soluções Customizada",
      "Melhorar Governança e Compliance",
      "Regularização da empresa",
      "Segmentação de Clientes",
      "Customização de Produtos e Serviços",
      "Produtos/serviços customizados por faixa etária",
      "Construir excelência operacional",
      "Negociar parceria em negócios com concorrentes",
    ],
    clientes: [
      "Aumentar receita nos clientes atuais",
      "Aumentar Fatia de Mercado no segmento",
      "Melhorar nível de serviço e confiabilidade de entrega",
      "Oferecer produtos inovadores e diferenciados",
      "Oferecer soluções Customizadas",
      "Melhorar Governança e Compliance",
      "Melhorar relacionamento e atendimento com cliente",
      "Customização de Produtos e Serviços",
      "Produtos/serviços customizados por faixa etária",
      "Atender Público por faixa etária",
      "Reduzir estoques por consignação",
      "Construir  excelência operacional",
      "Fortalecer parceria com cliente",
    ],
    fornecedores: [
      "Redução de custos com insumos/serviços",
      "Fortalecer parceria com fornecedor",
      "Incorporar inovação Produto/Serviços do fornecedor nas soluções da empresa",
      "Integrar fornecedor na cadeia de valor da empresa",
      "Sincronizar entregas no modelo kanban",
      "Construir Soluções Customizadas em parceria",
      "Melhorar Governança e Compliance",
      "Ampliar portfolio de produtos/serviços",
      "Melhorar qualidade do fornecedor",
      "Customização de Produtos e Serviços",
      "Reduzir estoques por consignação",
      "Oferecer maior segurança ao fornecedor por fidelização",
      "Fixar valor por tempo determinado e eliminar necessidade de cotação a cada compra",
      "Fechar contratos de médio prazo para maior segurança na relação e parceria",
    ],
    macro: [
      "Acesso a fontes de financiamentos do governo",
      "Adequar negócio para atender órgãos governamentais",
      "Atrair investidores para alavancagem do negócio",
      "Atualização tecnológica em ambiente digital",
      "Aumentar competências organizacionais",
      "Automação das rotinas administrativas",
      "Automação para indústria 4.0",
      "Capacitação dos colaboradores através do sistema S",
      "Desenvolver novos produtos e/ou serviços",
      "Desenvolver parcerias internacionais",
      "Desenvolver soluções por perfil socioeconômico de clientes",
      "Fusões & Aquisições (M&A)",
      "Importação de produtos, insumos ou máquinas",
      "Incorporar as novas tecnologias emergentes",
      "Inovar modelo de negócios/reposicionamento no mercado",
      "Melhorar modelo de governança",
      "Ofecer soluções adequada as novas tendências culturais",
      "Parceria com startups tecnológicas",
      "Realizar hedge cambial",
      "Redução de custos de folha com flexibilização trabalhista",
      "Redução de custos por simplificação tributária",
      "Regularização a legislação vigente",
      "Segmentação de clientes e mercado",
      "Substituição de materiais e/ou serviços por inovação",
    ].sort(),
  };
  return oportunidades[resource];
};

const swot_ameacas = (resource) => {
  const ameacas = {
    concorrentes: [
      "Não ter recursos para combater concorrentes",
      "Perda de mercado para concorrentes",
      "Dificuldade de fidelizar clientes",
      "Obsolescência de Produtos/Serviços",
      "Perda de governança/compliance",
      "Falta de competência técnica para reagir as ações do concorrente",
      "Oferecer novas soluções adequada as novas tendencias culturais",
      "Falhar em inovar produtos/serviços",
      "Gerar insatisfação nos clientes por não ter mesmo desempenho do concorrente",
      "Redução da rentabilidade para combater concorrentes",
      "Redução da capacidade de reação a dinâmica dos concorrentes",
      "Perda de colaboradores chave para concorrentes",
    ],
    clientes: [
      "Não ter recursos para atender demandas dos clientes",
      "Perder o cliente para concorrentes que oferecem melhores soluções",
      "Perda de fidelidade do cliente",
      "Mudança de perfil do cliente torne nossos produtos/serviços obsoletos",
      "Redução de rentabilidade para se manter competitivo",
      "Não conseguir acompanhar as demandas e necessidades dos clientes",
      "Perda de valor na cultura da centralidade dos clientes",
      "Não ter habilidade e flexibilidade para se adequar a dinâmica dos clientes",
    ],
    fornecedores: [
      "Aumento de custos pela qualidade do fornecedor",
      "Perda de confiabilidade junto ao cliente por falha do fornecedor",
      "Aumento de Custos por reajustes não planejados",
      "Obsolescência de Produtos/Serviços",
      "Receber multas por falha do fornecedor",
      "Perda de mercado/clientes por baixa confiabilidade do fornecedor",
      "Aumento de estoques de segurança",
      "Baixa capacidade de negociação de prazos e custos com fornecedor",
      "Falta de insumos e matéria prima",
      "Dependência de fornecedores chave",
    ],
    macro: [
      "Aumento de custos pela valorização cambial",
      "Perda de receita pelo alto no desemprego/recessão econômica",
      "Queda de Receitas",
      "Não acessar recursos de investimentos para atualização tecnológica",
      "Multas por não atender legislação",
      "Processos trabalhistas",
      "Perda de colaboradores chave para o mercado",
      "Carga tributária inviabiliza rentabilidade mínima",
      "Multas pela receita federal",
      "Tempo excessivo para importação",
      "Obsolescência dos produtos ou serviços",
      "Perda de mercado por substituição tecnológica",
      "Perda de competitividade para produtos importados",
      "Falta de estrutura/recursos nos projetos estratégicos",
      "Pressão nos custos de insumos",
      "Falta de mão de obra qualificada",
      "Resistência cultural as mudanças necessárias",
      "Não atender demanda das novas gerações",
      "Necessidade de altos investimentos",
    ].sort(),
  };
  return ameacas[resource];
};

exports.UpdateFormulario = async (companyId, data, model) => {
  const query = {
    where: {
      EmpresaId: companyId,
      id: data.id,
    },
  };
  await model
    .update(data, query)
    .then(async (response) => {
      console.info("Atualizado com sucesso");
    })
    .catch((err) => {
      console.info("ERRO AO ATUALIZAR:", err);
    });
};

exports.UpdateSwot = async (event, model, resource, action) => {
  const { companyId } = event.pathParameters;

  try {
    const { swot, ano } = JSON.parse(event.body);

    if (ano === "" || ano === undefined || ano === null) {
      return Handler.BadRequest({
        message: "Deve-se informar o ano referente a avaliação",
      });
    }

    const anoInt = parseInt(ano);

    if (isNaN(anoInt) || anoInt < 2019) {
      return Handler.BadRequest({
        message: "Deve-se informar um ano válido",
      });
    }

    for (const item of swot) {
      const pontos_oportunidade = await calcularPontosSwot("OP", item);
      const pontos_ameacas = await calcularPontosSwot(resource, item);

      let promise;
      if (item.id === 0) {
        const data = {
          ...item,
          EmpresaId: companyId,
          ano_exercicio: ano,
        };
        promise = model.create(data);
      } else {
        const query = {
          where: { EmpresaId: companyId, id: item.id },
          returning: true, // needed for affectedRows to be populated
        };
        promise = model.update(item, query);
      }

      await promise
        .then(async (result) => {
          if (item.id === 0) {
            item.id = result.id;
          }

          console.info(`Swot ${item.id} atualizado com sucesso`);

          const dados_op = {
            valorId: item.id,
            empresa: companyId,
            descricao: swot_oportunidades(resource)[item.oportunidadeId],
            pontos: pontos_oportunidade,
            origem: resource,
            ano_exercicio: ano,
          };
          if (item.oportunidadeId !== "-") {
            await gravarPontosSwot(Swot_Oportunidades, dados_op);
          } else {
            await removerPontosSwot(Swot_Oportunidades, dados_op);
          }
          const dados_am = {
            valorId: item.id,
            empresa: companyId,
            descricao: swot_ameacas(resource)[item.ameacaId],
            pontos: pontos_ameacas,
            origem: resource,
            ano_exercicio: ano,
          };
          if (item.ameacaId !== "-") {
            await gravarPontosSwot(Swot_Ameacas, dados_am);
          } else {
            await removerPontosSwot(Swot_Ameacas, dados_am);
          }

          await Logger.setSuccessLog(
            action,
            `SWOT [${resource}] atualizado com sucesso`
          );
        })
        .catch((error) => {
          console.error("Erro ao atualizar swot", error);
        });
    }

    return Handler.Ok({
      message: "SWOT atualizado com sucesso",
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

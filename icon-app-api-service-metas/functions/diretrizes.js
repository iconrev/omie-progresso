const { middleware, ActionsClass } = require("../auth/authorizer");
const Estrategias = require("../services/diretrizes/Estrategias");
const Eficiencia = require("../services/diretrizes/Eficiencia");
const Eficacia = require("../services/diretrizes/Eficacia");
const Gauge = require("../services/diretrizes/Gauge");

const returnsEstrategias = (event) => {
  const method = event.httpMethod;

  if (method === "GET") {
    if (event.resource.includes("grafico")) {
      return new ActionsClass(Gauge.buscarDadosGraficoEstrategias, "", {
        allowDemo: true,
      });
    }
    if (event.resource.includes("listar")) {
      return new ActionsClass(
        Estrategias.buscarDadosEstrategias,
        "guidelines_list_estrategy",
        {
          allowDemo: true,
        }
      );
    }
  }

  if (method === "POST") {
    if (event.resource.includes("salvar")) {
      return new ActionsClass(
        Estrategias.salvarDadosEstrategias,
        "guidelines_update_strategy"
      );
    }
  }

  return null;
};

const returnsEficiencia = (event) => {
  const method = event.httpMethod;

  if (method === "GET") {
    if (event.resource.includes("resumo")) {
      return new ActionsClass(
        Eficiencia.buscarDadosResumo,
        "guidelines_summary_estrategy",
        {
          allowDemo: true,
        }
      );
    }
  }

  return null;
};

const returnsEficacia = (event) => {
  const method = event.httpMethod;

  if (method === "GET") {
    if (event.resource.includes("graficos")) {
      return new ActionsClass(
        Eficacia.gauges,
        "guidelines_effectiveness_gauges",
        {
          allowDemo: true,
        }
      );
    }
    if (event.resource.includes("dre")) {
      return new ActionsClass(
        Eficacia.carregarDreMensal,
        "guidelines_dre_load",
        {
          allowDemo: true,
        }
      );
    }
    if (event.resource.includes("levantamento")) {
      return new ActionsClass(
        Eficacia.carregarLevantamentoMensal,
        "guidelines_levantamento_load",
        {
          allowDemo: true,
        }
      );
    }
    if (event.resource.includes("dashboard/meta/reset")) {
      return new ActionsClass(
        Eficacia.findMetaDefault,
        "guidelines_effectiveness_dashboard_reset",
        {
          allowDemo: true,
        }
      );
    }
    if (event.resource.includes("dashboard")) {
      return new ActionsClass(
        Eficacia.exportDashboard,
        "guidelines_effectiveness_dashboard",
        {
          allowDemo: true,
        }
      );
    }
  }

  if (method === "POST") {
    if (event.resource.includes("dre")) {
      return new ActionsClass(Eficacia.salvarDreMensal, "guidelines_dre_save");
    }
    if (event.resource.includes("levantamento")) {
      return new ActionsClass(
        Eficacia.salvarLevantamentoMensal,
        "guidelines_levantamento_save"
      );
    }
    if (event.resource.includes("dashboard/meta")) {
      return new ActionsClass(
        Eficacia.saveMetaDashboard,
        "guidelines_effectiveness_dashboard_save_meta"
      );
    }
  }

  return null;
};

const getAction = (event) => {
  const { categoria } = event.pathParameters;

  if (categoria === "estrategias") {
    return returnsEstrategias(event);
  }
  if (categoria === "eficiencia") {
    return returnsEficiencia(event);
  }
  if (categoria === "eficacia") {
    return returnsEficacia(event);
  }
  return null;
};

exports.main = (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};

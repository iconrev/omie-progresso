const { middleware, ActionsClass } = require("../auth/authorizer");
const Tarefas = require("../services/diretrizes/Tarefas");

const getAction = (event) => {
  const method = event.httpMethod;

  if (method === "GET") {
    if (event.resource.includes("tarefas/listar")) {
      return new ActionsClass(Tarefas.listTask, "guidelines_list_task", {
        allowDemo: true,
      });
    }
    if (event.resource.includes("responsaveis/listar")) {
      return new ActionsClass(
        Tarefas.getResponsible,
        "load_responsible_company",
        {
          allowDemo: true,
        }
      );
    }
  }

  if (method === "POST") {
    if (event.resource.includes("nova")) {
      return new ActionsClass(Tarefas.addNewTask, "guidelines_new_task");
    }
    if (event.resource.includes("editar")) {
      return new ActionsClass(Tarefas.updateTask, "guidelines_update_task");
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};

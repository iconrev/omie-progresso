/* eslint-disable no-param-reassign */
const Handler = require("../handler");
const { setLog } = require("../../auth/logService");
const userController = require("../../auth/userController");
const controllerEstrategias = require("../generico/FuncoesDeEstrategias");
const models = require("../../models");

const { Diretrizes_Tarefas } = models;
const { Diretrizes_Tarefas_Atividades } = models;
const { Empresa_Responsaveis } = models;
const { Diretrizes_Tarefas_Responsaveis } = models;
const { Estrategias } = models;

const getUserBy = async (field, value, model) => {
  let response = null;

  const filterUser = {
    where: {
      [field]: value,
    },
    raw: true,
  };
  await model
    .findOne(filterUser)
    .then(async (usuario) => {
      response = usuario;
    })
    .catch((err) => {
      console.error("ERRO AO BUSCAR USUÁRIO");
      console.error(err);
    });
  return response;
};

const saveActivitiesTask = async (task_id, activities) => {
  activities.sort((a, b) => {
    if (a.ts_local < b.ts_local) {
      return -1;
    }
    if (a.ts_local > b.ts_local) {
      return 1;
    }
    return 0;
  });

  await Promise.all(
    activities.map(async (activity) => {
      if (activity.id === 0) {
        const user = await userController.getUserByCognitoId(
          activity.usuario_id
        );
        if (user) {
          activity.tarefa_id = task_id;
          activity.usuario_id = user.id;
          await Diretrizes_Tarefas_Atividades.create(activity, { raw: true })
            .then(async () => {
              console.info("Atividade salva com sucesso");
            })
            .catch(async (error) => {
              console.error(error);
            });
        } else {
          console.error("USUARIO NÃO ENCONTRADO", activity);
        }
      }
    })
  );
};

const saveResponsible = async (task_id, responsibles) => {
  for (let i = 0; i < responsibles.length; i++) {
    const responsible = responsibles[i];
    responsible.tarefa_id = task_id;
  }

  const query = {
    where: {
      tarefa_id: task_id,
    },
    raw: true,
  };
  await Diretrizes_Tarefas_Responsaveis.destroy(query)
    .then(async () => {
      await Diretrizes_Tarefas_Responsaveis.bulkCreate(responsibles).then(
        console.info("Responsáveis cadatrados com sucesso")
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

const getAllActivities = async (task_id) => {
  const responseActivities = [];

  const filterTask = {
    attributes: ["id", "comentario", "ts_local", "visivel", "usuario_id"],
    where: {
      tarefa_id: task_id,
    },
    raw: true,
  };
  const activities = await Diretrizes_Tarefas_Atividades.findAll(filterTask);

  await Promise.all(
    activities.map(async (activity) => {
      const user = await userController.getUserById(activity.usuario_id);
      if (user) {
        activity.usuario_nome = user.nome;
        responseActivities.push(activity);
      }
    })
  );

  return responseActivities;
};

const getAllResponsible = async (task_id) => {
  const responseResponsible = [];

  const filterTask = {
    attributes: ["responsavel_id"],
    where: {
      tarefa_id: task_id,
    },
    raw: true,
  };
  const result = await Diretrizes_Tarefas_Responsaveis.findAll(filterTask);

  await Promise.all(
    result.map(async (responsible) => {
      const user = await getUserBy(
        "id",
        responsible.responsavel_id,
        Empresa_Responsaveis
      );
      if (user) {
        responsible.nome = user.nome;
        responsible.email = user.email;
        responsible.cargo = user.cargo;
        responsible.active = user.active;
        responseResponsible.push(responsible);
      }
    })
  );

  return responseResponsible;
};

const validateTaskObject = (task) => {
  const errors = [];

  const expiration_date = Date.parse(task.expiration_date);
  if (Number.isNaN(expiration_date)) {
    errors.push("O formato do parâmetro [expiration_date] deve ser YYYY-MM-DD");
  }

  if (task.title.length < 3) {
    errors.push("Deve-se preencher um título válido para a tarefa");
  }

  if (task.responsible.length === 0) {
    errors.push("Deve-se preencher ao menos um responsável para a tarefa");
  }

  return errors;
};

module.exports.listTask = async (event, action) => {
  const { companyId } = action;
  const { strategyId, perspective } = event.pathParameters;

  if (controllerEstrategias.PerspectivasAtivas.indexOf(perspective) === -1) {
    await setLog(
      action,
      "bad_request",
      `Perspectiva [${perspective}] não existe`
    );
    return Handler.BadRequest({
      status: "perspectiva_not_found",
      message: "Perspectiva inválida",
    });
  }

  const estrategia = await controllerEstrategias.getStrategyByPrimaryKeyId(
    strategyId,
    perspective
  );
  if (!estrategia) {
    await setLog(
      action,
      "bad_request",
      `Perspectiva [${perspective}] não está de acordo com o id da estratégia`
    );
    return Handler.BadRequest({
      status: "perspective_not_found",
      message: "Perspectiva inválida",
    });
  }

  const filterEstrategia = {
    where: {
      id: estrategia.estrategia_id,
    },
    raw: true,
  };
  const estrategiaName = await Estrategias.findOne(filterEstrategia);
  if (estrategia && estrategiaName) {
    estrategia.perspectiva = estrategiaName.perspectiva;
    estrategia.categoria = estrategiaName.categoria;
  }

  const filterTask = {
    attributes: [
      "id",
      "ano_exercicio",
      "title",
      "description",
      "stage",
      "estrategia_id",
      "estrategia_perspectiva",
      "estrategia_categoria",
      "expiration_date",
    ],
    where: {
      EmpresaId: companyId,
      estrategia_id: strategyId,
    },
    raw: true,
  };
  const tarefas = await Diretrizes_Tarefas.findAll(filterTask);

  await Promise.all(
    tarefas.map(async (tarefa) => {
      tarefa.activities = await getAllActivities(tarefa.id);
      tarefa.responsible = await getAllResponsible(tarefa.id);
    })
  );

  await setLog(
    action,
    "success",
    `Carregando tarefas da estratégia [${strategyId}]`
  );

  return Handler.Ok({
    estrategia,
    tarefas,
  });
};

module.exports.getResponsible = async (event, action) => {
  const { companyId } = action;

  const query = {
    attributes: ["id", "nome", "email", "cargo", "active"],
    where: {
      EmpresaId: companyId,
      active: "1",
    },
    order: [
      ["nome", "ASC"],
      ["cargo", "ASC"],
    ],
    raw: true,
  };
  const responsaveis = await Empresa_Responsaveis.findAll(query);

  return Handler.Ok({
    responsaveis,
  });
};

module.exports.addNewTask = async (event, action) => {
  const { companyId } = action;

  const data = {
    EmpresaId: companyId,
    ...JSON.parse(event.body),
  };

  const errorsTask = validateTaskObject(data);
  if (errorsTask.length > 0) {
    return Handler.BadRequest({
      status: "invalid_task",
      message: "Os dados informados para a tarefa são inválidos",
      errors: errorsTask,
    });
  }

  const result = await Diretrizes_Tarefas.create(data, { raw: true });

  await Promise.all([
    setLog(
      action,
      "success",
      `Nova tarefa cadastrada com sucesso [${result.id}]`
    ),
    saveActivitiesTask(result.id, data.activities),
    saveResponsible(result.id, data.responsible),
  ]);

  return Handler.Ok({
    message: "Tarefa cadastrada com sucesso",
    id: result.id,
  });
};

module.exports.updateTask = async (event, action) => {
  const { companyId } = action;

  const data = {
    EmpresaId: companyId,
    ...JSON.parse(event.body),
  };

  const errorsTask = validateTaskObject(data);
  if (errorsTask.length > 0) {
    return Handler.BadRequest({
      status: "invalid_task",
      message: "Os dados informados para a tarefa são inválidos",
      errors: errorsTask,
    });
  }

  const filterTask = {
    where: {
      EmpresaId: companyId,
      id: data.id,
      estrategia_id: data.estrategia_id,
    },
    raw: true,
  };

  const task = await Diretrizes_Tarefas.findOne(filterTask);

  if (!task) {
    await setLog(
      action,
      "bad_request",
      `Tarefa [${data.id}] não existe ou não está vinculada para a estrategia [${data.estrategia_id}]`
    );
    return Handler.BadRequest({
      status: "task_not_found",
      message: "Tarefa não encontrada",
    });
  }

  await Promise.all([
    Diretrizes_Tarefas.update(data, filterTask),
    saveActivitiesTask(data.id, data.activities),
    saveResponsible(data.id, data.responsible),
    setLog(
      action,
      "success",
      `Tarefa [${data.title}] [${data.id}] atualizada com sucesso`
    ),
  ]);

  return Handler.Ok({
    status: "success",
    message: "Tarefa atualizada com sucesso",
    activities: await getAllActivities(data.id),
  });
};

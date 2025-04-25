const Empresas = require("../services/cadastros/empresas");
const { ActionsClass, middleware } = require("../auth/authorizer");

const ACTIONS = {
  loadCompany: new ActionsClass(Empresas.empresas_detalhes, "load_company", {
    allowDemo: true,
  }),
  loadInvites: new ActionsClass(
    Empresas.empresas_usuarios_convite_meusconvites,
    "load_invites",
    { verifyCompany: false }
  ),
  responseInvite: new ActionsClass(
    Empresas.empresas_usuarios_convite_aceite,
    "accept_invite",
    { verifyCompany: false }
  ),
  getCompanyDataByCnpj: new ActionsClass(Empresas.buscar_cnpj, "find_cnpj", {
    verifyCompany: false,
  }),
  setCompany: new ActionsClass(Empresas.empresas_registro, "company_new", {
    verifyCompany: false,
  }),
  putCompany: new ActionsClass(Empresas.empresas_atualizar, "company_edit"),
  getUsersInCompany: new ActionsClass(
    Empresas.getUsersInCompany,
    "company_users_list"
  ),
  setUsersInCompanyNew: new ActionsClass(
    Empresas.createNewUserInCompany,
    "company_users_new",
    { verifyCompany: true }
  ),
  removeUserInCompany: new ActionsClass(
    Empresas.removeUserInCompany,
    "company_users_remove",
    { verifyCompany: true }
  ),
  updateUserInCompany: new ActionsClass(
    Empresas.updateUserInCompany,
    "company_users_edit",
    { verifyCompany: true }
  ),
  removeInvite: new ActionsClass(
    Empresas.empresas_usuario_convite_cancelar,
    "company_users_invite_cancel",
    { verifyCompany: false }
  ),
  resendInvite: new ActionsClass(
    Empresas.empresas_usuario_reenviar_convite,
    "company_users_invite_resend",
    { verifyCompany: false }
  ),
  requestTrialStart: new ActionsClass(
    Empresas.request_trial_start,
    "company_trial_start",
    { verifyCompany: true }
  ),
  requestPremiumStart: new ActionsClass(
    Empresas.request_premium_active,
    "company_premium_start",
    { verifyCompany: true }
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    if (event.resource.includes("usuarios")) {
      if (event.resource.includes("novo")) {
        return ACTIONS.setUsersInCompanyNew;
      }
      if (event.resource.includes("remove")) {
        return ACTIONS.removeUserInCompany;
      }
      if (event.resource.includes("update")) {
        return ACTIONS.updateUserInCompany;
      }
      if (event.resource.includes("convite")) {
        if (event.resource.includes("cancelar")) {
          return ACTIONS.removeInvite;
        }
        if (event.resource.includes("reenviar")) {
          return ACTIONS.resendInvite;
        }
      }
    }
    if (event.resource.includes("api/cadastros/empresas/convites/aceite")) {
      return ACTIONS.responseInvite;
    }
    if (event.resource.includes("trial")) {
      return ACTIONS.requestTrialStart;
    }
    if (event.resource.includes("ativar-premium")) {
      return ACTIONS.requestPremiumStart;
    }
    return ACTIONS.setCompany; // cadastro de empresas
  }

  if (event.httpMethod === "PUT") {
    return ACTIONS.putCompany; // atualizar dados de uma empresa cadastrada
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("usuarios")) {
      // listar convites enviados para a empresa
      return ACTIONS.getUsersInCompany;
    }
    if (event.resource.includes("convites")) {
      // todos  os convites que o usuário recebeu
      return ACTIONS.loadInvites;
    }
    if (event.resource.includes("detalhes")) {
      return ACTIONS.loadCompany;
    }
    if (event.resource.includes("cnpj")) {
      return ACTIONS.getCompanyDataByCnpj;
    }
  }

  return null;
};

module.exports.main = (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};

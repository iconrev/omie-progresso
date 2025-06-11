const RolesCompany = require("../services/cadastros/rolesCompany");
const { ActionsClass, middleware } = require("../auth/authorizer");

const ACTIONS = {
  getRolesCompany: new ActionsClass(
    RolesCompany.getRolesCompany,
    "helpers_list_roles_company"
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    if (event.resource.includes("roles")) {
      return ACTIONS.getRolesCompany;
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};

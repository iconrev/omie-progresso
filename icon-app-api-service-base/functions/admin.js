const Administrativo = require("../services/admin/administrativo");
const { ActionsClass, middleware } = require("../auth/authorizer");

const ACTIONS = {
  getDashboard: new ActionsClass(
    Administrativo.getDashboard,
    "admin_dashboard_load"
  ),
  getAssociados: new ActionsClass(
    Administrativo.getAssociados,
    "admin_associates_list"
  ),
  getFilesAssociates: new ActionsClass(
    Administrativo.getFilesAssociates,
    "admin_associates_files_list"
  ),
  putAssociatesNewFile: new ActionsClass(
    Administrativo.uploadNewFileAssociates,
    "admin_associates_files_upload"
  ),
  getUsers: new ActionsClass(Administrativo.getUsuarios, "admin_users_list"),
  getCompanies: new ActionsClass(
    Administrativo.getEmpresas,
    "admin_companies_list"
  ),
  getCompaniesPremium: new ActionsClass(
    Administrativo.getEmpresasPremium,
    "admin_companies_premium_list"
  ),
  getCompaniesPremiumReport: new ActionsClass(
    Administrativo.getReportPremium,
    "admin_companies_premium_download"
  ),
  getLogs: new ActionsClass(Administrativo.getLogs, "admin_logs_load"),
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    if (event.resource.includes("associados/materiais")) {
      return ACTIONS.putAssociatesNewFile;
    }
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("logs")) {
      return ACTIONS.getLogs;
    }
    if (event.resource.includes("dashboard")) {
      return ACTIONS.getDashboard;
    }
    if (event.resource.includes("associados")) {
      if (event.resource.includes("materiais")) {
        return ACTIONS.getFilesAssociates;
      }
      return ACTIONS.getAssociados;
    }
    if (event.resource.includes("usuarios")) {
      return ACTIONS.getUsers;
    }
    if (event.resource.includes("empresas")) {
      if (event.resource.includes("premium")) {
        if (event.resource.includes("download")) {
          return ACTIONS.getCompaniesPremiumReport;
        }
        return ACTIONS.getCompaniesPremium;
      }
      return ACTIONS.getCompanies;
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  action.verifyCompany = false;
  action.onlyProfiles = ["superadmin", "admin"];
  action.onlyPermissions = ["acesso_administrativo"];
  return middleware(event, context, callback, action);
};

const Empresas = require("../../services/cadastros/empresas");
const { ActionsClass, middleware } = require("../../auth/authorizer");

const ACTIONS = {
  downloadDre: new ActionsClass(
    Empresas.sheet_download_dre,
    "company_config_download_sheet_dre",
    {
      allowDemo: true,
    }
  ),
  downloadDiagnostico: new ActionsClass(
    Empresas.sheet_download_diagnostic,
    "company_config_download_sheet_diagnostic",
    {
      allowDemo: true,
    }
  ),
  uploadDiagnostico: new ActionsClass(
    Empresas.sheet_upload,
    "company_config_upload_sheet",
    {
      allowDemo: true,
    }
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    if (event.resource.includes("planilha")) {
      return ACTIONS.uploadDiagnostico;
    }
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("planilha")) {
      if (event.resource.includes("dre")) {
        return ACTIONS.downloadDre;
      }
      if (event.resource.includes("diagnostico")) {
        return ACTIONS.downloadDiagnostico;
      }
    }
  }

  return null;
};

module.exports.main = (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};

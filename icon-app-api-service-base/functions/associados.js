const AreaExclusiva = require('../services/associados/area-exclusiva')
const { ActionsClass, middleware } = require('../auth/authorizer');

const ACTIONS = {
  listFiles: new ActionsClass(
    AreaExclusiva.getFilesAssociates,
    'associates_files_list',
    { verifyCompany: false }
  ),
  getDemos: new ActionsClass(
    AreaExclusiva.getDemoCompany,
    'associates_demos_list',
    { verifyCompany: false }
  ),
  downloadFile: new ActionsClass(
    AreaExclusiva.downloadFile,
    'associates_files_download',
    { verifyCompany: false }
  ),
}

const getAction = (event) => {
  if (event.httpMethod === 'GET') {
    if (event.resource.includes('materiais/download')) {
      return ACTIONS.downloadFile
    }
    if (event.resource.includes('associados/materiais')) {
      return ACTIONS.listFiles
    }
    if (event.resource.includes('associados/demo')) {
      return ACTIONS.getDemos
    }
  }

  return null;
}

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  action.onlyProfiles = ['superadmin', 'admin', 'associado', 'omie']
  return middleware(event, context, callback, action)
}
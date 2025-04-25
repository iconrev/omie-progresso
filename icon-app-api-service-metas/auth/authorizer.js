const AWS = require("aws-sdk");
const userController = require("./userController");
const CompanyService = require("./CompanyService");
const Handler = require("../services/handler");
const { validateToken } = require("./validate_token");

const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
  region: process.env.COGNITO_USER_POOL_REGION,
});

const requestIsDemo = (event) => {
  if (!event.queryStringParameters) return false;
  return event.queryStringParameters.demo === "true";
};


class ActionsClass {
  constructor(run, title, options = {}) {
    this._run = run;
    this._title = title;
    this._verifyCompany =
      options.verifyCompany === undefined ? true : options.verifyCompany;
    this._verifyUser =
      options.verifyUser === undefined ? true : options.verifyUser;
    this._allowDemo =
      options.allowDemo === undefined ? false : options.allowDemo;
    this._onlyPermissions =
      options.onlyPermissions === undefined ? [] : options.onlyPermissions;
    this._onlyProfiles =
      options.onlyProfiles === undefined ? [] : options.onlyProfiles;
    this._user = null;
    this._company = null;
    this._requestIsDemo = undefined;
  }

  get run() {
    return this._run;
  }

  get title() {
    return this._title;
  }

  set title(newTitle) {
    this._title = newTitle;
  }

  get verifyUser() {
    return this._verifyUser;
  }

  set verifyUser(bool) {
    this._verifyUser = bool;
  }

  get verifyCompany() {
    return this._verifyCompany;
  }

  set verifyCompany(bool) {
    this._verifyCompany = bool;
  }

  get allowDemo() {
    return this._allowDemo;
  }

  set allowDemo(bool) {
    this._allowDemo = bool;
  }

  get user() {
    return this._user;
  }

  set user(user) {
    this._user = user;
  }

  /**
   * @returns {CompanyService.Company||null}
   */
  get company() {
    return this._company;
  }

  /**
   * @returns {string||null}
   */
  get companyId() {
    return this.company ? this.company.id : null;
  }

  get requestIsDemo() {
    return this._requestIsDemo;
  }

  set requestIsDemo(bool) {
    this._requestIsDemo = bool;
  }

  get onlyProfiles() {
    return this._onlyProfiles;
  }

  set onlyProfiles(profiles) {
    this._onlyProfiles = profiles;
  }

  get onlyPermissions() {
    return this._onlyPermissions;
  }

  set onlyPermissions(permissions) {
    this._onlyPermissions = permissions;
  }

  setCompany(companyId) {
    this._company = new CompanyService.Company(companyId);
  }

  setUser(user) {
    this._user = user;
  }
}

/**
 *
 * @param {object} event
 * @param {object} context
 * @param {object} callback
 * @param {ActionsClass} action
 */
const middleware = async (event, context, callback, action) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!action) {
    return Handler.BadRequest({
      message: "Método não encontrado",
    });
  }

  if (action.run === undefined) {
    return Handler.BadRequest({
      message: "Serviço não encontrado",
    });
  }

  if (action.verifyCompany) {
    const { companyId } = event.pathParameters;
    if (!companyId) {
      return Handler.BadRequest({
        message: "Empresa não definida",
      });
    }
    action.setCompany(companyId);
  }

  if (action.verifyUser) {
    // Verifica se o auth header é valido
    if (!event.headers || !event.headers.Authorization) {
      return Handler.Unauthenticated();
    }
    const token = event.headers.Authorization;
    if (!token) {
      return Handler.Unauthenticated();
    }

    const userToken = await validateToken(token);
    if (!userToken) {
      return Handler.Unauthenticated();
    }

    const user = await userController.getUser(event, true);
    if (!user) return Handler.Unauthenticated();
    action.setUser(user);

    if (action.onlyProfiles.length > 0) {
      const userProfiles = await userController.getProfilesByUser(
        action.user.id
      );
      const profilesUserAuthorized = userProfiles.filter((profile) =>
        action.onlyProfiles.includes(profile.name)
      );

      if (profilesUserAuthorized.length === 0)
        return Handler.Unauthorized(action);

      action.user.profile = userProfiles;
    }

    if (action.onlyPermissions.length > 0) {
      const userPermissions = await userController.getPermissionsByUser(
        action.user.id
      );
      const permissionsUserAuthorized = userPermissions.filter((permission) =>
        action.onlyPermissions.includes(permission.name)
      );

      if (permissionsUserAuthorized.length === 0)
        return Handler.Unauthorized(action);

      action.user.permissions = userPermissions;
    }
  }

  action.requestIsDemo = requestIsDemo(event);

  if (action.requestIsDemo && action.allowDemo) {
    if (
      action.verifyCompany &&
      !(await userController.companyIsDemo(action.companyId))
    ) {
      return Handler.Unauthorized(action);
    }
    if (!(await userController.userIsAssociate(action.user, true))) {
      return Handler.Unauthorized(action);
    }
  } else if (action.verifyCompany) {
    const userValidate = await userController.validateUserInCompany(
      action.user,
      action.companyId
    );
    if (!userValidate) {
      if (
        !(await userController.userIsAssociateNivel2(
          action.user.id,
          action.companyId
        ))
      ) {
        return Handler.Unauthorized(action);
      }
      const empresaIsHomologada = userController.companyIsHomologada(
        action.companyId
      );
      if (empresaIsHomologada) {
        return Handler.Unauthorized(action);
      }
    }
  }

  try {
    const response = await action.run(event, action);
    return response;
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.cognito = cognito;
module.exports.ActionsClass = ActionsClass;
module.exports.middleware = middleware;

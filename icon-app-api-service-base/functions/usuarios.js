const Usuarios = require("../services/cadastros/usuarios");
const { ActionsClass, middleware } = require("../auth/authorizer");

const ACTIONS = {
  signIn: new ActionsClass(Usuarios.signIn, "user_sign_in", {
    verifyUser: false,
    verifyCompany: false,
  }),
  signInSSO: new ActionsClass(Usuarios.signInSSO, "user_sign_in_sso", {
    verifyUser: false,
    verifyCompany: false,
  }),
  refreshToken: new ActionsClass(Usuarios.refreshToken, "user_refresh_token", {
    verifyUser: false,
    verifyCompany: false,
  }),
  refreshTokenV2: new ActionsClass(
    Usuarios.refreshTokenV2,
    "user_refresh_token",
    {
      verifyUser: false,
      verifyCompany: false,
    }
  ),
  signUp: new ActionsClass(Usuarios.signUp, "user_sign_up", {
    verifyUser: false,
    verifyCompany: false,
  }),
  confirmSignUp: new ActionsClass(
    Usuarios.confirmSignUp,
    "user_confirm_sign_up",
    {
      verifyUser: false,
      verifyCompany: false,
    }
  ),
  forgotPassword: new ActionsClass(
    Usuarios.forgotPassword,
    "user_forgot_password",
    {
      verifyUser: false,
      verifyCompany: false,
    }
  ),
  confirmRecover: new ActionsClass(
    Usuarios.confirmRecover,
    "user_forgot_password_confirm",
    {
      verifyUser: false,
      verifyCompany: false,
    }
  ),
  vincular: new ActionsClass(Usuarios.vincular, "user_validate", {
    verifyUser: false,
    verifyCompany: false,
  }),
  getUserCompanies: new ActionsClass(
    Usuarios.listar_empresa_usuario,
    "user_companies_load",
    { verifyCompany: false }
  ),
  getUserLogo: new ActionsClass(Usuarios.logo, "user_logo_load", {
    verifyCompany: false,
  }),
  getProfile: new ActionsClass(Usuarios.profile, "user_profile_load", {
    verifyCompany: false,
  }),
  putProfile: new ActionsClass(
    Usuarios.profileAtualizar,
    "user_profile_update",
    { verifyCompany: false }
  ),
  getSolicitacaoAssociado: new ActionsClass(
    Usuarios.verificaSolicitacaoAssociado,
    "user_request_associate_verify",
    { verifyCompany: false }
  ),
  setSolicitacaoAssociado: new ActionsClass(
    Usuarios.solicitacaoAssociado,
    "user_request_associate_new",
    { verifyCompany: false }
  ),
  responseSolicitacaoAssociado: new ActionsClass(
    Usuarios.solicitacaoAssociadoAvaliar,
    "user_request_associate_response",
    { verifyCompany: false, onlyPermissions: ["upgrade_associado"] }
  ),
};

const getAction = (event) => {
  const { resource } = event;

  if (event.httpMethod === "POST") {
    if (resource.includes("vincular")) {
      return ACTIONS.vincular;
    }
    // case insensitive
    if (resource.includes("login")) {
      return ACTIONS.signIn;
    }
    if (resource.includes("refreshToken")) {
      return ACTIONS.refreshToken;
    }
    if (resource.includes("register")) {
      return ACTIONS.signUp;
    }
    if (resource.includes("confirmRegister")) {
      return ACTIONS.confirmSignUp;
    }
    if (resource.includes("confirmRecover")) {
      return ACTIONS.confirmRecover;
    }
    if (resource.includes("recover")) {
      return ACTIONS.forgotPassword;
    }
    if (resource.includes("profile")) {
      return ACTIONS.putProfile;
    }
    if (resource.includes("associados")) {
      if (resource.includes("solicitacao")) {
        if (resource.includes("avaliar")) {
          return ACTIONS.responseSolicitacaoAssociado;
        }
        return ACTIONS.setSolicitacaoAssociado;
      }
    }
  }

  if (event.httpMethod === "GET") {
    if (resource.includes("login/sso")) {
      return ACTIONS.signInSSO;
    }
    if (resource.includes("profile")) {
      return ACTIONS.getProfile;
    }
    if (resource.includes("logo")) {
      return ACTIONS.getUserLogo;
    }
    if (resource.includes("empresas")) {
      return ACTIONS.getUserCompanies;
    }
    if (resource.includes("associados/solicitacao")) {
      return ACTIONS.getSolicitacaoAssociado;
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  console.info(event);
  return middleware(event, context, callback, action);
};

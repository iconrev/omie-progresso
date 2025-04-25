/* eslint-disable no-param-reassign */
const axios = require("axios");
const { cloneDeep } = require("lodash");
const { v4: uuidv4 } = require("uuid");
const forge = require("node-forge");
const Handler = require("../handler");
// const IconAuth = require("../../libs/icon-auth");
const userController = require("../../auth/userController");
const Logger = require("../../auth/logService");
const { loadTemplate } = require("../generico/EmailTemplate");
const Mail = require("../../auth/mailService");
const telegram = require("../../auth/telegramService");
const models = require("../../models");
const {
  validateToken,
  cognito,
  validateOmieToken,
} = require("../../auth/authorizer");

const { Usuario_Migrar, Usuario_Logo, Users_Roles } = models;
const { Empresas, Empresas_Premium, Roles } = models;
const { Usuario_Upgrade } = models;
const { sequelize } = models;
const { NODE_ENV } = process.env;

// TODO const privateKeyPem = process.env.PRIVATE_KEY
const privateKeyPem = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

const CACHED_BLACKLIST = {};
const env = process.env.NODE_ENV || "dev";

const getDataUser = async (event) => {
  try {
    const response = await validateToken(
      event.headers.Authorization.replace("Bearer ", "")
    );

    if (!response) return false;

    const payload = {};
    for (const item of response.UserAttributes) {
      payload[item.Name] = item.Value;
    }

    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createRoleDefault = async (user_id, role_id, role_name, action) => {
  const payload = {
    role_id,
    user_id,
  };

  const actionRole = cloneDeep(action);
  actionRole.title = "new_role";

  await Users_Roles.create(payload, { raw: true })
    .then(async () => {
      await Logger.setSuccessLog(actionRole, `Perfil: ${role_name}`);
      console.info("Role associada com sucesso");
    })
    .catch(async (error) => {
      await Logger.exceptionError(actionRole, error);
    });
};

const uuidGenerate = (clean = true) => {
  const value = uuidv4();
  return clean ? value.replace(/-/g, "") : value;
  // if (clean) {
  //   value = uuidv4().split("-").join("");
  // }
  // return value;
};

const companyExists = async (companyId) => {
  const filterCompany = {
    where: {
      id: companyId,
    },
    raw: true,
  };
  return Empresas.findOne(filterCompany);
};

const composeEmailResponseRequest = async (mailData, userUpgrade) => {
  let templateName = "RespostaUpgradeAssociado";
  if (mailData.resposta === "ACEITA") {
    templateName += "-aceita";
  } else {
    templateName += "-recusada";
  }

  const preview = NODE_ENV === "dev" ? "-preview" : "";
  const link = `https://simbiose${preview}.omie.com.br/#/login`;

  const body = await loadTemplate(templateName, {
    url_host: link,
    user: mailData.nome,
    response: mailData.resposta,
    color: mailData.status,
    api_stage: `https://api.simbiose${preview}.omie.com.br/service-base`,
    utm_campaign: "upgrade-associado",
    utm_id: uuidGenerate(false),
    utm_term: `admin-upgrade-associado-${mailData.resposta.toLowerCase()}`,
    utm_content: userUpgrade,
  });

  const subject = `Omie Simbiose - Retorno Solicitação Associado`;

  return {
    to: mailData.email,
    subject,
    body,
  };
};

const arrayToObject = (arrKeys, valuesBase) => {
  const rv = {};
  for (const item of arrKeys) {
    rv[item] = valuesBase[item];
  }
  return rv;
};

const getLogo = async (userId) => {
  const query =
    `SELECT  Usuario_Migrar.nome, Usuario_Migrar.cognito_id, Usuario_Logo.Logo ` +
    `FROM Usuario_Logo inner JOIN Usuario_Migrar ON Usuario_Logo.UserId = Usuario_Migrar.cognito_id ` +
    `WHERE Usuario_Migrar.id = :user `;
  const response = await userController.raw_query(query, { user: userId });
  return response.length > 0 ? response[0].Logo : null;
};

function base64ToString(base64Str) {
  // Usa o método Buffer.from() para decodificar a string base64
  const decodedString = Buffer.from(base64Str, "base64").toString("utf-8");
  return decodedString;
}

function RSABase64ToString(string) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedData = forge.util.decode64(string);
  const decryptedData = privateKey.decrypt(encryptedData, "RSA-OAEP");
  return decryptedData;
}

module.exports.signIn = async (event, action) => {
  console.log("------------ INÍCIO DO LOGIN NO COGNITO ------------");
  try {
    const { auth } = JSON.parse(event.body);

    console.log("auth -> ", auth);
    if (!auth) {
      console.log("------------ AUTH TOKEN NÃO ENCONTRADO ------------");
      return Handler.Unauthenticated();
    }
    if (CACHED_BLACKLIST[auth]) {
      console.log("------------ AUTH TOKEN JÁ ESTÁ NA BLACKLIST ------------");
      return Handler.Unauthorized();
    }

    const decryptedAuth = RSABase64ToString(auth);

    const { email, password, timestamp } = JSON.parse(decryptedAuth);

    const timestampDateObj = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const diff = currentTime - timestampDateObj;
    const valid_duration = 15 * 60 * 1000;

    if (diff > valid_duration) {
      return Handler.Unauthorized();
    }

    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID, // 3dd01cl8761uq0khc8hnf4cll1 qa-local
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const response = await cognito.initiateAuth(params).promise();

    if (!response.AuthenticationResult) {
      return Handler.Unauthenticated();
    }

    console.log("------------ FIM DO LOGIN NO COGNITO -----------");
    return Handler.Ok(response);
  } catch (exception) {
    console.log("signIn exception");
    console.log(exception);
    return Handler.Unauthenticated();
  }
};

module.exports.signInSSO = async (event, action) => {
  console.log("------------ INÍCIO DO LOGIN NO SSO ------------");
  try {
    console.info(event);
    console.info(action);
    console.info(env);

    const { token } = event.pathParameters;

    console.info("token", token);

    const url =
      env === "prod"
        ? "https://app.omie.com.br/login/oauth2/validate/"
        : "https://appdsv.omie.com.br/login/oauth2/validate/";

    const urlFull = `${url}?code=${token}`;
    console.info("urlFull", urlFull);

    const response = await axios.get(urlFull);
    console.info("response", response.data);
    // const response = {
    //   data: {
    //     auth_by: 'dian@omie.com.br',
    //     token_type: 'Bearer',
    //     expires_in: 172800,
    //     scope: 'openid profile offline_access',
    //     state: '',
    //     apps: [],
    //     access_token: '',
    //     refresh_token: ''
    //   }
    // }

    if (!response || !response.data) return Handler.Unauthenticated();

    const userData = await validateOmieToken(response.data.access_token);

    if (!userData) return Handler.Unauthenticated();

    const { id, email, first_name, last_name, refresh_token } = userData;

    const payload = {
      id: id,
      email: email,
      name: first_name,
      family_name: last_name,
    };
    console.log("vincular usuario no sistema(SSO)", response.data);
    const responseVincular = await this.vincularSSO(payload);
    console.info("responseVincular SSO", responseVincular);

    if (responseVincular && responseVincular.status === "success") {
      const responseData = {
        status: "success",
        message: "Usuário vinculado com sucesso",
        access_token: response.data.access_token,
        refresh_token: refresh_token,
        attributes: responseVincular.attributes,
        onboard: responseVincular.onboard,
        admin: responseVincular.admin,
        profile: responseVincular.profile,
        contador: responseVincular.contador,
        auth_by: email,
      };
      console.log("responseData", responseData);
      console.log("------------ FIM DO LOGIN NO SSO -----------");
      return Handler.Ok(responseData);
    }

    return Handler.Unauthenticated();
  } catch (exception) {
    console.log("signIn exception");
    console.log(exception);
    return Handler.Unauthenticated();
  }
};

module.exports.refreshToken = async (event, action) => {
  try {
    const { refreshToken } = JSON.parse(event.body);
    const params = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };
    return Handler.Ok(await cognito.initiateAuth(params).promise());
  } catch (exception) {
    console.log("refreshToken exception");
    console.error(exception);
    return this.refreshTokenV2(event, action);
  }
};

module.exports.refreshTokenV2 = async (event, action) => {
  try {
    console.log("refreshTokenV2");
    console.info(event);
    console.info(action);
    console.info(env);

    const urlRefresh =
      env === "prod"
        ? "https://app.omie.com.br/api/portal/users/refresh-token/"
        : "https://appdsv.omie.com.br/api/portal/users/refresh-token/";

    const { refreshToken } = JSON.parse(event.body);
    const current_token = event.headers.Authorization.replace("Bearer ", "");
    console.log("current_token", current_token);
    const response = await axios.post(urlRefresh, {
      token: current_token,
      refresh_token: refreshToken,
    });
    console.log("response refreshTokenV2", response.data);
    if (!response || !response.data) return Handler.Unauthenticated();

    const { token, refresh_token } = response.data;
    const AuthenticationResult = {
      AccessToken: token,
      RefreshToken: refresh_token,
    };

    return Handler.Ok({ AuthenticationResult });
  } catch (exception) {
    console.log("refreshToken exception");
    console.error(exception);
    return Handler.Unauthenticated();
  }
};

module.exports.signOut = async (event, action) => {
  try {
    const { accessToken } = JSON.parse(event.body);
    const params = {
      AccessToken: accessToken,
    };
    return Handler.Ok(await cognito.globalSignOut(params).promise());
  } catch (exception) {
    console.log("signOut exception");
    console.error(exception);
    return Handler.Unauthenticated();
  }
};

module.exports.signUp = async (event, action) => {
  try {
    const { email, password, name, family_name } = JSON.parse(event.body);
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: RSABase64ToString(password),
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "name",
          Value: name,
        },
        {
          Name: "family_name",
          Value: family_name,
        },
      ],
    };
    const response = await cognito.signUp(params).promise();
    return Handler.Ok(response);
  } catch (exception) {
    console.log("signUp exception");
    console.error(exception);

    if (exception.code === "InvalidPasswordException") {
      return Handler.Fail({
        message: "A senha fornecida não satisfaz as exigências de segurança :(",
      });
    }

    if (exception.code === "UsernameExistsException") {
      return Handler.Fail({
        message: "E-mail já cadastrado",
      });
    }

    return Handler.Fail();
  }
};

module.exports.confirmSignUp = async (event, action) => {
  try {
    const { email, code } = JSON.parse(event.body);
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    };
    const response = await cognito.confirmSignUp(params).promise();
    return Handler.Ok(response);
  } catch (exception) {
    console.error(exception);
    console.log("confirmSignUp exception");
    return Handler.Fail();
  }
};

module.exports.forgotPassword = async (event, action) => {
  try {
    const { email } = JSON.parse(event.body);
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    };
    const response = await cognito.forgotPassword(params).promise();
    return Handler.Ok(response);
  } catch (exception) {
    console.log("forgotPassword exception");
    console.error(exception);

    if (exception.code.includes("LimitExceededException")) {
      return Handler.Fail({
        message:
          "O limite de alterações de senha diárias foi excedido. Tente novamente mais tarde.",
      });
    }

    return Handler.Fail({
      message:
        "Não foi possível fazer a recuperação da senha nesse momento. :(",
      errorCode: exception.code,
    });
  }
};

module.exports.confirmRecover = async (event, action) => {
  try {
    const { email, code, password } = JSON.parse(event.body);
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: RSABase64ToString(password),
    };
    const response = await cognito.confirmForgotPassword(params).promise();
    return Handler.Ok(response);
  } catch (exception) {
    console.log("confirmForgotPassword exception");
    console.error(exception);

    if (exception.code.includes("ExpiredCodeException")) {
      return Handler.Fail({
        message:
          "O código que você forneceu, é um código expirado ou inválido :(... solicite outro código.",
      });
    }
    if (exception.code.includes("LimitExceededException")) {
      return Handler.Fail({
        message:
          "O limite de alterações de senha diárias foi excedido. Tente novamente mais tarde.",
      });
    }
    if (exception.code.includes("InvalidPasswordException")) {
      return Handler.Fail({
        message: "A senha fornecida não satisfaz as exigências de segurança :(",
      });
    }

    return Handler.Fail({
      message:
        "Não foi possível fazer a recuperação da senha nesse momento. :(",
      errorCode: exception.code,
    });
  }
};

module.exports.changePassword = async (event, action) => {
  try {
    const { accessToken, previousPassword, proposedPassword } = JSON.parse(
      event.body
    );
    const params = {
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    };
    return Handler.Ok(await cognito.changePassword(params).promise());
  } catch (exception) {
    console.log("changePassword exception");
    return Handler.Unauthenticated();
  }
};

module.exports.vincular = async (event, action) => {
  try {
    console.info("------------ INÍCIO DO VINCULAR ------------");
    console.info("EVENT ->", event);

    const payload = await getDataUser(event);
    console.info("getUserAttributes->vincular", payload);

    if (!payload) return Handler.Unauthenticated();

    const filter = {
      include: [
        {
          model: Roles,
          as: "roles",
          through: {
            attributes: [],
          },
          attributes: ["name", "id"],
        },
      ],
      where: {
        cognito_id: payload.sub,
      },
      raw: true,
    };
    const usuario = await Usuario_Migrar.findOne(filter);

    let onboard;
    let userId;
    let admin = false;
    let profile;
    let contador;

    if (!usuario) {
      const data = {
        id: uuidGenerate(),
        nome: `${payload.name} ${payload.family_name}`,
        email: payload.email.toLowerCase(),
        cognito_id: payload.sub,
        onboard: true,
      };

      const body = JSON.parse(event.body);
      if (body) {
        if (body.contador !== undefined) {
          data.contador = body.contador ? 1 : 0;
        }
      }

      const response = await Usuario_Migrar.create(data, { raw: true });

      onboard = true;
      action.user = response;
      userId = data.id;
      await Logger.setSuccessLog(action, `Cadastro no sistema`);

      if (data.email.includes("@omie")) {
        profile = "omie";
        await createRoleDefault(userId, "5", profile, action);
      } else {
        profile = "user_default";
        await createRoleDefault(userId, "4", profile, action);
      }

      contador = response.contador;

      let messageTelegram = "Novo usuário cadastrado:\n\n";
      messageTelegram += `<b>Nome:</b> ${data.nome}\n`;
      messageTelegram += `<b>E-mail:</b> ${data.email}\n`;
      telegram.SendMessageAdm(messageTelegram);
    } else {
      action.user = usuario;
      userId = usuario.id;

      if (usuario["roles.name"] === null) {
        if (usuario.email.toLowerCase().includes("@omie")) {
          profile = "omie";
          await createRoleDefault(userId, "5", profile, action);
        } else {
          profile = "user_default";
          await createRoleDefault(userId, "4", profile, action);
        }
      } else {
        profile = usuario["roles.name"];
      }

      if (usuario.email.toLowerCase().includes("@omie")) {
        if (profile === "user_default" || profile === "associado") {
          const updateDataUserRole = {
            role_id: 5,
          };
          const filterUserRole = {
            where: {
              role_id: usuario["roles.id"],
              user_id: usuario.id,
            },
          };
          await Users_Roles.update(updateDataUserRole, filterUserRole);
          await Logger.setSuccessLog(
            action,
            `Perfil do usuário [${usuario.nome}] alterado para omie`
          );
          profile = "omie";
        }
      }

      contador = usuario.contador === 1;
    }

    const promiseLog = Logger.setSuccessLog(
      action,
      `Carregando dados do usuário`
    );
    const isAuthorizedPromise = userController.validatePermission(userId, [
      "acesso_administrativo",
    ]);

    await promiseLog;
    const isAuthorized = await isAuthorizedPromise;
    if (isAuthorized) {
      admin = true;
    }

    return Handler.Ok({
      status: "success",
      message: "Usuário vinculado",
      onboard,
      admin,
      profile,
      contador,
      attributes: payload,
    });
  } catch (exception) {
    return Handler.Exception(action, exception);
  }
};

module.exports.vincularSSO = async (vincularPayload) => {
  const action = {};
  try {
    console.info("------------ INÍCIO DO VINCULAR SSO OMIE ------------");
    console.info("PAYLOAD ->", vincularPayload);

    const payload = {
      sub: vincularPayload.id,
      email: vincularPayload.email,
      name: vincularPayload.name,
      family_name: vincularPayload.family_name,
    };

    console.info("getUserAttributes->vincular SSO", payload);

    const filter = {
      include: [
        {
          model: Roles,
          as: "roles",
          through: {
            attributes: [],
          },
          attributes: ["name", "id"],
        },
      ],
      where: {
        email: payload.email,
      },
      raw: true,
    };
    const usuario = await Usuario_Migrar.findOne(filter);
    console.info("usuario =>", usuario);

    let onboard;
    let userId;
    let admin = false;
    let profile;
    let contador;

    if (!usuario) {
      const data = {
        id: uuidGenerate(),
        nome: `${payload.name} ${payload.family_name}`,
        email: payload.email.toLowerCase(),
        cognito_id: payload.sub,
        onboard: true,
        // Todo usuário que vier via SSO será considerado contador
        contador: 1,
      };

      const response = await Usuario_Migrar.create(data, { raw: true });

      onboard = true;
      action.user = response;
      userId = data.id;
      await Logger.setSuccessLog(action, `Cadastro no sistema`);

      if (data.email.includes("@omie")) {
        profile = "omie";
        await createRoleDefault(userId, "5", profile, action);
      } else {
        profile = "user_default";
        await createRoleDefault(userId, "4", profile, action);
      }

      contador = response.contador;

      let messageTelegram = "Novo usuário cadastrado:\n\n";
      messageTelegram += `<b>Nome:</b> ${data.nome}\n`;
      messageTelegram += `<b>E-mail:</b> ${data.email}\n`;
      telegram.SendMessageAdm(messageTelegram);
    } else {
      action.user = usuario;
      userId = usuario.id;

      if (usuario["roles.name"] === null) {
        if (usuario.email.toLowerCase().includes("@omie")) {
          profile = "omie";
          await createRoleDefault(userId, "5", profile, action);
        } else {
          profile = "user_default";
          await createRoleDefault(userId, "4", profile, action);
        }
      } else {
        profile = usuario["roles.name"];
      }

      if (usuario.email.toLowerCase().includes("@omie")) {
        if (profile === "user_default" || profile === "associado") {
          const updateDataUserRole = {
            role_id: 5,
          };
          const filterUserRole = {
            where: {
              role_id: usuario["roles.id"],
              user_id: usuario.id,
            },
          };
          await Users_Roles.update(updateDataUserRole, filterUserRole);
          await Logger.setSuccessLog(
            action,
            `Perfil do usuário [${usuario.nome}] alterado para omie`
          );
          profile = "omie";
        }
      }

      contador = usuario.contador === 1;
    }

    const promiseLog = Logger.setSuccessLog(
      action,
      `Carregando dados do usuário SSO`
    );
    const isAuthorizedPromise = userController.validatePermission(userId, [
      "acesso_administrativo",
    ]);

    await promiseLog;
    const isAuthorized = await isAuthorizedPromise;
    if (isAuthorized) {
      admin = true;
    }

    return {
      status: "success",
      message: "Usuário vinculado",
      onboard: onboard,
      admin: admin,
      profile: profile,
      contador: contador,
      attributes: payload,
    };
  } catch (exception) {
    console.error(exception);
    return null;
  }
};

module.exports.listar_empresa_usuario = async (event, action) => {
  const user = action.user.id;

  try {
    let filter = "";
    if (event.queryStringParameters) {
      const { ativas } = event.queryStringParameters;
      if (ativas === "true") {
        filter = "AND Empresas.active = 1";
      }
    }

    let query = `
    SELECT 
        Empresas.id, Empresas.nome, Empresas.cnpj, Empresas.active, Empresa_Usuarios.owner,
        case
          when Empresas_Premium.empresa_homologada = 0 and Empresas_Premium.data_final_premium is null then true
          when Empresas_Premium.empresa_homologada = 1 then true
          when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
          else false
        end as is_premium,
        case
          when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
            else false
        end as is_trial,
        case
          when Empresas_Premium.empresa_homologada = 1 and Empresa_Usuarios.owner = 1 then true
            else false
        end as is_associada,
        Empresas_Premium.data_final_premium
    FROM 
        Empresa_Usuarios
        INNER JOIN Empresas ON Empresa_Usuarios.EmpresaId = Empresas.id   
        LEFT OUTER JOIN Empresas_Premium ON (Empresa_Usuarios.EmpresaId = Empresas_Premium.company_id 
          AND (Empresas_Premium.data_final_premium >= NOW() OR Empresas_Premium.data_final_premium is null)) 
    WHERE 
        Empresa_Usuarios.UsuarioId = :userId
        AND Empresa_Usuarios.active = 1 ${filter}
    ORDER BY
        Empresas.nome
    `;
    const empresas = await userController.raw_query(query, { userId: user });

    const empresas_clean = [];

    query = `
      SELECT  RC.name as role
      FROM Users_Roles_Company URC
          LEFT JOIN Roles_Company RC ON URC.role_company_id = RC.id 
      WHERE
          URC.user_id = :userId
          AND URC.company_id = :companyId      
    `;
    const loadEmpresa = async (empresa) => {
      if (empresa.owner) {
        empresas_clean.push(empresa);
        return;
      }
      const roles = await userController.raw_query(query, {
        userId: user,
        companyId: empresa.id,
      });
      const rolesClean = [];
      roles.map((item) => rolesClean.push(item.role));
      empresas_clean.push({
        ...empresa,
        roles: rolesClean,
      });
    };

    await Promise.all(empresas.map(loadEmpresa));
    await Logger.setSuccessLog(action, `Buscando empresas do usuário`);

    return Handler.Ok({
      status: "success",
      companies: empresas_clean,
    });
  } catch (exception) {
    return Handler.Exception(action, exception);
  }
};

module.exports.logo = async (event, action) => {
  console.log("------------ INÍCIO DA BUSCA DO LOGO ------------");
  try {
    console.info(event);
    console.info(action);

    const logo = await getLogo(action.user.id);

    return Handler.Ok({
      logo,
    });
  } catch (exception) {
    return Handler.Exception(action, exception);
  }
};

module.exports.profile = async (event, action) => {
  try {
    const { user } = action;
    const logo = await getLogo(user.id);
    await Logger.setSuccessLog(action, `Carregando dados do usuário`);
    return Handler.Ok({
      user: {
        nome: user.nome,
        email: user.email,
        contador: user.contador,
        logo,
      },
    });
  } catch (exception) {
    return Handler.Exception(action, exception);
  }
};

module.exports.profileAtualizar = async (event, action) => {
  try {
    const body = JSON.parse(event.body);
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return Handler.BadRequest({
        message: "Nenhum campo enviado para atualização",
      });
    }

    const { user } = action;

    const fieldsUpdate = [];
    let fieldsUpdateSuccess = [];
    const fieldsUpdateError = [];

    for (const field of fields) {
      if (field === "email") continue;
      if (field === "logo") continue;
      if (body[field] !== user[field]) {
        fieldsUpdate.push(field);
      }
    }

    if (fieldsUpdate.length > 0) {
      const updateUser = arrayToObject(fieldsUpdate, body);
      const filterUser = {
        where: {
          id: user.id,
        },
        raw: true,
      };
      await Usuario_Migrar.update(updateUser, filterUser)
        .then(() => {
          console.info(action, "Usuário atualizado com sucesso");
          fieldsUpdateSuccess = [...fieldsUpdate];
        })
        .catch((err) => {
          console.error(action, "ERRO CADASTRO:", err);
          fieldsUpdateError.concat(fieldsUpdate);
        });
    }

    if (body.logo) {
      const logoUser = await getLogo(user.id);

      if (logoUser !== null) {
        if (body.logo !== logoUser) {
          fieldsUpdate.push("logo");
          const logoModel = {
            Logo: body.logo,
          };
          const filterLogo = {
            where: {
              UserId: user.cognito_id,
            },
            raw: true,
          };
          await Usuario_Logo.update(logoModel, filterLogo)
            .then(() => {
              console.info(
                action,
                "Logotipo do usuário atualizado com sucesso"
              );
              fieldsUpdateSuccess.push("logo");
            })
            .catch((err) => {
              console.error(action, "ERRO LOGO:", err);
              fieldsUpdateError.push("logo");
            });
        }
      } else {
        const logoModel = {
          Logo: body.logo,
          UserId: user.cognito_id,
        };
        await Usuario_Logo.create(logoModel)
          .then(() => {
            fieldsUpdate.push("logo");
            console.info(action, "Logotipo do usuário criado com sucesso");
            fieldsUpdateSuccess.push("logo");
          })
          .catch((err) => {
            console.error(action, "ERRO LOGO:", err);
            fieldsUpdateError.push("logo");
          });
      }
    }

    let status;
    let message;
    let log;

    if (
      fieldsUpdate.length === fieldsUpdateError.length &&
      fieldsUpdate.length > 0
    ) {
      status = "fatal_error";
      message = "Não foi possível atualizar o perfil";
      log = `${message} [${fieldsUpdateError.join(", ")}]`;
    } else if (
      fieldsUpdateSuccess.length === 0 &&
      fieldsUpdateError.length > 0
    ) {
      status = "fatal_error";
      message = "Não foi possível atualizar o perfil";
      log = `${message} [${fieldsUpdateError.join(", ")}]`;
    } else if (fieldsUpdateError.length > 0 && fieldsUpdateSuccess.length > 0) {
      status = "warning";
      message = `O campo a seguir não pode ser salvo: ${fieldsUpdateError.join(
        ", "
      )}`;
      log = message;
    } else if (
      fieldsUpdateSuccess.length > 0 &&
      fieldsUpdateError.length === 0
    ) {
      status = "success";
      message = `Perfil atualizado com sucesso`;
      log = `${message} [${fieldsUpdateSuccess.join(", ")}]`;
    } else {
      status = "success";
      message = `Perfil atualizado com sucesso`;
      log = `Nenhum campo foi necessário atualizar. Campos enviados: ${fields.join(
        ", "
      )}`;
    }

    await Logger.setLog(action, status, log);

    if (status !== "success") {
      return Handler.Error({
        status,
        message,
      });
    }

    return Handler.Ok({
      status,
      message,
    });
  } catch (exception) {
    return Handler.Exception(action, exception);
  }
};

module.exports.verificaSolicitacaoAssociado = async (event, action) => {
  const { user } = action;

  if (!user.contador) return Handler.Unauthorized();

  let status;
  let message;
  let comment;
  let approver_date;

  const filterSolicitacao = {
    where: {
      user_id: user.id,
    },
    order: [["createdAt", "DESC"]],
    raw: true,
  };
  const previousRequest = await Usuario_Upgrade.findAll(filterSolicitacao);

  if (previousRequest.length === 0) {
    status = "success";
    message = "Nenhuma solicitação pendente";
  } else {
    const lastStatus = previousRequest[0].status;
    if (lastStatus === 0) {
      status = "pending_request";
      message = "Sua solicitação está em análise.";
    } else if (lastStatus === 2) {
      status = "rejected_request";
      message = "Sua solicitação foi recusada";
      comment = previousRequest[0].comment;
      approver_date = previousRequest[0].approver_date;
    } else {
      status = "accept_request";
      message = "Sua solicitação foi aceita";
      approver_date = previousRequest[0].approver_date;
    }
  }

  return Handler.Ok({
    status,
    message,
    comment,
    approver_date,
  });
};

module.exports.solicitacaoAssociado = async (event, action) => {
  const { user } = action;

  if (!user.contador) {
    await Logger.setLog(
      action,
      "unauthorized",
      `Tentativa não autorizada de cadastro de solicitação de upgrade para usuário que não é contador.`
    );
    return Handler.Unauthorized(action, {}, {}, false);
  }

  let { user_id } = JSON.parse(event.body);
  const { name, phone, crc, company_id } = JSON.parse(event.body);

  if (!name || name.length < 5) {
    return Handler.BadRequest({
      status: "invalid_parameter_name",
      message: "Nome do solicitante deve ter ao menos 5 caracteres",
    });
  }

  if (!phone || phone.length < 7) {
    return Handler.BadRequest({
      status: "invalid_parameter_phone",
      message: "Telefone inválido",
    });
  }

  if (!crc || crc.length < 5) {
    return Handler.BadRequest({
      status: "invalid_parameter_crc",
      message: "Número do CRC/CPF inválido",
    });
  }

  if (!company_id || company_id.length < 5) {
    return Handler.BadRequest({
      status: "invalid_parameter_company",
      message: "Deve-se selecionar a Empresa Associada Premium",
    });
  }

  if (user_id) {
    const userData = await userController.getUserById(user_id);

    if (!userData) {
      return Handler.BadRequest({
        status: "user_not_found",
        message: "Usuário não localizado",
      });
    }
  } else {
    user_id = user.id;
  }

  const filterCompany = {
    where: {
      id: company_id,
    },
    raw: true,
  };
  const company = await Empresas.findOne(filterCompany);
  if (!company) {
    return Handler.BadRequest({
      status: "company_not_found",
      message: "Empresa não localizada",
    });
  }

  const filterSolicitacao = {
    where: {
      user_id,
      status: 0,
    },
    raw: true,
  };
  const previousRequest = await Usuario_Upgrade.findOne(filterSolicitacao);
  if (previousRequest) {
    await Logger.setLog(
      action,
      "request_duplicate",
      `Solicitação de Associado pendente`
    );
    return Handler.BadRequest({
      message: "Já existe uma solicitação pendente para o usuário",
    });
  }

  const newRequest = {
    user_id,
    company_id,
    name,
    phone,
    crc,
    status: 0,
  };
  await Usuario_Upgrade.create(newRequest, { raw: true });

  let messageTelegram = "Nova solicitação de Upgrade:\n\n";
  messageTelegram += `<b>Nome:</b> ${user.nome}\n`;
  messageTelegram += `<b>E-mail:</b> ${user.email}\n`;
  messageTelegram += `<b>Empresa Associada:</b> ${company.nome}\n`;
  messageTelegram += `<b>CNPJ:</b> ${company.cnpj}\n`;
  messageTelegram += `<b>CRC/CPF:</b> ${newRequest.crc}\n`;
  messageTelegram += `<b>Telefone:</b> ${newRequest.phone}\n`;
  await telegram.SendMessageAdm(messageTelegram);

  const usersMail = await userController.getUsersByPermission([
    "email_new_upgrade_associado",
  ]);
  if (usersMail.length > 0) {
    const emails = usersMail.map((userMail) => userMail.email);
    const body = messageTelegram.replace(/\n/g, "<br/>");
    await Mail.sendMail({
      bcc: emails,
      subject: "Solicitação de Upgrade Associado",
      body,
    });
  }

  await Logger.setSuccessLog(action, `Solicitação de Upgrade para Associado`);

  return Handler.Ok({
    status: "success",
    message: "Solicitação enviada com sucesso",
  });
};

module.exports.solicitacaoAssociadoAvaliar = async (event, action) => {
  const { user } = action;

  const { user_id, company_id, status, comment } = JSON.parse(event.body);

  if (status === "2" && comment.length < 3) {
    await Logger.setLog(
      action,
      "bad_request",
      `Ausência de motivo para rejeitar solicitação de upgrade`
    );
    return Handler.BadRequest({
      message:
        "Para rejeitar uma solicitação é necessário informar os motivos no comentário.",
    });
  }

  const status_extenso = status === "1" ? "aceit" : "recusad";

  const userUpgrade = await userController.getUserById(user_id);
  if (!userUpgrade) {
    await Logger.setLog(action, "bad_request", `Usuário não localizado`);
    return Handler.BadRequest({
      message: "Usuário não localizado",
    });
  }

  const companyUpgrade = await companyExists(company_id);
  if (!companyUpgrade) {
    await Logger.setLog(action, "bad_request", `Empresa não localizada`);
    return Handler.BadRequest({
      message: "Empresa não localizada",
    });
  }

  // verifica se tem pedido, se tiver pedido, atualiza com a resposta
  const filterSolicitacao = {
    where: {
      user_id,
      status: 0,
    },
    raw: true,
  };
  const previousRequest = await Usuario_Upgrade.findOne(filterSolicitacao);
  if (previousRequest) {
    const updateData = {
      status,
      comment,
      approver_name: user.nome,
      approver_date: sequelize.literal("CURRENT_TIMESTAMP"),
    };
    await Usuario_Upgrade.update(updateData, filterSolicitacao);
    await Logger.setSuccessLog(
      action,
      `Solicitação de upgrade de [${userUpgrade.nome}] ${status_extenso}a `
    );
  }

  // altera o perfil do usuário para associado se o pedido foi aceito
  if (status === "1") {
    const updateDataUserRole = {
      role_id: 3,
    };
    const filterUserRole = {
      where: {
        role_id: 4,
        user_id,
      },
    };
    await Users_Roles.update(updateDataUserRole, filterUserRole);
    await Logger.setSuccessLog(
      action,
      `Perfil do usuário [${userUpgrade.nome}] alterado para associado`
    );

    // faz a homologação da empresa.
    // primeiro verifica se a empresa já é PREMIUM
    // se for premio atualiza, se for start cadastra
    const filterEmpresaPremium = {
      where: {
        company_id,
      },
      raw: true,
    };
    const companyIsPremium = await Empresas_Premium.findOne(
      filterEmpresaPremium
    );
    const dataPremium = {
      company_id,
      data_inicio_premium: new Date(),
      data_final_premium: null,
      empresa_homologada: "1",
    };
    if (companyIsPremium) {
      await Empresas_Premium.update(dataPremium, filterEmpresaPremium);
    } else {
      await Empresas_Premium.create(dataPremium);
    }
    await Logger.setSuccessLog(
      action,
      `Empresa [${companyUpgrade.nome}] ativada como Premium Associada`
    );
  }

  let messageTelegram = "Resultado da solicitação de Upgrade:\n\n";
  messageTelegram += `<b>Solicitante:</b> ${userUpgrade.nome}\n`;
  messageTelegram += `<b>E-mail:</b> ${userUpgrade.email}\n`;
  messageTelegram += "\n";
  messageTelegram += `<b>Avaliador:</b> ${user.nome}\n`;
  messageTelegram += `<b>E-mail:</b> ${user.email}\n`;
  messageTelegram += "\n";
  messageTelegram += `<b>Resultado:</b> ${
    status === "1" ? "ACEITA" : "RECUSADA"
  }`;
  await telegram.SendMessageAdm(messageTelegram);

  // envia e-mail informando a resposta da avaliação
  const mailData = {
    nome: userUpgrade.nome,
    email: userUpgrade.email,
    resposta: status === "1" ? "ACEITA" : "RECUSADA",
    status: status === "1" ? "success" : "danger",
  };
  const emailCompose = await composeEmailResponseRequest(
    mailData,
    userUpgrade.id
  );
  const statusSendMail = await Mail.sendMail(emailCompose);
  if (!statusSendMail) {
    return Handler.Error({
      message: `Não foi possível enviar o e-mail para ${mailData.convite.nome} (${mailData.convite.email})`,
    });
  }

  return Handler.Ok({
    status: "success",
    message: `Solicitação ${status_extenso}a com sucesso`,
  });
};

module.exports.getLogo = getLogo;

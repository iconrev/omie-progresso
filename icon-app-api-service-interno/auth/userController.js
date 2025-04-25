/* eslint-disable max-len */
const env = process.env.NODE_ENV || "dev";
const { QueryTypes } = require("sequelize");
const { setLog } = require("./logService");

const models = require("../models");
const { validateToken } = require("./authorizer");

const { sequelize } = models;
const { Empresas, Empresa_Usuarios, Usuario_Migrar } = models;
const { Permissions, Roles, Empresa_Responsaveis } = models;
const { Empresas_Premium } = models;

const call_procedure = async (procedureName, parameters = []) => {
  let parametersProcedure = "";
  if (parameters.length > 0) {
    const parametersClean = [];
    parameters.map((item) => parametersClean.push(`"${item}"`));
    parametersProcedure = parametersClean.join(", ");
  }
  const query = `CALL ${procedureName}(${parametersProcedure});`;
  await sequelize
    .query(query)
    .then(() => console.info("Procedure executada com sucesso"))
    .catch((error) => console.error("Erro ao executar procedure:", error));
};

const raw_query = async (query, parameters) => {
  let response = null;

  await sequelize
    .query(query, { replacements: parameters, type: QueryTypes.SELECT })
    .then((responseQuery) => {
      response = responseQuery;
    })
    .catch((error) => {
      console.error(error);
    });

  return response;
};

const parserEvent = (event) => {
  // if (env === "dev" || env === "prod-local" || env === "qa-local") {
  //   if (event.path === "/api/bot")
  //     return "18d1190a-5802-498a-b9cc-f5bbd92a6a5b";
  //   return event.headers.user_id;
  // }
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const parts = authProvider.split(":");
  const userPoolUserId = parts[parts.length - 1];
  console.info("userPoolUserId ->", userPoolUserId);
  return userPoolUserId;
};

module.exports.raw_query = async (query, parameters) =>
  raw_query(query, parameters);

module.exports.getUserFromEvent = async (event) => {
  try {
    return parserEvent(event);
  } catch (e) {
    console.error("getUserFromEvent ->", e);
    return null;
  }
};

module.exports.getCognitoIdUser = (event) => parserEvent(event);

module.exports.getUserWhere = async (where) =>
  Usuario_Migrar.findOne({
    where,
    raw: true,
  });

module.exports.getUser = async (event, allInfo = false) => {
  let user;

  try {
    const userToken = await validateToken(event.headers.Authorization);
    let cognito_user_id_event = userToken ? userToken.Username : null;
    if (!cognito_user_id_event) {
      cognito_user_id_event = userToken ? userToken.email : null;
    }
    console.info("getUser userToken ->", userToken);
    if (cognito_user_id_event) {
      const field = (userToken.scope === "cognito") ? "cognito_id" : "email";
      const userResponse = await this.getUserWhere({
        [field]: cognito_user_id_event,
      });
      if (userResponse) {
        user = allInfo ? userResponse : userResponse.id;
      } else {
        console.error("logService-getUser", "Usuário NÃO encontrado");
      }
    }
  } catch (e) {
    console.error("logService-getUser", e);
    console.error("event", event);
  }

  return user;
};

module.exports.getUserById = async (userId) =>
  this.getUserWhere({ id: userId });

module.exports.getUserByCognitoId = async (cognitoId) =>
  this.getUserWhere({ cognito_id: cognitoId });

module.exports.getUserBot = async (chatId) =>
  chatId === 1018636294 ? "18d1190a-5802-498a-b9cc-f5bbd92a6a5b" : false;

module.exports.findUserByEmail = async (email) => {
  const query = `SELECT * FROM Usuario_Migrar WHERE email = :email`;
  const parameters = {
    email,
  };
  return raw_query(query, parameters);
};

module.exports.validateUserInCompany = async (
  userId,
  companyId,
  onlyOwner = false,
  allowAssociado = false,
  allowAssociadoNivel2 = false,
  allowSuperadmin = true
) => {
  if (typeof userId === "object") {
    userId = userId.id;
  }

  let response = false;

  const query = {
    include: [
      {
        model: Empresas,
        attributes: ["id", "nome", "cnpj", "active", "createdAt"],
        where: {
          id: companyId,
        },
      },
    ],
    attributes: ["owner"],
    where: {
      EmpresaId: companyId,
      UsuarioId: userId,
      active: 1,
    },
    raw: true,
  };

  await Empresa_Usuarios.findOne(query).then(async (empresa) => {
    if (empresa) {
      if (onlyOwner) {
        if (!empresa.owner) {
          const hasPermission = await raw_query(
            `
            SELECT 
                Empresa_Usuarios.EmpresaId
            FROM
                Empresa_Usuarios    
                INNER JOIN Users_Roles_Company ON Empresa_Usuarios.EmpresaId = Users_Roles_Company.company_id
                AND Empresa_Usuarios.UsuarioId = Users_Roles_Company.user_id
                INNER JOIN Roles_Company ON Users_Roles_Company.role_company_id = Roles_Company.id
            WHERE
                Empresa_Usuarios.UsuarioId = :userId
                AND (Roles_Company.name = 'company_admin'
                ${allowAssociado ? 'OR Roles_Company.name = "associado"' : ""}
                ${
                  allowAssociadoNivel2
                    ? 'OR Roles_Company.name = "associado_nivel_2"'
                    : ""
                }
                )
                AND Empresa_Usuarios.EmpresaId = :companyId
            `,
            {
              userId,
              companyId,
            }
          );
          response = !!(hasPermission.length > 0);
        } else {
          response = true;
        }
      } else {
        response = true;
      }
    }

    if (!response && allowSuperadmin) {
      response = await this.validateProfile(userId, ["superadmin"]);
      if (response) {
        console.info("-------------------------------------");
        console.info("---> Acessando como superadmin <---");
        console.info("-------------------------------------");
      }
    }
  });

  return response;
};

module.exports.findUserInCompanyByEmail = async (companyId, email) => {
  const query = `
    SELECT * 
    FROM Empresa_Usuarios
        INNER JOIN Usuario_Migrar ON 
        (Empresa_Usuarios.UsuarioId = Usuario_Migrar.id AND Usuario_Migrar.email = :email)
    WHERE EmpresaId = :companyId;  
  `;
  const parameters = {
    email,
    companyId,
  };
  const response = await raw_query(query, parameters);
  return response.length > 0 ? response[0] : null;
};

module.exports.validatePermission = async (userId, permissions) => {
  let response = false;

  if (typeof userId === "object") {
    userId = userId.id;
  }

  const filter = {
    where: {
      id: userId,
    },
    include: {
      model: Roles,
      as: "roles",
      required: true,
      attributes: [],
      through: {
        attributes: [],
      },
      include: {
        model: Permissions,
        as: "permissions",
        required: true,
        attributes: ["name", "description"],
        through: {
          attributes: [],
        },
        where: {
          name: [permissions],
        },
      },
    },
    attributes: ["nome", "cognito_id"],
    raw: true,
  };
  await Usuario_Migrar.findAll(filter)
    .then((result) => {
      // console.info(result)
      if (result.length > 0) {
        response = true;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return response;
};

module.exports.validatePremium = async (companyId) => {
  const query = `
  SELECT 
    Empresas_Premium.company_id,
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
      when Empresas_Premium.empresa_homologada = 1 then true else false
    end as is_associada,
    Empresas_Premium.data_final_premium
  FROM Empresas_Premium
  WHERE Empresas_Premium.company_id = :companyId
    AND (
      Empresas_Premium.data_final_premium >= NOW()
          OR Empresas_Premium.data_final_premium is null
    )
  ORDER BY Empresas_Premium.createdAt DESC
  LIMIT 1  
  `;
  const companies = await raw_query(query, { companyId });

  if (companies.length === 0) return false;

  return !!companies[0].is_premium;
};

module.exports.validateProfile = async (userId, profiles) => {
  let response = false;

  if (typeof userId === "object") {
    userId = userId.id;
  }

  const filter = {
    where: {
      name: [profiles],
    },
    include: {
      model: Usuario_Migrar,
      as: "users",
      required: true,
      attributes: [],
      through: {
        attributes: [],
      },
      where: {
        id: userId,
      },
    },
    attributes: ["name", "description"],
    raw: true,
  };
  await Roles.findAll(filter)
    .then((result) => {
      if (result.length > 0) {
        response = true;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return response;
};

module.exports.getUsersByCompany = async (companyId) => {
  const query = `
    SELECT 
      Empresa_Usuarios.UsuarioId 
    FROM 
      Empresa_Usuarios
      INNER JOIN Usuario_Migrar ON Empresa_Usuarios.UsuarioId = Usuario_Migrar.id
    WHERE Empresa_Usuarios.EmpresaId = :companyId AND Empresa_Usuarios.active = 1
    GROUP BY 1
  `;
  const parameters = {
    companyId,
  };
  return raw_query(query, parameters);
};

module.exports.getUsersByPermission = async (permissions) => {
  if (typeof permissions === "string") {
    permissions = [permissions];
  }

  let where = "";

  if (permissions.length === 1) {
    where = `WHERE Permissions.name = "${permissions}"`;
  } else if (permissions.length > 1) {
    where = "WHERE\n";
    for (let i = 0; i < permissions.length; i++) {
      const permission = permissions[i];
      where +=
        i > 0
          ? `AND Permissions.name = "${permission}"`
          : `Permissions.name = "${permission}"`;
    }
  }

  const query =
    `SELECT\n` +
    `   Usuario_Migrar.id, Usuario_Migrar.nome, Usuario_Migrar.email,\n` +
    `   Usuario_Migrar.cognito_id, Usuario_Migrar.onboard, Usuario_Migrar.contador, Roles.name\n` +
    `FROM\n` +
    `   Permissions\n` +
    `   INNER JOIN Permissions_Roles ON Permissions.id = Permissions_Roles.permission_id\n` +
    `   INNER JOIN Roles on Permissions_Roles.role_id = Roles.id\n` +
    `   INNER JOIN Users_Roles on Roles.id = Users_Roles.role_id\n` +
    `   INNER JOIN Usuario_Migrar on Users_Roles.user_id = Usuario_Migrar.id\n${where}\n` +
    `GROUP BY 1,2,3,4,5,6\n`;

  return sequelize.query(query, { type: QueryTypes.SELECT });
};

module.exports.getProfilesByUser = async (userId) => {
  const filter = {
    include: {
      model: Usuario_Migrar,
      as: "users",
      required: true,
      attributes: [],
      through: {
        attributes: [],
      },
      where: {
        id: userId,
      },
    },
    attributes: ["name", "description"],
    raw: true,
  };
  return Roles.findAll(filter);
};

module.exports.getPermissionsByUser = async (userId) => {
  const query = `
  SELECT 
    Permissions.name,
    Permissions.description
  FROM 
    Permissions
      inner join Permissions_Roles on Permissions.id = Permissions_Roles.permission_id
      inner join Users_Roles on Permissions_Roles.role_id = Users_Roles.role_id
  WHERE
    Users_Roles.user_id = :userId
  GROUP BY
    1, 2 
  `;
  return raw_query(query, { userId });
};

module.exports.getUsersWithRolesCompany = async (companyId) => {
  const query = `
    SELECT user_id FROM Users_Roles_Company
    WHERE Users_Roles_Company.company_id = :companyId
    GROUP BY 1;  
  `;
  const parameters = {
    companyId,
  };
  return raw_query(query, parameters);
};

module.exports.getRolesCompanyByUser = async (companyId, userId) => {
  const query = `
    SELECT 
        Roles_Company.name as role
    FROM
        Users_Roles_Company
        INNER JOIN Roles_Company on Users_Roles_Company.role_company_id = Roles_Company.id
    WHERE
        Users_Roles_Company.company_id = :companyId
        AND Users_Roles_Company.user_id = :userId
    GROUP BY 1;
  `;
  const parameters = {
    companyId,
    userId,
  };
  return raw_query(query, parameters);
};

module.exports.getPermissionsCompanyByRoleCompany = async (roleName) => {
  const query = `
    SELECT Permissions.name as permission
    FROM
        Permissions
        INNER JOIN Permissions_Roles_Company on Permissions.id = Permissions_Roles_Company.permission_id
        INNER JOIN Roles_Company on Permissions_Roles_Company.role_company_id = Roles_Company.id
    WHERE
      Roles_Company.name = :roleName
    GROUP BY 1;
  `;
  const parameters = {
    roleName,
  };
  return raw_query(query, parameters);
};

module.exports.getPermissionsCompanyByUser = async (companyId, userId) => {
  const query = `
    SELECT Permissions.name as permission
    FROM
        Permissions
        INNER JOIN Permissions_Roles_Company on Permissions.id = Permissions_Roles_Company.permission_id
        INNER JOIN Users_Roles_Company on Permissions_Roles_Company.role_company_id = Users_Roles_Company.role_company_id
    WHERE
        Users_Roles_Company.company_id = :companyId
        AND Users_Roles_Company.user_id = :userId
    GROUP BY 1;
  `;
  const parameters = {
    companyId,
    userId,
  };
  return raw_query(query, parameters);
};

module.exports.setNewRoleCompanyToUser = async (
  companyId,
  userId,
  roleCompanyName
) =>
  call_procedure("UpdatePermissionsOnCompany", [
    companyId,
    userId,
    roleCompanyName,
  ]);

module.exports.userIsAssociate = async (
  userId,
  validateNivel2 = true,
  companyId = ""
) => {
  const profilesModule = ["superadmin", "admin", "associado", "omie"];
  if (!(await this.validateProfile(userId, profilesModule))) {
    if (!validateNivel2) return false;
    return this.userIsAssociateNivel2(userId, companyId);
  }
  return true;
};

module.exports.userIsAssociateNivel2 = async (userId, companyId = "") => {
  const queryCompany =
    companyId === "" ? "" : `AND Empresa_Usuarios.EmpresaId = :companyId`;
  const query = `
    SELECT 
        Empresa_Usuarios.EmpresaId
    FROM
        Empresa_Usuarios    
        INNER JOIN Users_Roles_Company ON Empresa_Usuarios.EmpresaId = Users_Roles_Company.company_id
        AND Empresa_Usuarios.UsuarioId = Users_Roles_Company.user_id
        INNER JOIN Roles_Company ON Users_Roles_Company.role_company_id = Roles_Company.id
    WHERE
        Empresa_Usuarios.UsuarioId = :userId
        AND Roles_Company.name = 'associado_nivel_2'
        ${queryCompany}
  `;
  const parameters = {
    userId,
    companyId,
  };
  const hasPermission = await raw_query(query, parameters);

  return hasPermission.length > 0;
};

module.exports.removeAssociateNive2AllCompanies = async (
  userAssociateId,
  companyAssociateId,
  userNivel2IdToRemove,
  event,
  action
) => {
  const query = `
    SELECT E.id, RC.name, UM_GUEST.nome, UM_GUEST.email
    FROM Empresas as E
      INNER JOIN Empresa_Usuarios AS EU_HOST ON 
        (E.id = EU_HOST.EmpresaId AND EU_HOST.UsuarioId = :userAssociateId AND EU_HOST.owner = '1')
      INNER JOIN Empresa_Usuarios AS EU_GUEST ON
        (E.id = EU_GUEST.EmpresaId AND EU_GUEST.UsuarioId = :userNivel2IdToRemove)
      INNER JOIN Users_Roles_Company AS URC ON 
        (EU_GUEST.EmpresaId = URC.company_id AND URC.user_id = :userNivel2IdToRemove) 
      INNER JOIN Roles_Company AS RC ON
        (URC.role_company_id = RC.id AND RC.name = 'associado_nivel_2')
      INNER JOIN Usuario_Migrar AS UM_GUEST ON
		    (EU_GUEST.UsuarioId = UM_GUEST.id)
    GROUP BY 1,2
  `;
  const parameters = {
    userAssociateId,
    userNivel2IdToRemove,
  };
  const companies = await raw_query(query, parameters);

  if (companies.length > 0) {
    for (const company of companies) {
      if (companyAssociateId !== company.id) {
        await this.removeAccessUserFromCompany(
          userNivel2IdToRemove,
          company.id,
          event,
          action,
          company.nome
        );
      }
      await this.updateStatusResponsibleCompany(
        company.email,
        company.id,
        0,
        event,
        action
      );
    }
  }
};

module.exports.removeAccessUserFromCompany = async (
  userId,
  companyId,
  event,
  action,
  userName
) => {
  const filter = {
    where: {
      UsuarioId: userId,
      EmpresaId: companyId,
    },
  };
  await Empresa_Usuarios.destroy(filter)
    .then(async () => {
      await setLog(
        event,
        companyId,
        action,
        "success",
        `Usuário [${userName}] removido com sucesso`
      );
    })
    .catch(async (error) => {
      console.error(userId, error);
      await setLog(
        event,
        companyId,
        action,
        "fatal_error",
        `Erro ao remover usuário: ${error}`
      );
    });
};

module.exports.updateStatusResponsibleCompany = async (
  userEmail,
  companyId,
  status,
  event,
  action
) => {
  const query = {
    where: {
      EmpresaId: companyId,
      email: userEmail,
    },
    raw: true,
  };
  const responsavel = {
    active: status,
  };
  await Empresa_Responsaveis.update(responsavel, query)
    .then(async () => {
      await setLog(
        event,
        companyId,
        action,
        "success",
        `Responsável [${userEmail}] atualizado com sucesso`
      );
    })
    .catch(async (error) => {
      await setLog(
        event,
        companyId,
        action,
        "fatal_error",
        `Erro ao atualizar responsável: ${error}`
      );
    });
};

module.exports.companyIsDemo = async (companyId) => {
  const demo = await raw_query(
    "SELECT * FROM Empresas WHERE demo = 1 and id = :companyId",
    { companyId }
  );
  return demo.length > 0;
};

module.exports.companyIsHomologada = async (companyId) => {
  const filter = {
    where: {
      company_id: companyId,
      empresa_homologada: "1",
    },
    raw: true,
  };
  const empresaIsHomologada = await Empresas_Premium.findOne(filter);

  return !!empresaIsHomologada;
};

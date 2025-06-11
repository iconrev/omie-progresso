/* eslint-disable no-continue */
const Handler = require("../handler");
const userController = require("../../auth/userController");

module.exports.getRolesCompany = async (event, action) => {
  const { companyId, user } = action;

  const userRolesPromise = userController.raw_query(
    `
    SELECT Usuario_Migrar.id as user, Roles_Company.name as role
    FROM 
      Users_Roles_Company
        INNER JOIN Usuario_Migrar ON Users_Roles_Company.user_id = Usuario_Migrar.id
        INNER JOIN Roles_Company ON Users_Roles_Company.role_company_id = Roles_Company.id
    WHERE
      Users_Roles_Company.company_id = :companyId
  `,
    {
      companyId,
      // userId: user.id,
    }
  );

  const dataRolesPromise = userController.raw_query(`
    SELECT 
      Roles_Company.name as role,
      Roles_Company.description as roleDescription,
      Roles_Company.label as roleLabel,
      Permissions.name as permission,
      Permissions.description as permissionDescription
    FROM 
      Roles_Company
      LEFT JOIN Permissions_Roles_Company ON Roles_Company.id = Permissions_Roles_Company.role_company_id
      LEFT JOIN Permissions ON Permissions_Roles_Company.permission_id = Permissions.id
    GROUP BY 1,2,3,4
    ORDER BY 1 ASC
  `);

  const companyPremiumPromise = userController.raw_query(
    `
    SELECT *
    FROM Empresas_Premium
    WHERE Empresas_Premium.company_id = :companyId
      AND Empresas_Premium.empresa_homologada = 1
        AND DATE(Empresas_Premium.data_final_premium) > DATE(NOW())
  `,
    {
      companyId,
    }
  );

  const [userRoles, dataRoles, companyPremium] = await Promise.all([
    userRolesPromise,
    dataRolesPromise,
    companyPremiumPromise,
  ]);

  const userIsAssociadoCompany =
    userRoles.findIndex(
      (item) => item.role === "associado" && item.user === user.id
    ) > -1;
  const userIsAdminCompany =
    userRoles.findIndex(
      (item) => item.role === "company_admin" && item.user === user.id
    ) > -1;
  const userIsAssociateNivel2 =
    userRoles.findIndex(
      (item) => item.role === "associado_nivel_2" && item.user === user.id
    ) > -1;
  const companyIsHomologada = companyPremium.length > 0;
  const companyHasAdmin =
    userRoles.findIndex((item) => item.role === "company_admin") > -1;

  const response = [];

  for (let i = 0; i < dataRoles.length; i++) {
    const dataRole = dataRoles[i];

    if (userIsAssociadoCompany && dataRole.role === "associado") continue;
    if (userIsAssociateNivel2 && dataRole.role === "associado") continue;
    if (userIsAdminCompany && dataRole.role === "company_admin") continue;
    if (companyHasAdmin && dataRole.role === "company_admin") continue;

    if (dataRole.role === "associado_nivel_2") {
      if (companyIsHomologada) {
        if (!userIsAdminCompany && !userIsAssociadoCompany) continue;
      } else {
        if (!userIsAssociadoCompany) continue;
        if (dataRole.permission === "cadastrar_empresas") {
          continue;
        }
      }
    }

    if (dataRole.role === "company_responsible") {
      response.push({
        role: dataRole.role,
        description: dataRole.roleDescription,
        label: dataRole.roleLabel,
        permissions: [
          {
            permission: null,
            description:
              "O usuário não terá acesso a empresa mas poderá ser usado como responsável de tarefas",
            class: "fa-remove text-danger",
          },
        ],
      });

      continue;
    }

    if (response.length === 0) {
      response.push({
        role: dataRole.role,
        description: dataRole.roleDescription,
        label: dataRole.roleLabel,
        permissions: [
          {
            permission: dataRole.permission,
            description: dataRole.permissionDescription,
            class: "fa-check text-success",
          },
        ],
      });
    } else {
      const indexRole = response.findIndex(
        (item) => item.role === dataRole.role
      );
      if (indexRole > -1) {
        response[indexRole].permissions.push({
          permission: dataRole.permission,
          description: dataRole.permissionDescription,
          class: "fa-check text-success",
        });
      } else {
        response.push({
          role: dataRole.role,
          description: dataRole.roleDescription,
          label: dataRole.roleLabel,
          permissions: [
            {
              permission: dataRole.permission,
              description: dataRole.permissionDescription,
              class: "fa-check text-success",
            },
          ],
        });
      }
    }
  }

  return Handler.Ok({
    status: "success",
    roles: response,
  });
};

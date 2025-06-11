const AWS = require("aws-sdk");
const axios = require('axios');


const cognito = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-18",
    region: process.env.COGNITO_USER_POOL_REGION,
});


function jwtDecode(base64Str) {
  // Usa o método Buffer.from() para decodificar a string base64
  const parts = base64Str.split(".");
  const decodedString = Buffer.from(parts[1], "base64").toString("utf-8");
  return JSON.parse(decodedString);
}


const validateOmieToken = async (token) => {
  try {
    const env = process.env.NODE_ENV || "dev";
    const urlUserData =
      env === "prod"
        ? "https://app.omie.com.br/api/portal/users/me/token/"
        : "https://appdsv.omie.com.br/api/portal/users/me/token/";

    console.info("validateOmieToken token:", token);
    const responseUserData = await axios.get(urlUserData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.info("validateOmieToken responseUserData", responseUserData.data);

    if (!responseUserData || !responseUserData.data) return false;

    return responseUserData.data;
  } catch (error) {
    console.error("validateOmieToken error", error);
    return false;
  }
};


const validateToken = async (token) => {
  const tokenClean = token.replace("Bearer ", "");

  // todo validar scope
  // "aws.cognito.signin.user.admin" (cognito)
  // "openid profile offline_access"(sso)
  const jwtDecoded = jwtDecode(tokenClean);

  if (!jwtDecoded.scope) {
    console.error("scope is missing");
    return null;
  }

  if (jwtDecoded.scope.includes("cognito")) {
    console.info("JWT COGNITO");

    try {
      const params = {
        AccessToken: tokenClean,
      };
      const user = await cognito.getUser(params).promise();
      return {
        ...user,
        scope: "cognito",
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  console.info("JWT OMIE");

  const user = await validateOmieToken(tokenClean);

  return {
    ...user,
    scope: "omie",
  };
};

module.exports.validateToken = validateToken;
module.exports.validateOmieToken = validateOmieToken;
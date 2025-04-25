const AWS = require("aws-sdk");
const Handler = require("../handler");

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

async function getDynamoData(companyId, year) {
  console.log("Starting getDynamoData function");
  console.log(`CompanyId: ${companyId}`);

  const tableName = process.env.TABLE_REPORTS_CALL.replace("local-", "");

  console.info('tableName', tableName);

  const params = {
    TableName: tableName,
    KeyConditionExpression: "company_id = :companyQuery",
    IndexName: "company-index",
    ExpressionAttributeValues: {
      ":companyQuery": companyId,
    },
  };

  try {
    const response = await dynamoDb.query(params).promise();
    console.info("Query response: ", response);

    if (response.Items && response.Items.length > 0) {
      // encontrei algo
      const items = response.Items;
      console.info("Items", items);

      const filteredByYearAndStatus = items.filter(
        (item) => item.status === "success" && item.year === parseInt(year, 10)
      );

      if (filteredByYearAndStatus.length > 1) {
        // todo colocar um alerta um dia pq não pode ter mais de um
        return {
          ...filteredByYearAndStatus[0],
          status: "success",
        };
      }
      if (filteredByYearAndStatus.length === 0) {
        const filteredByYearAndWorking = items.filter(
          (item) =>
            item.status === "working" && item.year === parseInt(year, 10)
        );
        if (filteredByYearAndWorking.length > 0) {
          return {
            status: "working",
          };
        }
        return {
          status: "not_found",
        };
      }

      return {
        ...filteredByYearAndStatus[0].response,
        status: "success",
      };
    }
    // não encontrei nada
    return {
      status: "not_found",
    };
  } catch (e) {
    console.error(JSON.stringify(e, null, 2));
    return {
      status: "fatal_error",
    };
  }
}

module.exports.importDREData = async (event, action) => {
  console.log("Starting importDREData function");

  const { year } = event.pathParameters;

  console.log("Year: ", year);

  // await getDynamoData(action.companyId);
  const data = await getDynamoData(action.companyId, year);

  const payload = {
    result: {
      ...data,
      year,
    },
  };

  return Handler.Ok(payload);
};

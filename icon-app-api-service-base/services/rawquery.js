const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

exports.query = async (query) => {
    let response = null;

    await sequelize.query(query, { type: QueryTypes.SELECT })
      .then(responseQuery => {
        response = responseQuery
      })
      .catch(error => {
        console.error(error)
      })
  
    return response
}

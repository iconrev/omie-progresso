'use strict'

const DRE = require('../services/diagnostico/interno/dre');

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return DRE.dre_custos(event, context, callback);
}

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tracker = sequelize.define('Tracker', {
    utm_source: DataTypes.STRING,
    utm_medium: DataTypes.STRING,
    utm_campaign: DataTypes.STRING,
    utm_id: DataTypes.STRING,
    utm_term: DataTypes.STRING,
    utm_content: DataTypes.STRING,
    source_user_agent: DataTypes.STRING,
    source_ip: DataTypes.STRING,
    source_headers: DataTypes.STRING,
  }, {});
  Tracker.associate = function (models) {
  };
  return Tracker;
};
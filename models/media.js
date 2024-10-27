const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');

const Media = sequelize.define('Media', {
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,  // Enables created_at and updated_at
});

module.exports = Media;

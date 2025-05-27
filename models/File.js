const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const File = sequelize.define(
  'File',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stored_filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storage_path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'failed'),
      allowNull: false,
      defaultValue: 'uploaded',
    },
    extracted_data: {
      type: DataTypes.TEXT,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'files',
    timestamps: false,
  }
);

module.exports = File;

'use strict';

const config = require('config');

const { NODE_ENV } = require('../utils/env');

//
//
module.exports = function defineApp(sequelize, DataTypes) {
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/i,
        len: [3, 255],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contentBucket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    archiveBucket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleArn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cfIdPub: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cfIdSec: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    configuration: DataTypes.JSON,
    setupVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0',
    },
    publicBaseUrl: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get() {
        const uid = this.getDataValue('uid');
        // when on local dev env we need to proxy the requests to the app's CDN so that we can add
        // the Authorization header to it
        // => public assets don't need the auth header right now
        // const setupVersion = this.getDataValue('setupVersion');
        // if (setupVersion === '1.1' && NODE_ENV === 'development') {
        //   return `${config.get('baseUrl')}/api/proxy/cdn/${uid}`;
        // }
        return `https://cdn.${uid}.${config.get('aws.cdn.baseUrl')}`;
      },
    },
    privateBaseUrl: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get() {
        const uid = this.getDataValue('uid');
        const setupVersion = this.getDataValue('setupVersion');
        // when on local dev env we need to proxy the requests to the app's CDN so that we can add
        // the Authorization header to it
        if (setupVersion === '1.1') {
          if (NODE_ENV === 'development') {
            return `${config.get('baseUrl')}/api/proxy/cdn/p/${uid}`;
          }
          return `https://cdn.${uid}.${config.get('aws.cdn.baseUrl')}/p`;
        }
        return `https://cdnsec.${uid}.${config.get('aws.cdn.baseUrl')}`;
      },
    },
  });

  App.associate = (models) => {
    App.USERS = App.hasMany(models.AppUser, {
      as: 'users',
      foreignKey: 'appId',
    });

    App.REGIONS = App.hasMany(models.Region, {
      as: 'regions',
      foreignKey: 'appId',
    });

    App.APPPLATFORMS = App.hasMany(models.AppPlatform, {
      as: 'platforms',
      foreignKey: 'appId',
    });

    App.CREATOR = App.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'createdBy',
    });

    App.ASSETPATCHES = App.hasMany(models.Asset, {
      as: 'assetPatches',
      foreignKey: 'appId',
    });

    App.APPAUTHSERVICES = App.hasMany(models.AppAuthService, {
      as: 'authServices',
      foreignKey: 'appId',
    });

    App.APPRECEIPTVALIDATORS = App.hasMany(models.AppReceiptValidator, {
      as: 'receiptValidators',
      foreignKey: 'appId',
    });

    App.ICON = App.belongsTo(models.Resource, {
      as: 'icon',
      foreignKey: 'iconId',
    });
  };

  return App;
};

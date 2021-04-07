'use strict';
const {
  Model
} = require('sequelize');

//import bcyrpt to hash the password
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Course, { //associates user to have many courses
        as: 'user', //alias for the id
        foreignKey:
        {
          fieldName: 'userId',
          allowNull: false,
        }
      })
    }
  };
  //TODO add validation
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      notNull: {
        msg: 'A first name is required'
      },
      notEmpty:{
        msg: 'Please provie a first name'
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      notNull: {
        msg: 'A last name is required'
      },
      notEmpty:{
        msg: 'Please provie a last name'
      }
  },
    emailAddress: DataTypes.STRING, //TODO validation for email using regEx
    password: DataTypes.STRING //TODO: confirmed password and hash it
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
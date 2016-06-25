var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var CONSTANTS = require('../constants.js');
module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			},
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);
				this.setDataValue(CONSTANTS.PASSWORD, value);
				this.setDataValue(CONSTANTS.SALT, salt);
				this.setDataValue(CONSTANTS.PASSWORD_HASH, hashedPassword);
			}

		}

	}, {
		hooks: {
			beforvalidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = toLowerCase(user.email);
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.password_hash)) {
							reject();
						}
						resolve(user);
					}, function(e) {
						reject();
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodeJWT = jwt.verify(token, 'azerty999@');
						var bytes = cryptojs.AES.decrypt(decodeJWT.token, 'abc123!@#!');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
						user.findById(tokenData.id).then(function(user) {
							if (user) {
								resolve(user);
							} else {
								reject();
							}
						}, function(e) {
							reject();
						});
					} catch (e) {
						reject();
					}

				});

			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, CONSTANTS.EMAIL, CONSTANTS.ID);
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}
				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encriptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
					var token = jwt.sign({
						token: encriptedData
					}, 'azerty999@');
					return token;
				} catch (e) {
					console.error(e);
					return undefined;

				}
			}
		}

	});
	return user;
}
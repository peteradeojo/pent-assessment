const bcrypt = require('bcrypt');
const { Strategy: JwtStrategy } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../models/User');

module.exports = (passport) => {
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'email',
			},
			async (email, password, done) => {
				console.log({ email, password });
			}
		)
	);
};

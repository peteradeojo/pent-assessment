const { sign, verify, decode } = require('jsonwebtoken');
const User = require('../models/User');

const parseToken = (req) => {
	const token = req.headers.authorization?.split('Bearer ')[1];
	return token;
};

const validateToken = (req, res, next) => {
	const token = parseToken(req);
	try {
		if (token) {
			const data = verify(token, process.env.JWT_SECRET);
			return User.findById(data.id, 'email name', (err, user) => {
				if (err) {
					return res.status(500).json({ err: err.message });
				}
				req.user = user;
				return next();
			});
		}

		throw Error('No token supplied');
	} catch (err) {
		return res.status(401).json({ err: err.message });
	}
};

const refreshToken = async (token) => {
	const { id } = decode(token);
	const user = await User.findById(id);
	if (user) {
		const token = signToken(user);
		return token;
	}
};

const signToken = (user, expires = 60 * 60) => {
	const token = sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: expires,
	});

	return token;
};

module.exports = { parseToken, validateToken, signToken, refreshToken };

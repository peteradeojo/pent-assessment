const express = require('express');
const { hashSync, compareSync } = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sign, decode, verify } = require('jsonwebtoken');
const { signToken, parseToken, refreshToken } = require('../middleware/Auth');

const router = express.Router();

module.exports = () => {
	router.post('/login', async (req, res) => {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(404)
				.json({ error: 'User with that email address was not found.' });
		}

		const passwordMatch = compareSync(password, user.password);
		if (passwordMatch) {
			const token = signToken(user);
			const { email, name } = user;
			return res.json({ user: { name, email }, token });
		}

		return res.status(401).json({ error: 'Invalid password' });
	});

	router.post(
		'/signup',
		body('name').notEmpty().isString().trim().escape(),
		body('email').isEmail().normalizeEmail(),
		body('password').isLength({ min: 5 }),
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { email, password, name } = req.body;
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(412)
					.json({ error: 'This email has been registered to another account' });
			}

			user = new User({ email, name, password });
			user.password = hashSync(password, 10);

			await user.save();

			const token = signToken(user);

			return res.status(201).json({ user: { email, name }, token });
		}
	);

	router.post('/refresh', async (req, res) => {
		const token = parseToken(req);
		const newToken = await refreshToken(token);
		if (!newToken) {
			return res.status(400).json({ error: 'Check your token and try again' });
		}
		res.status(201).json({ token: newToken });
	});

	return router;
};

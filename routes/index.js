const express = require('express');
const { body, validationResult, check } = require('express-validator');
const { validateToken } = require('../middleware/Auth');

const ReviewController = require('../controllers/ReviewController');

const router = express.Router();

module.exports = () => {
	router.get('/', ReviewController.getAll);

	router.get('/:id', ReviewController.getOne);

	router.post(
		'/',
		validateToken,
		body('address').isString().trim().escape().notEmpty(),
		body('description')
			.isString()
			.trim()
			.escape()
			.isLength({ max: 255 })
			.notEmpty(),
		body('review').isString().trim().escape(),
		body('landlord').isString().trim().escape(),
		body('environment').isString().trim().escape(),
		body('quality_of_amenities').optional().isString().trim().escape(),
		ReviewController.create
	);

	router.put('/:id', validateToken, ReviewController.markAsHelpful);

	return router;
};

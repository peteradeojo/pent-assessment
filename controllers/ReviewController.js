const { validationResult } = require('express-validator');
const { Review, Media, Helpful } = require('../models/Review');
const { v2: cloudinary } = require('cloudinary');

const controller = {};

/**
 *
 * @param {import('express').Request} req
 * @param {*} count
 * @param {*} page
 * @param {*} total
 */
const paginatedData = (req, count, page, total) => {
	const queries = req.query;

	let qs = '?';

	for (let k of Object.entries(queries)) {
		if (k[0] != 'page' && k[0] != 'count') qs += `&${k[0]}=${k[1]}`;
	}

	return {
		count,
		page,
		total,
		totalPages: Math.ceil(total / count),
		first_page: req.path + `${qs}&page=${1}&count=${count}`,
		last_page:
			req.path + `${qs}&page=${Math.ceil(total / count)}&count=${count}`,
	};
};

cloudinary.config({
	secure: true,
});

const pushToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			use_filename: false,
			unique_filename: true,
			overwrite: false,
			folder: 'pent/',
		});

		return result.url;
	} catch (err) {
		throw err;
	}
};

controller.getAll = async (req, res) => {
	try {
		let { count, page, sort } = req.query;
		page ??= 1;
		count ??= 20;
		// const reviews = await Review.find({})
		// 	.skip((page - 1) * count)
		// 	.limit(count)
		// 	.populate('media')
		// 	.populate('user', '-password')
		// 	.exec();
		let query = Review.find({})
			.skip((page - 1) * count)
			.limit(count)
			.populate('media')
			.populate('user', '-password');

		sort = sort?.split(',');

		if (sort?.indexOf('created_at') > -1) {
			query.sort('-created_at');
		}

		let reviews = await query.exec();

		// Sort by helpful marks
		if (sort?.indexOf('helpfulness') > -1) {
			reviews = reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
		}
		const totalCount = await Review.count();

		const response = {
			data: reviews,
			...paginatedData(req, count, page, totalCount),
		};
		return res.json(response);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

controller.getOne = async (req, res) => {
	const { id } = req.params;
	try {
		const review = await Review.findOne({ id })
			.populate('media')
			.populate('user', '-password')
			.exec();
		if (!review) {
			return res.status(404).json({ error: 'Not found' });
		}

		return res.json(review);
	} catch (err) {}
};

controller.create = async (req, res) => {
	try {
		const validationErrors = validationResult(req);
		const { media } = req.files;

		if (media && !Array.isArray(media)) {
			return res.status(400).json({ error: 'Media must be an array of files' });
		}

		if (!validationErrors.isEmpty()) {
			return res.status(400).json({ error: validationErrors.array() });
		}
		const review = new Review(req.body);

		const { landlord, environment, quality_of_amenities } = req.body;

		review.meta = { landlord, environment, quality_of_amenities };

		const mediaLinks = await Promise.all(
			media.map(async (file) => {
				const result = await pushToCloudinary(file);
				let media = new Media({ link: result });
				await media.save();
				return media.id;
			})
		);
		review.media.push(...mediaLinks);

		review.user = req.user.id;
		console.log(req.user.id);

		await review.save();

		return res.status(201).json(review);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
controller.markAsHelpful = async (req, res) => {
	req.url;
	try {
		const { id } = req.params;
		const review = await Review.findById(id).populate('helpfulness');
		const notUnique = review.helpfulness.find(
			(help) => help.ip_address == req.ip
		);
		if (notUnique) {
			return res
				.status(403)
				.json({ error: "You've already marked this review as helpful" });
		}

		const helped = new Helpful({ ip_address: req.ip });
		await helped.save();

		review.helpfulness.push(helped);
		await review.save();

		return res.json(review);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

module.exports = controller;

const mongoose = require('mongoose');

const { Schema } = mongoose;

const mediaSchema = new Schema({
	link: {
		type: String,
		required: true,
	},
});

const helpfulSchema = new Schema({
	ip_address: { type: String, required: true },
});

const reviewSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	address: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	review: {
		type: String,
		required: true,
	},
	helpfulness: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Helpful',
		},
	],
	media: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Media',
		},
	],
	meta: {
		landlord: {
			type: String,
		},
		environment: {
			type: String,
		},
		quality_of_amenities: {
			type: String,
		},
	},
	created_at: {
		type: Date,
		default: Date.now(),
	},
});

// reviewSchema.query.helpfulCount = function () {
// 	return this.helpfulness.count;
// };
reviewSchema.virtual('helpfulCount').get(function () {
  return this.helpfulness.length;
})

const Review = mongoose.model('Review', reviewSchema);
const Media = mongoose.model('Media', mediaSchema);
const Helpful = mongoose.model('Helpful', helpfulSchema);

module.exports = { Review, Media, Helpful };

const app = require('./app');
const mongoose = require('mongoose');

(async () => {
	try {
		const {
			connection: { host, port },
		} = await mongoose.connect(process.env.MONGO_URL);
		mongoose.set('toJSON', { virtuals: true });
		console.log(`MongoDB running on ${host}:${port}`);
	} catch (err) {}
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

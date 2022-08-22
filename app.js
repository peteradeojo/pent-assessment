const express = require('express');
const passport = require('passport');
const fileUpload = require('express-fileupload');

const app = express();
if (app.get('env') != 'production') {
	require('dotenv').config();
	app.use(require('morgan')('dev'));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
	fileUpload({
		limits: {
			files: 10,
			fileSize: 10 * 1024 * 1024,
		},
		useTempFiles: true,
		abortOnLimit: true,
		createParentPath: true,
		parseNested: true,
		safeFileNames: true,
	})
);

app.use('/', require('./routes/index')());
app.use('/auth', require('./routes/auth')());

module.exports = app;

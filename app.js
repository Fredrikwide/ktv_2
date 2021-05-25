const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, "public")));
app.use('/', require('./routes/index'));

app.use(express.static('public'));

module.exports = app;
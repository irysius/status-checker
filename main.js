'use strict';

/* global __dirname */
var _ = require('lodash');
var PATH = require('path');
var express = require('express');
var http = require('http');
var app = express();
var errorhandler = require('errorhandler');
var service = require('./NginxLogService');
app.use(express.static(PATH.join(__dirname)));
app.set('views', PATH.join(__dirname));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
	res.render('index.ejs');
});
app.use(errorhandler({ dumpExceptions: true, showStack: true }));
var httpServer = http.createServer(app);
var Chance = require('chance');
var chance = new Chance();

httpServer.on('listening', function () {
	service.watch();
	console.log('server listening on port: ' + httpServer.address().port);
});

service.middleware.push(require('./NginxLogParser'));

var io = require('socket.io')(httpServer);
httpServer.listen(1337);
io.on('connection', function (socket) {
	console.log('socket connection made');
	// allow socket to receive updates
	service.on('access', function (data) {
		if (_.isString(data)) {
			data = { id: chance.guid(), value: data };
		} else {
			data.id = chance.guid();
		}
		socket.emit('nginx.access', data);
	});
	service.on('log', function (data) {
		if (_.isString(data)) {
			data = { id: chance.guid(), value: data };
		} else {
			data.id = chance.guid();
		}
		socket.emit('nginx.log', data);
	});
});

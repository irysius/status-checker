/* global __dirname */
const _ = require('lodash');
const PATH = require('path');
const express = require('express');
const http = require('http');
const app = express();
const errorhandler = require('errorhandler');
const service = require('./NginxLogService');
app.use(express.static(PATH.join(__dirname)));
app.set('views', PATH.join(__dirname));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
	res.render('index.ejs');
});
app.use(errorhandler({ dumpExceptions: true, showStack: true }));
const httpServer = http.createServer(app);
const Chance = require('chance');
const chance = new Chance();

httpServer.on('listening', () => {
	service.watch();
	console.log('server listening on port: ' + httpServer.address().port);
});

service.middleware.push(require('./NginxLogParser'));

var io = require('socket.io')(httpServer);
httpServer.listen(1337);
io.on('connection', socket => {
	console.log('socket connection made');
	// allow socket to receive updates
	service.on('access', data => {
		if (_.isString(data)) {
			data = { id: chance.guid(), value: data };
		} else {
			data.id = chance.guid();
		}
		socket.emit('nginx.access', data);
	});
	service.on('log', data => {
		if (_.isString(data)) {
			data = { id: chance.guid(), value: data };
		} else {
			data.id = chance.guid();
		}
		socket.emit('nginx.log', data);
	});	
});

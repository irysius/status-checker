'use strict';

/* global process */
var _ = require('lodash');
var Tail = require('always-tail');
var util = require('util');
var temp = require('./config');
var accessPath = temp.accessPath;
var errorPath = temp.errorPath;
var refererFilters = temp.refererFilters;
var hostFilters = temp.hostFilters;

var callbacks = {};

function on(eventName, callback) {
	if (typeof callbacks[eventName] === 'undefined') {
		callbacks[eventName] = [];
	}
	callbacks[eventName].push(callback);
}
function off(eventName, callback) {
	if (typeof callbacks[eventName] === 'undefined') {
		callbacks[eventName] = [];
	}
	var index = callbacks[eventName].indexOf(callback);
	if (index !== -1) {
		callbacks.splice(index, 1);
	}
}

function emit(eventName, payload) {
	if (callbacks[eventName]) {
		callbacks[eventName].forEach(function (callback) {
			callback(payload);
		});
	}
}

function clear() {
	callbacks = {};
}

var middleware = [];

var access = new Tail(accessPath, /\r?\n/);
access.on('line', function (data) {
	middleware.forEach(function (m) {
		if (_.isFunction(m.onAccess)) {
			data = m.onAccess(data);
		}
	});
	if (!data.http_referer || refererFilters.indexOf(data.http_referer) === -1) {
		emit('access', data);
	}
});
access.on('error', function (data) {
	console.error('error:', data);
});

var log = new Tail(errorPath, /\r?\n/);
log.on('line', function (data) {
	middleware.forEach(function (m) {
		if (_.isFunction(m.onLog)) {
			data = m.onLog(data);
		}
	});

	if (_.isString(data.message)) {
		emit('log', data);
	} else if (data.message && data.message.data) {
		var _data = data.message.data;

		if ((!_data.host || _data.host && hostFilters.indexOf(_data.host) === -1) && (!_data.referrer || _data.referrer && refererFilters.indexOf(_data.referrer) === -1)) {
			emit('log', data);
		}
	} else {
		emit('log', data);
	}
});
log.on('error', function (data) {
	console.error('error:', data);
});

process.on('SIGINT', function () {
	access.unwatch();
	log.unwatch();
});

var proxy = {
	watch: function watch() {
		access.watch();
		log.watch();
	},
	unwatch: function unwatch() {
		access.unwatch();
		log.unwatch();
	},
	on: on,
	off: off,
	clear: clear
};
Object.defineProperty(proxy, 'middleware', {
	get: function get() {
		return middleware;
	}
});

module.exports = proxy;

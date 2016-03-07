/* global process */
const _ = require('lodash');
const Tail = require('always-tail');
const util = require('util');
var temp = require('./config');
const accessPath = temp.accessPath;
const errorPath = temp.errorPath;
const refererFilters = temp.refererFilters;
const hostFilters = temp.hostFilters;

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
access.on('line', (data) => {
	middleware.forEach(m => {
		if (_.isFunction(m.onAccess)) {
			data = m.onAccess(data);
		}
	});
	if (!data.http_referer || refererFilters.indexOf(data.http_referer) === -1) {
		emit('access', data);
	}
	
});
access.on('error', (data) => {
	console.error('error:', data);
});

var log = new Tail(errorPath, /\r?\n/);
log.on('line', (data) => {
	middleware.forEach(m => {
		if (_.isFunction(m.onLog)) {
			data = m.onLog(data);	
		}
	});
	
	if (_.isString(data.message)) {
		emit('log', data);
	} else if (data.message && data.message.data) {
		let _data = data.message.data;
		
		if ((!_data.host || (_data.host && hostFilters.indexOf(_data.host) === -1)) && 
			(!_data.referrer || (_data.referrer && refererFilters.indexOf(_data.referrer) === -1))) 
		{
			emit('log', data);
		}
	} else {
		emit('log', data);
	}
});
log.on('error', (data) => {
	console.error('error:', data);
});

process.on('SIGINT', () => {
	access.unwatch();
	log.unwatch();
});


var proxy = {
	watch: () => {
		access.watch();
		log.watch();	
	},
	unwatch: () => {
		access.unwatch();
		log.unwatch();	
	},
	on: on,
	off: off,
	clear: clear
};
Object.defineProperty(proxy, 'middleware', {
	get: () => {
		return middleware;
	}
});

module.exports = proxy;
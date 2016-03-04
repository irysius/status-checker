/* global process */
const _ = require('lodash');
const Tail = require('always-tail');
const EventEmitter = require('events');
var temp = require('./config');
const accessPath = temp.accessPath;
const errorPath = temp.errorPath;
const refererFilters = temp.refererFilters;
const hostFilters = temp.hostFilters;

class NginxLogEmitter extends EventEmitter {}
const emitter = new NginxLogEmitter();

var middleware = [];

var access = new Tail(accessPath, /\r?\n/);
access.on('line', (data) => {
	middleware.forEach(m => {
		if (_.isFunction(m.onAccess)) {
			data = m.onAccess(data);
		}
	});
	if (!data.http_referer || refererFilters.indexOf(data.http_referer) === -1) {
		emitter.emit('access', data);
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
		emitter.emit('log', data);
	} else if (data.message && data.message.data) {
		let _data = data.message.data;
		
		if ((!_data.host || (_data.host && hostFilters.indexOf(_data.host) === -1)) && 
			(!_data.referrer || (_data.referrer && refererFilters.indexOf(_data.referrer) === -1))) 
		{
			emitter.emit('log', data);
		}
	} else {
		emitter.emit('log', data);
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
	on: emitter.on.bind(emitter),
	off: emitter.removeListener.bind(emitter),
	clear: emitter.removeAllListeners.bind(emitter)
};
Object.defineProperty(proxy, 'middleware', {
	get: () => {
		return middleware;
	}
});

module.exports = proxy;
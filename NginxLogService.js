/* global process */
const _ = require('lodash');
const Tail = require('always-tail');
const EventEmitter = require('events');
const accessPath = '/var/log/nginx/access.log';
const errorPath = '/var/log/nginx/error.log';
// const accessPath = './access.txt';
// const errorPath = './error.txt';

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
	emitter.emit('access', data);
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
	emitter.emit('log', data);
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
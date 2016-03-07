'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* global process */
var _ = require('lodash');
var Tail = require('always-tail');
var EventEmitter = require('events');
var temp = require('./config');
var accessPath = temp.accessPath;
var errorPath = temp.errorPath;
var refererFilters = temp.refererFilters;
var hostFilters = temp.hostFilters;

var NginxLogEmitter = function (_EventEmitter) {
	_inherits(NginxLogEmitter, _EventEmitter);

	function NginxLogEmitter() {
		_classCallCheck(this, NginxLogEmitter);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(NginxLogEmitter).apply(this, arguments));
	}

	return NginxLogEmitter;
}(EventEmitter);

var emitter = new NginxLogEmitter();

var middleware = [];

var access = new Tail(accessPath, /\r?\n/);
access.on('line', function (data) {
	middleware.forEach(function (m) {
		if (_.isFunction(m.onAccess)) {
			data = m.onAccess(data);
		}
	});
	if (!data.http_referer || refererFilters.indexOf(data.http_referer) === -1) {
		emitter.emit('access', data);
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
		emitter.emit('log', data);
	} else if (data.message && data.message.data) {
		var _data = data.message.data;

		if ((!_data.host || _data.host && hostFilters.indexOf(_data.host) === -1) && (!_data.referrer || _data.referrer && refererFilters.indexOf(_data.referrer) === -1)) {
			emitter.emit('log', data);
		}
	} else {
		emitter.emit('log', data);
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
	on: emitter.on.bind(emitter),
	off: emitter.removeListener.bind(emitter),
	clear: emitter.removeAllListeners.bind(emitter)
};
Object.defineProperty(proxy, 'middleware', {
	get: function get() {
		return middleware;
	}
});

module.exports = proxy;

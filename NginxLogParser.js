'use strict';

var moment = require('moment');
function parseAccess(line) {
	// Nginx default access log format.
	// assumes line has the following characteristics (that we care about):
	// ${ip} [${time}] "${request}" ${status} ${bytes_sent} "${http_referer}" "${http_user_agent}"

	try {
		// ip
		var a = line.indexOf(' ');
		var ip = line.substring(0, a);

		// time
		var b = line.indexOf('[', a) + 1;
		var c = line.indexOf(']', b);
		var time = moment(line.substring(b, c), 'DD/MMM/YYYY:HH:mm:ss Z');
		if (!time.isValid()) {
			throw new Error('Invalid time');
		}

		// request
		var d = line.indexOf('"', c) + 1;
		var e = line.indexOf('"', d);
		var request = line.substring(d, e);

		// http_referer
		var f = line.indexOf('"', e + 1) + 1;
		var g = line.indexOf('"', f);
		var http_referer = line.substring(f, g);

		// http_user_agent
		var h = line.indexOf('"', g + 1) + 1;
		var i = line.indexOf('"', h);
		var http_user_agent = line.substring(h, i);

		// status and bytes_sent
		var j = line.substring(e + 1, f - 1);
		var temp = j.split(' ').filter(function (x) {
			return x;
		}).map(function (x) {
			return parseInt(x);
		});
		var status = temp[0];
		var bytes_sent = temp[1];

		return {
			ip: ip,
			time: time,
			request: request,
			status: status,
			bytes_sent: bytes_sent,
			http_referer: http_referer,
			http_user_agent: http_user_agent
		};
	} catch (e) {
		console.error(e);
		return line;
	}
}

function parseLog(line) {
	// Nginx default log format.
	// assumes line has the following characteristics (that we care about):
	// ${time} [${level}] _: *_ ${message}
	// optional additional lines that do not match

	// Note that nginx doesn't actually end logs with a new line,
	// so we might always be one step behind.

	try {
		// Determine the log level, first and foremost.
		var i = line.indexOf('[');
		var j = line.indexOf(']');
		var level = null;
		if (i !== -1 && j !== -1) {
			level = line.substring(i + 1, j);
		}

		if (level !== null) {
			// If an error level exist, assume this is a new error entry.

			// time
			var time = moment(line.substring(0, i), 'YYYY/MM/DD HH:mm:ss');
			if (!time.isValid()) {
				throw new Error('Invalid time');
			}

			// _: (writing code just in case we ever care about this value)
			var a = line.indexOf(' ', j + 1);
			var b = line.indexOf(' ', a);
			var x = line.substring(a, b);

			// *_ (writing code just in case we ever care about this value)
			var c = b + 1;
			var d = line.indexOf(' ', c);
			var y = line.substring(c, d);

			var e = line.indexOf(' ', d + 1);
			var message = line.substring(e + 1);

			if (message.indexOf('[lua]') === 0) {
				var lua_message = parseLua(message);
				if (lua_message !== null) {
					message = lua_message;
				}
			}

			return {
				time: time,
				level: level,
				message: message
			};
		} else {
			// Indicates additional lines for the previous error
			return line;
		}
	} catch (e) {
		console.error(e);
		return line;
	}
}

function parseLua(line) {
	// lua default log format.
	// assumes line has the following characteristics (that we care about):
	// [lua] ${filename}:${line_number}: ${data}, ...additional comma separated information

	try {
		var a = line.indexOf(' ') + 1;
		var b = line.indexOf(':', a + 1);
		var filename = line.substring(a, b);

		var c = line.indexOf(':', b + 1);
		var line_number = parseInt(line.substring(b + 1, c));

		if (isNaN(line_number)) {
			line_number = -1;
		}

		var rest = line.substring(c + 1).split(',');
		var value = rest[0].indexOf(': ') === -1 ? rest[0] : null;
		var data = {};
		rest.map(function (r) {
			return r.trim();
		}).filter(function (r) {
			return r.indexOf(': ') !== -1;
		}).map(function (r) {
			return r.split(': ');
		}).forEach(function (r) {
			data[r[0].trim()] = r[1].trim();
		});

		return {
			filename: filename,
			line_number: line_number,
			value: value,
			data: data
		};
	} catch (e) {
		console.error(e);
		return null;
	}
}

module.exports = {
	onAccess: parseAccess,
	onLog: parseLog
};

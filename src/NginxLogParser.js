const moment = require('moment');
function parseAccess(line) {
	// Nginx default access log format.
	// assumes line has the following characteristics (that we care about):
	// ${ip} [${time}] "${request}" ${status} ${bytes_sent} "${http_referer}" "${http_user_agent}"
	
	try {
		// ip
		let a = line.indexOf(' ');
		let ip = line.substring(0, a);
		
		// time
		let b = line.indexOf('[', a) + 1; 
		let c = line.indexOf(']', b);
		let time = moment(line.substring(b, c), 'DD/MMM/YYYY:HH:mm:ss Z');
		if (!time.isValid()) { throw new Error('Invalid time'); }
		
		// request
		let d = line.indexOf('"', c) + 1;
		let e = line.indexOf('"', d);
		let request = line.substring(d, e);
		
		// http_referer
		let f = line.indexOf('"', e + 1) + 1;
		let g = line.indexOf('"', f);
		let http_referer = line.substring(f, g);
		
		// http_user_agent
		let h = line.indexOf('"', g + 1) + 1;
		let i = line.indexOf('"', h);
		let http_user_agent = line.substring(h, i);
		
		// status and bytes_sent
		let j = line.substring(e + 1, f - 1);
		let temp = j.split(' ').filter(x => x).map(x => parseInt(x));
		let status = temp[0];
		let bytes_sent = temp[1];
		
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
		let i = line.indexOf('[');
		let j = line.indexOf(']');
		let level = null;
		if (i !== -1 && j !== -1) {
			level = line.substring(i + 1, j);
		}
		
		if (level !== null) {
			// If an error level exist, assume this is a new error entry.
			
			// time
			let time = moment(line.substring(0, i), 'YYYY/MM/DD HH:mm:ss');
			if (!time.isValid()) { throw new Error('Invalid time'); }
			
			// _: (writing code just in case we ever care about this value)
			let a = line.indexOf(' ', j + 1);
			let b = line.indexOf(' ', a);
			let x = line.substring(a, b);
			
			// *_ (writing code just in case we ever care about this value)
			let c = b + 1;
			let d = line.indexOf(' ', c);
			let y = line.substring(c, d);
			
			let e = line.indexOf(' ', d + 1);
			let message = line.substring(e + 1);
			
			if (message.indexOf('[lua]') === 0) {
				let lua_message = parseLua(message);
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
		let a = line.indexOf(' ') + 1;
		let b = line.indexOf(':', a + 1);
		let filename = line.substring(a, b);
		
		let c = line.indexOf(':', b + 1);
		let line_number = parseInt(line.substring(b + 1, c));
		
		if (isNaN(line_number)) { line_number = -1; }
		
		let rest = line.substring(c + 1).split(',');
		let value = rest[0].indexOf(': ') === -1 ?
			rest[0] : null;
		var data = {};
		rest.map(r => r.trim())
			.filter(r => r.indexOf(': ') !== -1)
			.map(r => r.split(': '))
			.forEach(r => {
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
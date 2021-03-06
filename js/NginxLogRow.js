"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NginxLogRow = (function (_React$Component) {
	_inherits(NginxLogRow, _React$Component);

	function NginxLogRow(props) {
		_classCallCheck(this, NginxLogRow);

		_get(Object.getPrototypeOf(NginxLogRow.prototype), "constructor", this).call(this, props);
	}

	_createClass(NginxLogRow, [{
		key: "render",
		value: function render() {
			var message = (function (message) {
				if (_.isString(message)) {
					return React.createElement(
						"pre",
						{ className: "message" },
						message
					);
				} else {
					return React.createElement(
						"pre",
						{ className: "message" },
						message.value,
						" ",
						React.createElement("br", null),
						message.filename,
						":",
						message.line_number,
						": ",
						React.createElement("br", null),
						message.data.client,
						" ",
						message.data.request,
						" ",
						React.createElement("br", null),
						message.data.host
					);
				}
			})(this.props.message);

			return React.createElement(
				"div",
				{ className: 'row nginx-' + this.props.level },
				React.createElement(
					"div",
					{ className: "col-xs-12" },
					React.createElement(
						"div",
						{ className: "time" },
						this.props.time
					),
					message
				)
			);
		}
	}]);

	return NginxLogRow;
})(React.Component);

NginxLogRow.propTypes = {
	time: React.PropTypes.string,
	level: React.PropTypes.string,
	message: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.shape({
		filename: React.PropTypes.string,
		line_number: React.PropTypes.number,
		value: React.PropTypes.any,
		data: React.PropTypes.object
	})])
};
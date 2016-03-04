class NginxLogRow extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		var message = (function (message) {
			if (_.isString(message)) {
				return <pre className="message">{message}</pre>;
			} else {
				return <pre className="message">
					{message.filename}:{message.line_number}: <br >
					{message.data.client} {message.data.request} <br >
					{message.data.}
				</pre>;
			}
		})(this.props.message);
		
		return (
			<div className={ 'row nginx-' + this.props.level }>
				<div className="col-xs-12">
					<div className="time">{this.props.time}</div>
					{message}
				</div>
			</div>
		);
	}
}

NginxLogRow.propTypes = {
	time: React.PropTypes.string,
	level: React.PropTypes.string,
	message: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.shape({
			filename: React.PropTypes.string,
			line_number: React.PropTypes.number,
			value: React.PropTypes.any,
			data: React.PropTypes.object
		})
	])
};
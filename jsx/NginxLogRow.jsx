class NginxLogRow extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className={ 'row nginx-' + this.props.level }>
				<div className="col-xs-12">
					<div className="time">{this.props.time}</div>
					<pre className="message">{this.props.message}</pre>
				</div>
			</div>
		);
	}
}

NginxLogRow.propTypes = {
	time: React.PropTypes.string,
	level: React.PropTypes.string,
	message: React.PropTypes.string
};
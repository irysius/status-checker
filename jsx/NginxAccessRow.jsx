class NginxAccessRow extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="row nginx-access">
				<div className="col-xs-12">
					<div className="time">{this.props.time}</div>
					<div className="row">
						<div className="col-xs-12">
							<div className="ip">{this.props.ip}</div>
							<div className="request">{this.props.request}</div>
							<div className="status">{this.props.status}</div>
							<div className="referer">{this.props.http_referer}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

NginxAccessRow.propTypes = {
	ip: React.PropTypes.string,
	time: React.PropTypes.string,
	request: React.PropTypes.string,
	status: React.PropTypes.number,
	bytes_sent: React.PropTypes.number,
	http_referer: React.PropTypes.string,
	http_user_agent: React.PropTypes.string	
};
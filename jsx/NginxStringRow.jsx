class NginxStringRow extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="row nginx-log">
				<div className="col-xs-12">
					{this.props.value}
				</div>
			</div>
		);
	}
}

NginxStringRow.propTypes = {
	value: React.PropTypes.string
};
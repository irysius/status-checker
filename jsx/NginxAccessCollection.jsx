class NginxAccessCollection extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		var rows = this.props.values.map(v => {
			if (_.has(v, 'value')) {
				return <NginxStringRow key={v.id} value={v.value} />;
			} else {
				return <NginxAccessRow key={v.id} {...v} />;
			}
		});
		
		return (
			<div>
				{ rows }
			</div>
		);
	}
}

NginxAccessCollection.propTypes = {
	values: React.PropTypes.array
};
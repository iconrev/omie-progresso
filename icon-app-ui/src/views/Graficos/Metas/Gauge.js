import { Component } from "react";
import GaugeChart from "react-gauge-chart";

class GraficoMetas extends Component {
	constructor(props) {
		super(props);
		this.state = {
			percentual: 0,
			ano: null,
		};
	}

	render() {
		const gauge_color = {
			colors: ["#EA4228", "#F5CD19", "#5BE12C"],
		};

		return (
			<div className="chart-wrapper">
				<GaugeChart
					className="chart-wrapper"
					id={this.props.id}
					textColor="#212121"
					percent={this.props.percentual / 100}
					colors={gauge_color.colors}
					style={{ width: "100%" }}
				/>
			</div>
		);
	}
}

export default GraficoMetas;

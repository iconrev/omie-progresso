import { Component } from "react";
import { HorizontalBar } from "react-chartjs-2";
import Generic from "../../../Utils/Generic";

class ComparativeChart extends Component {
	getMaxValue = (values) => {
		let maxValue;
		for (let i = 0; i < values.length; i++) {
			let valueCurrent = values[i];
			if (maxValue === undefined || maxValue < valueCurrent) {
				maxValue = valueCurrent;
			}
		}

		return maxValue;
	};

	render() {
		let typeChart = this.props.typeChart;
		let decimals = this.props.decimals || 2;
		let beginAtZero = this.props.beginAtZero || true;

		let scaleMax;
		if (this.props.scaleMax) {
			scaleMax = this.props.scaleMax;
		} else {
			scaleMax = this.getMaxValue(this.props.data);
		}

		let data = {
			labels: this.props.years,
			datasets: [
				{
					data: this.props.data,
					backgroundColor: ["#FF6384", "#36A2EB"],
					hoverBackgroundColor: ["#FF6384", "#36A2EB"],
				},
			],
		};
		let options = {
			title: {
				display: true,
				text: this.props.title || "Comparativo",
				position: "top",
				fontSize: 12,
				padding: 15,
			},
			maintainAspectRatio: false,
			tooltips: {
				callbacks: {
					label: function (tooltipItem, data) {
						let value =
							data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] ||
							0.0;

						if (decimals !== undefined) {
							if (decimals === false) value = Generic.formatNumber(value, 0);

							if (decimals) value = Generic.formatNumber(value, decimals);
						} else {
							value = Generic.formatNumber(value);
						}

						if (typeChart !== undefined) {
							if (typeChart === "%") value += "%";
							if (typeChart === "R$") value = "R$ " + value;
						}

						return " " + value;
					},
				},
			},
			legend: {
				display: false,
			},
			scales: {
				xAxes: [
					{
						ticks: {
							beginAtZero: beginAtZero,
							// steps: 220,
							stepValue: 1,
							max: scaleMax,
							callback: function (value) {
								value = Generic.formatNumber(value, decimals);

								if (typeChart !== undefined) {
									if (typeChart === "R$") value = "R$ " + value;
								}

								return value;
							},
						},
					},
				],
			},
		};

		return <HorizontalBar data={data} options={options} />;
	}
}

export default ComparativeChart;

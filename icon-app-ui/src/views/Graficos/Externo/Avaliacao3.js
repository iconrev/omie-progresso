import { Component } from "react";
import { Bar } from "react-chartjs-2";
import { Badge, Button, Row, Col } from "reactstrap";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Generic from "../../Utils/Generic";
import CompanyService from "../../../service/CompanyService";
import AmbienteExternoService from "../../../service/Diagnostico/AmbienteExterno";

const formatDataChart = (tooltipItem, data) => {
	let value =
		data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] || 0.0;
	value = Generic.formatNumber(value, 2);
	return " " + value + "%";
};

const options = {
	legend: {
		display: false,
	},
	tooltips: {
		callbacks: {
			label: (tooltipItem, data) => formatDataChart(tooltipItem, data),
		},
	},
	// maintainAspectRatio: false,
	scales: {
		yAxes: [
			{
				ticks: {
					beginAtZero: true,
					max: 100,
				},
			},
		],
		xAxes: [
			{
				ticks: {
					callback: function (tick) {
						var characterLimit = 8;
						if (tick.length >= characterLimit) {
							return (
								tick
									.slice(0, tick.length)
									.substring(0, characterLimit - 1)
									.trim() + "..."
							);
						}
						return tick;
					},
				},
			},
		],
	},
};

class Graph2 extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			labels: [],
			concorrencia: 0,
			data: {}
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const { media_competitividade, macro_avaliacao } = this.props.data;

		console.log(media_competitividade);

		// const { media_competitividade } = resource;

		let values = {};
		let labels = [];

		if (macro_avaliacao != undefined) {
			let fatores = macro_avaliacao.fatores;
			for (let i = 0; i < fatores.length; i++) {
				let item = fatores[i];
				values["value_" + (i + 1)] = item.media;
				labels.push(item.fator);
			}
		} 
		else {
			labels = this.props.labels;
			values = {
				value_1: media_competitividade.media_preco,
				value_2: media_competitividade.media_qualidade,
				value_3: media_competitividade.media_entrega,
				value_4: media_competitividade.media_inovacao,
				value_5: media_competitividade.media_portifolio,
			};
		}

		const { value_1, value_2, value_3, value_4, value_5 } = values;
		const data = [];

		data.push({
			label: "Competitividade",
			data: [value_1, value_2, value_3, value_4, value_5],
			borderWidth: 1,
			backgroundColor: [
				"#FF6384",
				"#36A2EB",
				"#FFCE56",
				"#0da921",
				"#ff8c00",
			],
			hoverBackgroundColor: [
				"#FF6384",
				"#36A2EB",
				"#FFCE56",
				"#0da921",
				"#ff8c00",
			],
		});

		this.setState({
			datasets: data,
			concorrencia: macro_avaliacao != undefined ? macro_avaliacao.concorrencia : media_competitividade.competitividade,
			labels: labels,
		});

	}

	loaded = () => {
		return (
			<div className="">
				<Row>
					<Col>
						<Bar data={this.state} options={options} />
					</Col>
				</Row>
				<Row className={"mt-2"}>
					<Col>
						<Button
							color="primary"
							outline
							onClick={this.props.onClick}
							className="float-right"
						>
							<strong>Competitividade</strong>{" "}
							<Badge color="secondary" pill style={{ position: "static" }}>
								{this.state.concorrencia}%
							</Badge>
						</Button>
					</Col>
				</Row>
			</div>
		);
	};

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner position={"relative"} />
		) : (
			this.loaded()
		);
	}
}

export default Graph2;

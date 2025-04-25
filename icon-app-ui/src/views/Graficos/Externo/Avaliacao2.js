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
			isLoading: true,
			id: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const resource = this.props.data;

		await AmbienteExternoService.getGraficoResource(resource)
			.then(async (response) => {
				const { status, avaliacao } = response.data;

				if (status !== "success") {
					return;
				}

				let values = {};
				let labels = [];
				let concorrencia =
					avaliacao[this.state.exercicio_definido]["concorrencia"];

				if (this.props.data === "macro") {
					let fatores = avaliacao[this.state.exercicio_definido]["fatores"];
					for (let i = 0; i < fatores.length; i++) {
						let item = fatores[i];
						values["value_" + (i + 1)] = item.media;
						labels.push(item.fator);
					}
				} else {
					labels = this.props.labels;
					let competitividade =
						avaliacao[this.state.exercicio_definido]["competitividade"];
					values = {
						value_1: competitividade.preco,
						value_2: competitividade.qualidade,
						value_3: competitividade.entrega,
						value_4: competitividade.inovacao,
						value_5: competitividade.portifolio,
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
					concorrencia: concorrencia,
					labels: labels,
				});
			})
			.catch((err) => {
				console.error(err);
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

import { Bar, Line } from "react-chartjs-2";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

const CardNovosCadastros = (props) => {
	if (!props.newUsersByMonth && !props.newUsersByDays) return null;

	const getMonthExtense = (monthsArray) => {
		let response = [];

		const months = [
			"Janeiro",
			"Fevereiro",
			"Março",
			"Abril",
			"Maio",
			"Junho",
			"Julho",
			"Agosto",
			"Setembro",
			"Outubro",
			"Novembro",
			"Dezembro",
		];

		for (let i = 0; i < monthsArray.length; i++) {
			const yearMonth = monthsArray[i];
			const [year, month] = yearMonth.split("-");
			response.push(`${months[parseInt(month) - 1]}/${year}`);
		}

		return response;
	};

	const formatDate = (monthsArray) => {
		let response = [];

		for (let i = 0; i < monthsArray.length; i++) {
			const splited = monthsArray[i].split("-");
			response.push(`${splited[2]}/${splited[1]}`);
		}

		return response;
	};

	const dataByDate = {
		labels: formatDate(props.newUsersByDate.labels),
		datasets: [
			{
				label: props.newUsersByDate.title,
				data: props.newUsersByDate.data,
				fill: false,
				backgroundColor: "rgb(255, 99, 132)",
				borderColor: "rgba(255, 99, 132, 0.2)",
			},
			{
				label: props.newCompaniesByDate.title,
				data: props.newCompaniesByDate.data,
				fill: false,
				backgroundColor: "rgb(54, 162, 235)",
				borderColor: "rgba(54, 162, 235, 0.2)",
			},
		],
	};
	const dataByMonth = {
		labels: getMonthExtense(props.newUsersByMonth.labels),
		datasets: [
			{
				label: props.newUsersByMonth.title,
				data: props.newUsersByMonth.data,
				fill: false,
				backgroundColor: "rgb(255, 99, 132)",
				borderColor: "rgba(255, 99, 132, 0.2)",
			},
			{
				label: props.newCompaniesByMonth.title,
				data: props.newCompaniesByMonth.data,
				fill: false,
				backgroundColor: "rgb(54, 162, 235)",
				borderColor: "rgba(54, 162, 235, 0.2)",
			},
		],
	};
	const options = {
		title: {
			display: false,
		},
		// responsive: true,
		maintainAspectRatio: false,
		tooltips: {
			callbacks: {
				label: (tooltipItem, data) => {
					return ` ${data.datasets[tooltipItem.datasetIndex].label}: ${
						tooltipItem.value
					}`;
				},
			},
		},
		scales: {
			yAxes: [
				{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							if (value % 1 === 0) {
								return value;
							}
						},
					},
					gridLines: {
						drawOnChartArea: false,
					},
				},
			],
			xAxes: [
				{
					ticks: {
						callback: function (tick) {
							var characterLimit = 6;
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
					gridLines: {
						// drawOnChartArea: false
					},
				},
			],
		},
		layout: {
			padding: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,
			},
		},
	};

	return (
		<Card className="card-accent-dark">
			<CardHeader>
				<strong>Novos Cadastros</strong>
			</CardHeader>
			<CardBody>
				<Row style={{ minHeight: "350px" }}>
					<Col xs={12} md={6} xl={5}>
						<Line data={dataByDate} options={options} />
					</Col>
					<Col xs={12} md={6} xl={7}>
						<Bar data={dataByMonth} options={options} />
					</Col>
				</Row>
			</CardBody>
		</Card>
	);
};

export default CardNovosCadastros;

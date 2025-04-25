import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Table,
} from "reactstrap";
import { toast } from "react-toastify";
import BadgeProfile from "../../components/BadgeProfile";
import { Bar } from "react-chartjs-2";

const AssiduousUsers = ({ data }) => {
	const handleClick = () => {
		toast.info("Em desenvolvimento");
	};

	return (
		<Row>
			<Col>
				<Row>
					<Col className={"text-right"}>
						<small>Usuários com mais acessos nos últimos 30 dias.</small>
					</Col>
				</Row>
				<Table striped hover>
					<thead>
						<tr>
							<th>#</th>
							<th>Usuário</th>
							<th className={"text-center"}>Acessos</th>
							<th className={"text-center"}>Empresas</th>
						</tr>
					</thead>
					<tbody>
						{data.map((user, index) => {
							return (
								<tr
									key={index}
									style={{ cursor: "pointer" }}
									title={"Ver mais"}
									onClick={() => handleClick(user)}
								>
									<th className={"col-1"} scope="row">
										{index + 1}º
									</th>
									<td className={"col-7"}>
										<Row className={"align-items-center"}>
											<Col xs={"auto pr-1"}>{user.nome}</Col>
											<Col xs={"auto pl-0"}>
												<BadgeProfile profile={user.profile} />
											</Col>
										</Row>
									</td>
									<td className={"col-2 text-center"}>{user.acessos}</td>
									<td className={"col-2 text-center"}>{user.companies}</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
			</Col>
		</Row>
	);
};

const ChartAccessByDay = (props) => {
	let { data } = props;

	if (!data) return null;
	if (data.length === 0) return null;

	data = data.reverse();

	const dataChart = {
		// labels: data.map(data => data.data),
		labels: data.map((data) => {
			data = data.data.split("-");
			return `${data[2]}/${data[1]}`;
		}),
		datasets: [
			{
				label: "Data",
				data: data.map((data) => data.acessos),
				backgroundColor: "rgb(255, 99, 132)",
				borderWidth: 1,
			},
		],
	};

	const options = {
		layout: {
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
		legend: {
			display: false,
		},
		title: {
			display: true,
			text: `Acessos nos últimos ${data.length} dias`,
		},
		scales: {
			yAxes: [
				{
					ticks: {
						beginAtZero: true,
					},
				},
			],
		},
	};

	return <Bar data={dataChart} options={options} />;
};

const CardUsuarios = ({ data }) => {
	return (
		<Card className="card-accent-dark">
			<CardHeader>
				<strong>Usuários</strong>
			</CardHeader>
			<CardBody>
				<Container fluid className={"m-0 p-0"}>
					<Row className={"align-items-center"}>
						<Col xs={12} sm={12} md={12} lg={6} xl={5}>
							<ChartAccessByDay data={data.access_by_day} />
						</Col>
						<Col>
							<AssiduousUsers data={data.usersActives} />
						</Col>
					</Row>
				</Container>
			</CardBody>
		</Card>
	);
};

export default CardUsuarios;

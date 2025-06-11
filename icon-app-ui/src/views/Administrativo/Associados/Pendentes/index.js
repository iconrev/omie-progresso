import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Alert,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
	Button,
	Table,
} from "reactstrap";
import userService from "../../../../service/UserService";
import ModalAssociateApprover from "./ModalAssociateApprover";

const NadaParaExibir = () => {
	return <Alert color={"info"}>Não há solicitações pendentes.</Alert>;
};

const TabelaSolicitacoesPendentes = ({ solicitacoes }) => {
	const [modal, setModal] = useState(false);
	const [userApprover, setUserApprover] = useState(null);

	const toggleModalApprover = (e, user) => {
		setUserApprover(user);
		setModal(!modal);
	};

	return (
		<>
			<Table striped hover>
				<thead>
					<tr>
						<th>Usuário</th>
						<th>CRC/CPF</th>
						<th>Telefone</th>
						<th>Empresa Homologada</th>
						<th>CNPJ</th>
						<th className={"text-center"}>Data Pedido</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{solicitacoes.map((user, index) => {
						return (
							<tr key={index}>
								<td>{user.name}</td>
								<td>{user.crc}</td>
								<td>{user.phone}</td>
								<td>{user.companyName}</td>
								<td>{user.companyCnpj}</td>
								<td className={"text-center"}>
									{new Date(user.createdAt).toLocaleDateString("pt-br")}
								</td>
								<td className={"text-center"}>
									<Button
										color="primary"
										size="sm"
										onClick={(e) => toggleModalApprover(e, user)}
									>
										Avaliar
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
			<ModalAssociateApprover
				user={userApprover}
				toggleBase={toggleModalApprover}
				isOpen={modal}
			/>
		</>
	);
};

const SolicitacoesPendentes = (props) => {
	const [solicitacoes, setSolicitacoes] = useState([]);

	useEffect(() => {
		const dataUser = userService.getUser();
		if (!dataUser.isAdmin) {
			toast.error("Acesso negado!");
			return props.history.push("/");
		}
		(async () => {
			if (props) {
				if (props.location) {
					if (props.location.state) {
						if (props.location.state.data) {
							setSolicitacoes(props.location.state.data);
						}
					}
				}
			}
		})();
		// eslint-disable-next-line
	}, []);

	const goBack = (event) => {
		event.preventDefault();
		props.history.push("/administrativo");
	};

	return (
		<Card className="card-accent-dark">
			<CardHeader>
				<strong>Solicitações de Associados</strong>
			</CardHeader>
			<CardBody>
				<Row>
					<Col>
						{!solicitacoes || solicitacoes.length === 0 ? (
							<NadaParaExibir />
						) : (
							<TabelaSolicitacoesPendentes solicitacoes={solicitacoes} />
						)}
					</Col>
				</Row>
			</CardBody>
			<CardFooter>
				<Button color={"primary"} className={"float-right"} onClick={goBack}>
					Voltar
				</Button>
			</CardFooter>
		</Card>
	);
};

export default SolicitacoesPendentes;

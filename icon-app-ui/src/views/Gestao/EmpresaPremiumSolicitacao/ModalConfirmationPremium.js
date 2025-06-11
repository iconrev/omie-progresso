import {
	Button,
	Row,
	Col,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Alert,
} from "reactstrap";
import ButtonLoading from "../../../components/ButtonLoading";
import CompanyService from "../../../service/CompanyService";

const ModalConfirmationPremium = ({
	isOpen,
	toggle,
	confirm,
	isLoading,
	...rest
}) => {
	const cpfCnpj = rest.dadosFaturamento.entidade === "J" ? "CNPJ" : "CPF";
	const cpfCnpjValue =
		rest.dadosFaturamento.entidade === "J"
			? rest.dadosFaturamento.cnpj
			: rest.dadosFaturamento.entidade.cpf;

	const company = CompanyService.getDataCompany();

	return (
		<Modal isOpen={isOpen} fullscreen="sm" size="md">
			<ModalHeader>Confirmação</ModalHeader>
			<ModalBody>
				<Row>
					<Col>
						<Alert color="dark">
							<h4>Dados Premium</h4>
							<p className={"m-0"}>
								Empresa: <strong>{company.name}</strong>
							</p>
							<p className={"m-0"}>
								CNPJ: <strong>{company.cnpj}</strong>
							</p>
							<hr />
							<h4>Faturamento</h4>
							<p className={"m-0"}>
								Fatura para o {cpfCnpj}: <strong>{cpfCnpjValue}</strong>
							</p>
							<p className={"m-0"}>
								Contato Financeiro:{" "}
								<strong>{rest.contatoFinanceiro.contatoFinanceiro}</strong>
							</p>
							<p className={"m-0"}>
								Boleto será enviado para:{" "}
								<strong>{rest.contatoFinanceiro.emailContatoFinanceiro}</strong>
							</p>
							{/* <hr /> */}
							{/* <p className={'m-0'}><em>Ativação instantânea.</em></p> */}
						</Alert>
					</Col>
				</Row>
				<Row>
					<Col>
						<p className={"m-0"}>
							Está tudo certo com os dados para ativar o Premium para esta
							empresa.
						</p>
						<p className={"m-0"}>Vamos ativar agora?</p>
					</Col>
				</Row>
			</ModalBody>
			<ModalFooter>
				<Button onClick={toggle} outline color={"danger"}>
					{isLoading ? "Fechar" : "Não quero ativar agora"}
				</Button>
				<ButtonLoading
					color="success"
					onClick={confirm}
					isLoading={isLoading}
					className={"text-uppercase font-weight-bold"}
				>
					ATIVAR PREMIUM
					<i className={"fa fa-check ml-2"} />
				</ButtonLoading>
			</ModalFooter>
		</Modal>
	);
};

export default ModalConfirmationPremium;

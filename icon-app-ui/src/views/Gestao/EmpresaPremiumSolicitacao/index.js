import { useState, useEffect } from "react";
import { Container, Button, CardBody, Card } from "reactstrap";
import CardCompany from "./CardCompany";
import CardDadosFaturamento from "./CardDadosFaturamento";
import CardMensalidade from "./CardMensalidade";
import ModalConfirmationPremium from "./ModalConfirmationPremium";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
	activePremium,
	getEmpresaDetalhesPremium,
} from "../../../service/services";
import { toast } from "react-toastify";
import StepsForm from "./StepsForm";
import CardContatoFinanceiro from "./CardContatoFinanceiro";
import { addDays } from "../../Utils/Generic";
import CompanyService from "../../../service/CompanyService";
import userService from "../../../service/UserService";

const EmpresaPremiumSolicitacao = (props) => {
	const dataUser = userService.getUser();

	const [company, setCompany] = useState(null);
	const [isLoading, setLoading] = useState(true);
	const [termos, setTermos] = useState({
		aceitaTermos: true,
	});
	const [dadosFaturamento, setDadosFaturamento] = useState({
		entidade: "J",
		cpf: "",
		nome: "",
		cnpj: CompanyService.getCurrentCompanyCnpj(),
		nomeFantasia: CompanyService.getCurrentCompanyName(),
		razaoSocial: "",
		telefone: "",
		enderecoCep: "",
		endereco: "",
		enderecoNumero: "",
		enderecoBairro: "",
		enderecoComplemento: "",
		enderecoCidade: "",
		enderecoEstado: "",
	});
	const [contatoFinanceiro, setContatoFinanceiro] = useState({
		contatoFinanceiro: dataUser.name,
		celularContatoFinanceiro: "",
		emailContatoFinanceiro: dataUser.name,
	});
	const [tipoCobranca, setTipoCobranca] = useState({
		tipo: "boleto",
		valor: 250.0,
		pagamento: "mensal",
		diaVencimento: addDays(new Date(), 10).getDate(),
	});
	const [errorField, setErrorField] = useState([]);
	const [notRequiredFaturamento, setNotRequiredFaturamento] = useState([
		"enderecoComplemento",
		"nome",
		"cpf",
	]);
	const [modal, setModal] = useState(false);
	const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

	const redirectToHomeCompany = () => {
		const company = CompanyService.getCurrentCompanyId();
		return props.history.push(`/hub/${company}/gestao`);
	};

	useEffect(() => {
		(async () => {
			const company = CompanyService.getDataCompany();

			if (!company) return props.history.push("/");
			if (company.isAssociada) return redirectToHomeCompany();
			if (company.isPremium && !company.isTrial) return redirectToHomeCompany();

			const response = await getEmpresaDetalhesPremium(company.id);
			const { status, empresa } = response.data;
			if (status === "success") {
				if (empresa.is_associada === 1) return redirectToHomeCompany();
				if (empresa.is_premium === 1 && empresa.is_trial === 0)
					return redirectToHomeCompany();
				setCompany(empresa);
			} else {
				toast.error("ERRO AO BUSCAR DODOS");
			}
			setLoading(false);
		})();
	}, []);

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	const submitPremium = async (event) => {
		event.preventDefault();

		setAwaitingConfirmation(true);

		const companyId = company.id;
		const data = {
			...dadosFaturamento,
			...contatoFinanceiro,
			...tipoCobranca,
		};
		const response = await activePremium(companyId, data);

		const { status, message } = response;
		if (status === "success") {
			CompanyService.setPremium(true);
			CompanyService.setTrial(response.empresa_homologada === 2);
			CompanyService.setAssociada(response.empresa_homologada === 1);
			CompanyService.setPremiumFinal(response.data_final_premium);
			CompanyService.setTrialAvailable(!!response.trial_available);
			setAwaitingConfirmation(false);
			toast.success(message);
			return props.history.push(`/hub/${companyId}/gestao`);
		} else {
			setAwaitingConfirmation(false);
			toast.error(message);
		}
	};

	const handleNotRequired = (listNotRequired) => {
		setNotRequiredFaturamento(listNotRequired);
	};

	const handleModal = (event) => {
		event.preventDefault();
		setModal(!modal);
		setAwaitingConfirmation(false);
	};

	const steps = [
		{
			label: "Informações Iniciais",
			screen: (
				<CardCompany
					company={company}
					data={termos}
					handle={setTermos}
					error={errorField}
				/>
			),
		},
		{
			label: "Dados Faturamento",
			screen: (
				<CardDadosFaturamento
					company={company}
					data={dadosFaturamento}
					handle={setDadosFaturamento}
					error={errorField}
					handleError={setErrorField}
					notRequired={notRequiredFaturamento}
					handleNotRequired={handleNotRequired}
				/>
			),
		},
		{
			label: "Financeiro",
			screen: (
				<CardContatoFinanceiro
					data={contatoFinanceiro}
					handle={setContatoFinanceiro}
					error={errorField}
					handleError={setErrorField}
				/>
			),
		},
		{
			label: "Forma de Pagamento",
			screen: <CardMensalidade data={tipoCobranca} handle={setTipoCobranca} />,
			button: (
				<Button
					color={"success"}
					className={"text-uppercase font-weight-bold"}
					onClick={handleModal}
				>
					CONFERIR OS DADOS E ATIVAR
					<i className={"fa fa-check ml-2"} />
				</Button>
			),
		},
	];

	return (
		<Container className={"pb-4"}>
			<Card>
				<CardBody>
					<StepsForm
						steps={steps}
						jumpStep={false}
						startStep={0}
						handleError={setErrorField}
					/>
				</CardBody>
			</Card>
			<ModalConfirmationPremium
				isOpen={modal}
				toggle={handleModal}
				confirm={submitPremium}
				isLoading={awaitingConfirmation}
				dadosFaturamento={dadosFaturamento}
				contatoFinanceiro={contatoFinanceiro}
			/>
		</Container>
	);
};

export default EmpresaPremiumSolicitacao;

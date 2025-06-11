import { useState } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Form,
	Col,
	FormGroup,
	Label,
	Input,
	Button,
} from "reactstrap";
import SelectEstados from "../../../components/SelectEstados";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { findCnpj, findCep } from "../../../service/services";
import LoadingFullScreen from "../../../components/LoadingFullScreen";

const sleep = async (seconds) => {
	return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
};

const CardDadosFaturamento = (props) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (event) => {
		props.handle({
			...props.data,
			[event.target.id]: event.target.value,
		});
		props.handleError(props.error.filter((e) => e !== event.target.id));

		if (event.target.id === "entidade") {
			if (event.target.value === "F") {
				props.handleNotRequired([
					"enderecoComplemento",
					"cnpj",
					"nomeFantasia",
					"razaoSocial",
				]);
			} else {
				props.handleNotRequired(["enderecoComplemento", "cpf", "nome"]);
			}
		}
	};

	const handleFindCnpj = async (event) => {
		event.preventDefault();
		let cnpjSend = props.data.cnpj.match(/\d+/g);

		if (!cnpjSend) return;

		setIsLoading(true);
		cnpjSend = cnpjSend.join("");

		let contador = 0;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			contador += 1;
			if (contador > 5) {
				setIsLoading(false);
				toast.info("Não foi possível encontrar os dados do CNPJ");
				break;
			}

			const response = await findCnpj(cnpjSend);

			const { status, message, cnpj } = response.data;

			if (status !== "success") {
				console.error(response.data);
				setIsLoading(false);
				toast.error(message);
				return;
			}

			if (cnpj.status !== "cached") {
				console.warn("Aguardando resposta da API para o CNPJ...");
				await sleep(2);
				continue;
			}

			const validateValue = (value, defaultResponse = "") => {
				if (!value) return defaultResponse;
				if (value === "") return defaultResponse;
				if (value === "********") return defaultResponse;
				return value;
			};

			if (cnpj.response) {
				await props.handle({
					...props.data,
					nomeFantasia: validateValue(
						cnpj.response.nome,
						props.data.nomeFantasia
					),
					razaoSocial: validateValue(cnpj.response.razao),
					telefone: validateValue(cnpj.response.fone),
					enderecoCep: validateValue(cnpj.response.cep),
					endereco: validateValue(cnpj.response.logradouro),
					enderecoNumero: validateValue(cnpj.response.numero),
					enderecoBairro: validateValue(cnpj.response.bairro),
					enderecoCidade: validateValue(cnpj.response.municipio),
					enderecoEstado: validateValue(cnpj.response.uf),
				});
				props.handleError([]);
				break;
			}
		}

		setIsLoading(false);
	};

	const handleFindCep = async (event) => {
		event.preventDefault();
		let cepSend = props.data.enderecoCep.match(/\d+/g);

		if (!cepSend) return;

		setIsLoading(true);
		cepSend = cepSend.join("");

		const cepResponse = await findCep(cepSend);

		const { erro } = cepResponse.data;

		if (erro) {
			toast.error("CEP não encontrado ou inválido");
		} else {
			const cep = cepResponse.data;

			await props.handle({
				...props.data,
				endereco: cep.logradouro || "",
				enderecoBairro: cep.bairro || "",
				enderecoCidade: cep.localidade || "",
				enderecoEstado: cep.uf || "",
			});
			props.handleError([]);
		}
		setIsLoading(false);
	};

	const validateField = (field) => {
		return props.error.indexOf(field) >= 0;
	};

	return (
		<Card>
			<CardHeader>Dados de Faturamento</CardHeader>
			<CardBody>
				<Form>
					<FormGroup row>
						<Label for={"entidade"} xs={4} sm={3} md={2}>
							Pessoa
						</Label>
						<Col xs={8} sm={5} md={4} lg={3} xl={2}>
							<Input
								type="select"
								id="entidade"
								onChange={handleChange}
								defaultValue={props.data.entidade}
							>
								<option value={"F"}>Física</option>
								<option value={"J"}>Jurídica</option>
							</Input>
						</Col>
					</FormGroup>
					{props.data.entidade === "J" ? (
						<>
							<FormGroup row>
								<Label for={"cnpj"} xs={4} sm={3} md={2}>
									CNPJ
								</Label>
								<Col xs={8} sm={6} md={5} lg={4} xl={3}>
									<InputMask
										id="cnpj"
										mask="99.999.999/9999-99"
										value={props.data.cnpj}
										onChange={handleChange}
									>
										{(inputProps) => (
											<Input {...inputProps} invalid={validateField("cnpj")} />
										)}
									</InputMask>
								</Col>
								<Col xs={12} sm={2}>
									<Button onClick={handleFindCnpj}>Buscar</Button>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for={"nomeFantasia"} xs={12} sm={3} md={2}>
									Nome Fantasia
								</Label>
								<Col xs={12} sm={9} md={10}>
									<Input
										type="text"
										id="nomeFantasia"
										onChange={handleChange}
										value={props.data.nomeFantasia}
										invalid={validateField("nomeFantasia")}
									/>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for={"razaoSocial"} xs={12} sm={3} md={2}>
									Razão Social
								</Label>
								<Col xs={12} sm={9} md={10}>
									<Input
										type="text"
										id="razaoSocial"
										onChange={handleChange}
										value={props.data.razaoSocial}
										invalid={validateField("razaoSocial")}
									/>
								</Col>
							</FormGroup>
						</>
					) : (
						<>
							<FormGroup row>
								<Label for={"cpf"} xs={4} sm={3} md={2}>
									CPF
								</Label>
								<Col xs={8} sm={6} md={5} lg={4} xl={3}>
									<InputMask
										id="cpf"
										mask="999.999.999/99"
										value={props.data.cpf}
										onChange={handleChange}
									>
										{(inputProps) => (
											<Input {...inputProps} invalid={validateField("cpf")} />
										)}
									</InputMask>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for={"nome"} xs={12} sm={3} md={2}>
									Nome Completo
								</Label>
								<Col xs={12} sm={9} md={10}>
									<Input
										type="text"
										id="nome"
										onChange={handleChange}
										value={props.data.nome}
										invalid={validateField("nome")}
									/>
								</Col>
							</FormGroup>
						</>
					)}
					<FormGroup row>
						<Label for={"telefone"} xs={12} sm={3} md={2}>
							Telefone
						</Label>
						<Col xs={12} sm={6} md={5} lg={4} xl={3}>
							<Input
								type="text"
								id="telefone"
								onChange={handleChange}
								value={props.data.telefone}
								invalid={validateField("telefone")}
								required
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Label for={"enderecoCep"} xs={3} sm={3} md={2}>
							CEP
						</Label>
						<Col xs={8} sm={6} md={3} lg={2} xl={2}>
							<InputMask
								id="enderecoCep"
								mask="99.999-999"
								value={props.data.enderecoCep}
								onChange={handleChange}
							>
								{(inputProps) => (
									<Input
										{...inputProps}
										invalid={validateField("enderecoCep")}
									/>
								)}
							</InputMask>
						</Col>
						<Col xs={12} sm={2}>
							<Button onClick={handleFindCep}>Buscar</Button>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Label for={"endereco"} xs={12} sm={3} md={2}>
							Endereço
						</Label>
						<Col xs={12} sm={9} md={6}>
							<Input
								type="text"
								id="endereco"
								onChange={handleChange}
								value={props.data.endereco}
								invalid={validateField("endereco")}
							/>
						</Col>
						<Label for={"enderecoNumero"} xs={12} sm={3} md={"auto"}>
							Número
						</Label>
						<Col>
							<Input
								type="text"
								id="enderecoNumero"
								onChange={handleChange}
								value={props.data.enderecoNumero}
								invalid={validateField("enderecoNumero")}
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Label for={"enderecoBairro"} xs={12} sm={3} md={2} lg={2}>
							Bairro
						</Label>
						<Col xs={12} sm={9} md={4}>
							<Input
								type="text"
								id="enderecoBairro"
								onChange={handleChange}
								value={props.data.enderecoBairro}
								invalid={validateField("enderecoBairro")}
							/>
						</Col>
						<Label for={"enderecoComplemento"} xs={12} sm={3} md={"auto"}>
							Complemento
						</Label>
						<Col>
							<Input
								type="text"
								id="enderecoComplemento"
								onChange={handleChange}
								value={props.data.enderecoComplemento}
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Label for={"enderecoCidade"} xs={12} sm={3} md={2} lg={2}>
							Cidade
						</Label>
						<Col xs={12} sm={9} md={5} lg={6}>
							<Input
								type="text"
								id="enderecoCidade"
								onChange={handleChange}
								value={props.data.enderecoCidade}
								invalid={validateField("enderecoCidade")}
							/>
						</Col>
						<Label for={"enderecoEstado"} xs={12} sm={3} md={"auto"}>
							Estado
						</Label>
						<Col>
							<SelectEstados
								id="enderecoEstado"
								onChange={handleChange}
								value={props.data.enderecoEstado}
								invalid={validateField("enderecoEstado")}
							/>
						</Col>
					</FormGroup>
				</Form>
			</CardBody>
			{isLoading ? <LoadingFullScreen /> : null}
		</Card>
	);
};

export default CardDadosFaturamento;

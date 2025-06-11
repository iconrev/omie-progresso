/* eslint-disable max-len */
import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableAvaliacao from "./TableAvaliacao";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";

class ProcessosAvaliacaoForm extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			showModalRedirect: false,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const id = this.state.companyId;

		const response = await AmbienteInternoService.getResourceInternoAvaliacao(
			"processos"
		);

		const { status, message } = response;

		if (status === "unauthorized") {
			console.warn("Usuário não possui acesso ao recurso comercial");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno`
			);
		}

		if (status !== "success") {
			toast.error(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno`
			);
		}

		let { analise } = response;
		analise = analise[this.state.exercicio_definido];

		if (analise.status === "dre_not_found") {
			this.setState({
				showModalRedirect: true,
			});
			return;
		}

		if (!analise) {
			console.error("Não há dados para o ano");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/processos/editar`
			);
		}

		if (analise.status === "diagnostic_not_found") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/processos/editar`
			);
		}

		if (status !== "success") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/processos/editar`
			);
		}

		const {
			processos,
			avaliacao,
			percentual_capacidade_produtiva,
			quantidade_entregue_funcionarios,
			produtividade,
			custos_garantia,
			quantidade_giro_estoque,
			faturamento_custo_folha,
		} = analise;

		if (processos) {
			this.setState({
				...processos,
				...avaliacao,
				processoId: processos.id,
				custos_garantia: custos_garantia,
				percentual_capacidade_produtiva: percentual_capacidade_produtiva,
				quantidade_entregue_funcionarios: quantidade_entregue_funcionarios,
				produtividade: produtividade,
				quantidade_giro_estoque: quantidade_giro_estoque,
				faturamento_custo_folha: faturamento_custo_folha,
			});
		}
	}

	modalDialogRedirect = () => {
		let modal = null;

		if (this.state.showModalRedirect) {
			modal = (
				<div>
					<Modal isOpen={this.state.showModalRedirect} className={""}>
						<ModalHeader>Como assim?</ModalHeader>
						<ModalBody>
							<p>
								Ainda não foi preenchido os dados referente ao Financeiro desta
								empresa. Vamos começar por lá?
							</p>
						</ModalBody>
						<ModalFooter>
							<Button
								color="primary"
								onClick={(e) => {
									e.preventDefault();
									this.props.history.push(
										`/hub/${this.state.companyId}/gestao/categoria/diagnostico/interno/financeiro`
									);
								}}
							>
								Vamos!
							</Button>{" "}
						</ModalFooter>
					</Modal>
				</div>
			);
		}

		return modal;
	};

	loaded() {
		const id = this.state.companyId;
		const ano = this.state.exercicio_definido;
		return (
			<div>
				<TableAvaliacao
					resource={"processos"}
					title={"Diagnóstico de Ambiente Interno"}
					subtitle={"Análise de Desempenho Processos"}
					ano={ano}
					history={this.props.history}
					edit={`/hub/${id}/gestao/categoria/diagnostico/interno/processos/editar`}
					data={[
						{
							categoria: "PRODUTIVIDADE",
							color: "success",
							itens: [
								{
									analise: "Receita Bruta / Custo de Pessoal",
									resultado: this.state.faturamento_custo_folha,
									avaliacao: this.state.smile_faturamento_custo_folha,
									id: "smile_faturamento_custo_folha",
									tipo: "R$",
									tooltip:
										"Múltiplo ($) da receita a cada 1 real investido em pessoas",
								},
								{
									analise: "Quantidade de Entregas por Funcionários",
									resultado: this.state.quantidade_entregue_funcionarios,
									avaliacao: this.state.smile_quantidade_entregue_funcionarios,
									id: "smile_quantidade_entregue_funcionarios",
									tooltip: "Múltiplo do volume produzido por funcionário",
								},
							],
						},
						{
							categoria: "QUALIDADE",
							color: "info",
							itens: [
								{
									analise: "% Refugo / Produzido",
									resultado: this.state.refugo_retrabalho,
									avaliacao: this.state.smile_refugo_retrabalho,
									tipo: "%",
									id: "smile_refugo_retrabalho",
									tooltip:
										"Relação % do total de perdas e/ou retrabalhos realizados com relação ao volume de serviços ou produtos entregues no período",
								},
								{
									analise: "% Custo Garantia / Receita Bruta",
									resultado: this.state.custos_garantia,
									avaliacao: this.state.smile_custos_garantia,
									id: "smile_custos_garantia",
									tipo: "%",
									tooltip:
										"Relação % do custo de garantia com relação a receita bruta",
								},
							],
						},
						{
							categoria: "EFICIÊNCIA",
							color: "warning",
							itens: [
								{
									analise: "% Utilização da Capacidade Produtiva",
									resultado: this.state.percentual_capacidade_produtiva,
									avaliacao: this.state.smile_percentual_capacidade_produtiva,
									id: "smile_percentual_capacidade_produtiva",
									tipo: "%",
									tooltip:
										"Relação % do volume de produtos ou serviços produzidos com relação a capacidade atual de pessoas e/ou máquinas",
								},
								{
									analise: "% Eficiência Operacional",
									resultado: this.state.percentual_disponibilidade_equipamento,
									avaliacao:
										this.state.smile_percentual_disponibilidade_equipamento,
									id: "smile_percentual_disponibilidade_equipamento",
									tipo: "%",
								},
								{
									analise: "% Entrega no Prazo",
									resultado: this.state.entregas_no_prazo,
									avaliacao: this.state.smile_entregas_no_prazo,
									id: "smile_entregas_no_prazo",
									tipo: "%",
									tooltip:
										"Relação % das entregas feitas no prazo com relação ao total de entregas feitas no período",
								},
							],
						},
						{
							categoria: "LOGÍSTICA",
							color: "danger",
							itens: [
								{
									analise: "Quantidade de Giro de Estoque",
									resultado: this.state.quantidade_giro_estoque,
									avaliacao: this.state.smile_quantidade_giro_estoque,
									id: "smile_quantidade_giro_estoque",
									tooltip: "Número de vezes no ano que o estoque será renovado",
								},
								{
									analise: "Valor de Estoque (R$)",
									resultado: this.state.valor_do_estoque,
									avaliacao: this.state.smile_valor_do_estoque,
									id: "smile_valor_do_estoque",
									tipo: "R$",
									tooltip: "Valor médio do estoque no período",
								},
							],
						},
					]}
				/>
				{this.modalDialogRedirect()}
			</div>
		);
	}

	render() {
		return this.state.isLoading ? <LoadingSpinner /> : this.loaded();
	}
}

export default ProcessosAvaliacaoForm;

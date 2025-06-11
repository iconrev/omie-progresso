/* eslint-disable max-len */
import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import TableAvaliacao from "./TableAvaliacao";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import CompanyService from "../../../../service/CompanyService";
import AmbienteInternoService from "../../../../service/Diagnostico/AmbienteInterno";

class VendasAvaliacaoForm extends Component {
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
			"comercial"
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

		if (analise.status === "diagnostic_not_found") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/comercial/editar`
			);
		}

		if (!analise) {
			console.error("Não há dados para o ano");
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/comercial/editar`
			);
		}

		if (status !== "success") {
			toast.warn(message);
			return this.props.history.push(
				`/hub/${id}/gestao/categoria/diagnostico/interno/comercial/editar`
			);
		}

		const { ticket_medio, percentual_clientes_ativos, vendas, avaliacao } =
			analise;
		const {
			taxa_conversao,
			taxa_reclamacao_nf,
			percentual_clientes_fidelizados,
		} = analise;

		if (vendas) {
			this.setState({
				vendasId: vendas.id,
				propostas_enviadas_no_ano: vendas.propostas_enviadas_no_ano,
				novos_clientes_no_ano: vendas.novos_clientes_no_ano,
				notas_fiscais_emitidas: vendas.notas_fiscais_emitidas,
				clientes_fidelizados: vendas.clientes_fidelizados,
				carteira_de_clientes_ativa: vendas.carteira_de_clientes_ativa,
				reclamacoes_clientes: vendas.reclamacoes_clientes,
				clientes_perdidos: vendas.clientes_perdidos,
				propostas_aprovadas_no_ano: vendas.propostas_aprovadas_no_ano,
				base_clientes: vendas.base_clientes,
				ticket_medio: ticket_medio,
				percentual_clientes_ativos: percentual_clientes_ativos,
				percentual_clientes_fidelizados: percentual_clientes_fidelizados,
				nivel_relacionamento_clientes: vendas.nivel_relacionamento_clientes,
				taxa_reclamacao_nf: taxa_reclamacao_nf,
				taxa_conversao: taxa_conversao,
				...avaliacao,
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

	loaded = () => {
		const id = this.state.companyId;
		const ano = this.state.exercicio_definido;
		return (
			<div>
				<TableAvaliacao
					resource={"comercial"}
					title={"Diagnóstico de Ambiente Interno"}
					subtitle={"Análise de Desempenho Comercial"}
					ano={ano}
					history={this.props.history}
					edit={`/hub/${id}/gestao/categoria/diagnostico/interno/comercial/editar`}
					data={[
						{
							categoria: "MARKTING",
							color: "success",
							itens: [
								{
									analise: "% Clientes Ativos",
									resultado: this.state.percentual_clientes_ativos,
									avaliacao: this.state.smile_percentual_clientes_ativos,
									id: "smile_percentual_clientes_ativos",
									tipo: "%",
									tooltip:
										"Relação % da base de clientes ativos com a base de clientes cadastrados",
								},
								{
									analise: "# Novos Clientes",
									resultado: this.state.novos_clientes_no_ano,
									avaliacao: this.state.smile_novos_clientes_no_ano,
									id: "smile_novos_clientes_no_ano",
									tipo: "int",
									tooltip: "Número de clientes novos no período",
								},
							],
						},
						{
							categoria: "VENDAS",
							color: "primary",
							itens: [
								{
									analise: "% Conversão de Propostas",
									resultado: this.state.taxa_conversao,
									avaliacao: this.state.smile_taxa_conversao,
									tipo: "%",
									id: "smile_taxa_conversao",
									tooltip:
										"Relação % das propostas aprovadas com relação as enviadas",
								},
								{
									analise: "Ticket Médio",
									resultado: this.state.ticket_medio,
									avaliacao: this.state.smile_ticket_medio,
									tipo: "R$",
									id: "smile_ticket_medio",
									tooltip: "Média do valor das NF emitidas no período",
								},
							],
						},
						{
							categoria: "RELACIONAMENTO",
							color: "warning",
							itens: [
								{
									analise: "% Clientes Fidelizados",
									resultado: this.state.percentual_clientes_fidelizados,
									avaliacao: this.state.smile_clientes_fidelizados,
									tipo: "%",
									id: "smile_clientes_fidelizados",
									tooltip:
										"Relação % dos clientes fidelizados com relação ao total de clientes ativos",
								},
								{
									analise: "% Nível de relacionamento com Cliente",
									resultado: this.state.nivel_relacionamento_clientes,
									avaliacao: this.state.smile_nivel_relacionamento_clientes,
									tipo: "%",
									id: "smile_nivel_relacionamento_clientes",
									tooltip:
										"Estabelece o % de implementação dos processos chave de relacionamento com clientes",
								},
							],
						},
						{
							categoria: "SATISFAÇÃO",
							color: "danger",
							itens: [
								{
									analise: "# Clientes Perdidos",
									resultado: this.state.clientes_perdidos,
									avaliacao: this.state.smile_clientes_perdidos,
									id: "smile_clientes_perdidos",
									tipo: "int",
									tooltip:
										"Total de clientes que deixaram de ser ativos no período",
								},
								{
									analise: "% Reclamações/NF emitida",
									resultado: this.state.taxa_reclamacao_nf,
									avaliacao: this.state.smile_taxa_reclamacao_nf,
									tipo: "%",
									id: "smile_taxa_reclamacao_nf",
									tooltip:
										"Relação % entre número de reclamações com relação a quantidade de NF emitidas no período",
								},
							],
						},
					]}
				/>
				{this.modalDialogRedirect()}
			</div>
		);
	};

	render() {
		return this.state.isLoading ? <LoadingSpinner /> : this.loaded();
	}
}
export default VendasAvaliacaoForm;

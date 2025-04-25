import React from "react";

const Administrativo = React.lazy(() => import("./views/Administrativo/index"));
const PainelAssociados = React.lazy(() =>
	import("./views/Administrativo/Associados/PainelAssociados")
);
const AssociadosPendentes = React.lazy(() =>
	import("./views/Administrativo/Associados/Pendentes/index")
);
const PainelUsuarios = React.lazy(() =>
	import("./views/Administrativo/Usuarios/PainelUsuarios")
);
const PainelLogs = React.lazy(() =>
	import("./views/Administrativo/Logs/index")
);
const PlaylistSimbiose = React.lazy(() => import("./views/Playlist"));
const PainelEmpresas = React.lazy(() =>
	import("./views/Administrativo/Empresas/PainelEmpresas")
);
const CardPremium = React.lazy(() =>
	import("./views/Administrativo/Empresas/Premium/index")
);
const SolicitacaoAssociado = React.lazy(() =>
	import("./views/Cadastros/SolicitacaoAssociado")
);
const AreaAssociado = React.lazy(() => import("./views/AreaAssociado"));
const Dashboard = React.lazy(() => import("./views/Dashboard/Dashboard"));
const Empresas = React.lazy(() => import("./views/Cadastros/Empresas"));
const Gestao = React.lazy(() => import("./views/Gestao/Gestao"));
const ScreenUsersCompany = React.lazy(() =>
	import("./views/Gestao/Usuarios/index")
);
const ExecutiveStrategyPlan = React.lazy(() =>
	import("./views/Gestao/Plano/index")
);
// const IntegracaoOmie = React.lazy(() =>
// 	import("./views/Gestao/Integracao/index")
// );
const ScreenConfigCompany = React.lazy(() =>
	import("./views/Gestao/Config/index")
);
const EmpresaPremiumSolicitacao = React.lazy(() =>
	import("./views/Gestao/EmpresaPremiumSolicitacao/index")
);
const Diagnostico = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Diagnostico")
);
const PainelExterno = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Externo/Painel")
);
const Concorrentes = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Externo/ConcorrenteForm")
);
const Clientes = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Externo/ClienteForm")
);
const Fornecedores = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Externo/FornecedorForm")
);
const Macro = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Externo/MacroForm")
);
const Questionario = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Questionario/Form")
);
const PainelInterno = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/Painel")
);
const Financeiro = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/Financeiro")
);
const FinanceiroDre = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/FinanceiroDre")
);
const Vendas = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/Comercial")
);
const VendasAvaliacao = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/ComercialAvaliacao")
);
const Processos = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/Processos")
);
const ProcessosAvaliacao = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/ProcessosAvaliacao")
);
const Pessoas = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/Pessoas")
);
const Metas = React.lazy(() => import("./views/Gestao/Metas/Metas"));
const MapaEstrategiasDefinicao = React.lazy(() =>
	import("./views/Gestao/Metas/Mapa/MapaEstrategiasDefinicao")
);
const MetasFinanceiro = React.lazy(() =>
	import("./views/Gestao/Metas/Financeiro")
);
const MetasRentabilidade = React.lazy(() =>
	import("./views/Gestao/Metas/Financeiro_Rentabilidade")
);
const MetasCustos = React.lazy(() =>
	import("./views/Gestao/Metas/Financeiro_Custos")
);
const MetasOrcamento = React.lazy(() =>
	import("./views/Gestao/Metas/Financeiro_Orcamento")
);
const MetasEndividamento = React.lazy(() =>
	import("./views/Gestao/Metas/Financeiro_Endividamento")
);
const MetasVendas_Marketing = React.lazy(() =>
	import("./views/Gestao/Metas/Vendas_Marketing")
);
const MetasVendas = React.lazy(() => import("./views/Gestao/Metas/Vendas"));
const MetasRelacionamento = React.lazy(() =>
	import("./views/Gestao/Metas/Vendas_Relacionamento")
);
const MetasSatisfacaoClientes = React.lazy(() =>
	import("./views/Gestao/Metas/Vendas_Satisfacao_Clientes")
);
const MetasProcessos = React.lazy(() =>
	import("./views/Gestao/Metas/Processos")
);
const MetasProcessosQualidade = React.lazy(() =>
	import("./views/Gestao/Metas/Processos_Qualidade")
);
const MetasProcessosEficiencia = React.lazy(() =>
	import("./views/Gestao/Metas/Processos_Eficiencia")
);
const MetasProcessosLogistica = React.lazy(() =>
	import("./views/Gestao/Metas/Processos_Logistica")
);
const MetasPessoas = React.lazy(() => import("./views/Gestao/Metas/Pessoas"));
const MetasPessoasEngajamento = React.lazy(() =>
	import("./views/Gestao/Metas/Pessoas_Engajamento")
);
const MetasPessoasRetencao = React.lazy(() =>
	import("./views/Gestao/Metas/Pessoas_Retencao")
);
const MetasPessoasInovacao = React.lazy(() =>
	import("./views/Gestao/Metas/Pessoas_Inovacao")
);
const PessoasAvaliacao = React.lazy(() =>
	import("./views/Gestao/Diagnostico/Interno/PessoasAvaliacao")
);
const Profile = React.lazy(() => import("./views/Cadastros/UsuarioPerfil"));
const Diretrizes = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Diretrizes")
);
const EstrategiasAnos = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Execucao/EstrategiasAnos")
);
const PlanoAcao = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Execucao/Estrategias/PlanoAcao")
);
const Eficiencia = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Execucao/Eficiencia")
);
const Eficacia = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Eficacia/Eficacia")
);
const Dashboard_Eficacia = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Dashboard/DashboardEficacia")
);
const DREMensal = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Eficacia/DREMensal/DRE")
);
const Levantamento = React.lazy(() =>
	import("./views/Gestao/Diretrizes/Eficacia/Levantamento/Levantamento")
);

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
	{
		path: "/administrativo",
		name: "Painel Administrativo",
		component: Administrativo,
		exact: true,
	},
	{
		path: "/administrativo/associados",
		name: "Associados",
		component: PainelAssociados,
		exact: true,
	},
	{
		path: "/administrativo/associados/pendentes",
		name: "Pendentes",
		component: AssociadosPendentes,
		exact: true,
	},
	{
		path: "/administrativo/usuarios",
		name: "Usuários",
		component: PainelUsuarios,
		exact: true,
	},
	{
		path: "/administrativo/empresas",
		name: "Empresas",
		component: PainelEmpresas,
		exact: true,
	},
	{
		path: "/administrativo/empresas/premium",
		name: "Premium",
		component: CardPremium,
		exact: true,
	},
	{
		path: "/administrativo/logs",
		name: "Logs",
		component: PainelLogs,
		exact: true,
	},
	{
		path: "/upgrade",
		name: "Solicitação Upgrade",
		component: SolicitacaoAssociado,
		exact: true,
	},
	{
		path: "/associado",
		name: "Área do Associado",
		component: AreaAssociado,
		exact: true,
	},
	{ path: "/dashboard", exact: true, name: "Dashboard", component: Dashboard },
	{ path: "/empresas", name: "Empresas", component: Empresas, exact: true },
	{
		path: "/playlist",
		name: "Playlist",
		component: PlaylistSimbiose,
		exact: true,
	},
	{ path: "/profile", name: "Perfil", component: Profile, exact: true },
	{ path: "/hub/:id/gestao", name: "Gestão", component: Gestao, exact: true },
	{
		path: "/hub/:id/gestao/usuarios",
		name: "Gerenciar Usuários",
		component: ScreenUsersCompany,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/plano",
		name: "Plano Estratégico Executivo",
		component: ExecutiveStrategyPlan,
		exact: true,
	},
	// {
	// 	path: "/hub/:id/gestao/integracao",
	// 	name: "Integração Omie",
	// 	component: IntegracaoOmie,
	// 	exact: true,
	// },
	{
		path: "/hub/:id/gestao/empresa",
		name: "Configurações",
		component: ScreenConfigCompany,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/assinar",
		name: "Upgrade Premium",
		component: EmpresaPremiumSolicitacao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico",
		name: "Diagnóstico",
		component: Diagnostico,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/sobrevivencia",
		name: "Sobrevivência",
		component: Questionario,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/externo",
		name: "Ambiente Externo",
		component: PainelExterno,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/externo/concorrentes",
		name: "Concorrentes",
		component: Concorrentes,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/externo/clientes",
		name: "Clientes",
		component: Clientes,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/externo/fornecedores",
		name: "Fornecedores",
		component: Fornecedores,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/externo/macro",
		name: "Macro",
		component: Macro,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno",
		name: "Ambiente Interno",
		component: PainelInterno,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/financeiro",
		name: "Financeiro",
		component: Financeiro,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/financeiro/dre",
		name: "DRE",
		component: FinanceiroDre,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/comercial",
		name: "Comercial",
		component: VendasAvaliacao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/comercial/editar",
		name: "Editar",
		component: Vendas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/processos/editar",
		name: "Editar",
		component: Processos,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/processos",
		name: "Processos",
		component: ProcessosAvaliacao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/pessoas/editar",
		name: "Editar",
		component: Pessoas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diagnostico/interno/pessoas",
		name: "Pessoas",
		component: PessoasAvaliacao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas",
		name: "Metas",
		component: Metas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro",
		name: "Financeiro",
		component: MetasFinanceiro,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro/receitas",
		name: "Faturamento",
		component: MetasFinanceiro,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro/rentabilidade",
		name: "Rentabilidade",
		component: MetasRentabilidade,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro/custos",
		name: "Custos",
		component: MetasCustos,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro/orcamento",
		name: "Orçamento",
		component: MetasOrcamento,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/financeiro/endividamento",
		name: "Endividamento",
		component: MetasEndividamento,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/comercial",
		name: "Comercial",
		component: MetasVendas_Marketing,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/comercial/marketing",
		name: "Marketing",
		component: MetasVendas_Marketing,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/comercial/vendas",
		name: "Vendas",
		component: MetasVendas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/comercial/relacionamento",
		name: "Relacionamento",
		component: MetasRelacionamento,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/comercial/satisfacao",
		name: "Satisfação",
		component: MetasSatisfacaoClientes,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/processos",
		name: "Processos",
		component: MetasProcessos,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/processos/produtividade",
		name: "Produtividade",
		component: MetasProcessos,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/processos/qualidade",
		name: "Qualidade",
		component: MetasProcessosQualidade,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/processos/eficiencia",
		name: "Eficiência",
		component: MetasProcessosEficiencia,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/processos/logistica",
		name: "Logística",
		component: MetasProcessosLogistica,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/pessoas",
		name: "Pessoas",
		component: MetasPessoas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/pessoas/competencias",
		name: "Pessoas",
		component: MetasPessoas,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/pessoas/engajamento",
		name: "Engajamento",
		component: MetasPessoasEngajamento,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/pessoas/retencao",
		name: "Retenção",
		component: MetasPessoasRetencao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/pessoas/inovacao",
		name: "Inovação",
		component: MetasPessoasInovacao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/metas/estrategias",
		name: "Priorização de Estratégias",
		component: MapaEstrategiasDefinicao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes",
		name: "Diretrizes",
		component: Diretrizes,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/estrategias",
		name: "Organização das Estratégias",
		component: EstrategiasAnos,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/estrategias/:perspectiva/:estrategiaId",
		name: "Plano de Ações",
		component: PlanoAcao,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/eficiencia",
		name: "Eficiência",
		component: Eficiencia,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/eficacia",
		name: "Eficácia",
		component: Eficacia,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/eficacia/dre",
		name: "DRE Mensal",
		component: DREMensal,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/eficacia/levantamento",
		name: "Levantamento",
		component: Levantamento,
		exact: true,
	},
	{
		path: "/hub/:id/gestao/categoria/diretrizes/dashboard",
		name: "Dashboard da Eficácia",
		component: Dashboard_Eficacia,
		exact: true,
	},
];

export default routes;

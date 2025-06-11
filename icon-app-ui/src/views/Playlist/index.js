/* eslint-disable max-len */
import { useState, useEffect, useMemo } from "react";
import { Col, Container, Modal, Row, Table, Button } from "reactstrap";
import LoadingSpinner from "../../components/LoadingSpinner";
import CompanyService from "../../service/CompanyService";

const playlistUrl = [
	{
		title: "Diagnóstico de Sobrevivência",
		code: "8cq-B-fKqHI",
	},
	{
		title: "Análise de Concorrentes",
		code: "flJVyL2bKWs",
	},
	{
		title: "Swot de Concorrentes",
		code: "j5RZTCTTH30",
	},
	{
		title: "Análise de Competitividade Sob a Perspectiva Dos Clientes",
		code: "KCQSiffrf3w",
	},
	{
		title: "Analise SWOT de Clientes",
		code: "fgLkNssx4-s",
	},
	{
		title: "Analise de Competitividade Sob a Perspectiva dos Fornecedores",
		code: "M-Kc8eau1xM",
	},
	{
		title: "Analise SWOT de Fornecedores",
		code: "m7I6Pvsz0vw",
	},
	{
		title: "Analise de Macro Ambiente",
		code: "9Ek9BtH6lag",
	},
	{
		title: "Análise Financeira Interna",
		code: "bbZvQcIJ5X0",
	},
	{
		title: "Análise de Ambiente (Processos Internos)",
		code: "2s0eO6m0WGU",
	},
	{
		title: "Análise de Ambiente (Clientes e Vendas)",
		code: "jAE0kZ1pyDo",
	},
	{
		title: "Análise de Ambiente Interno: Pessoas",
		code: "rusFxoOvIHE",
	},
	{
		title: "Revisão Dos Procedimentos e Análise",
		code: "6i6jaAUGmRI",
	},
	{
		title: "Análise SWOT",
		code: "6B8SE85p_mI",
	},
	{
		title: "Simbiose na Prática: Depoimento de Um Cliente Contador Consultor",
		code: "wP7nWhCGYMY",
	},
	{
		title: "Case de Sucesso: Simbiose",
		code: "fybycF1tWVY",
	},
	{
		title: "Definição de Estratégias e Metas Financeiras Dentro do Simbiose",
		code: "AXgWE6kE7mo",
	},
	{
		title: "Planejamento Orçamentário Dentro do Simbiose",
		code: "nVkx57r8wCE",
	},
	{
		title: "Planejamento Orçamentário Dentro do Simbiose - Endividamento",
		code: "gBgihI3ARE0",
	},
	{
		title:
			"Planejamento Comercial no Simbiose - Definição de Objetivos Estratégias e Metas",
		code: "fiDfqbr3p_o",
	},
	{
		title:
			"Objetivos, Metas e Estratégias de Taxa de Conversão de Proposta no Simbiose",
		code: "QpBCVdEVBOs",
	},
	{
		title: "Planejamento Comercial no Simbiose - Satisfação de Clientes",
		code: "_w_n2cu96Lg",
	},
	{
		title: "Perspectiva de Processos: Produtividade dos Processos",
		code: "ZrBDGxOnD1s",
	},
	{
		title: "Perspectiva de Processos: Qualidade",
		code: "otIyjMDxRMk",
	},
	{
		title: "Perspectiva de Processos: Eficiência",
		code: "jnBjxNHGv_0",
	},
	{
		title: "Perspectiva de Processos: Logística",
		code: "HS1ZLWiCHb8",
	},
	{
		title: "Perspectivas de Pessoas: Fator de Competências",
		code: "ojWAtNR1E9E",
	},
	{
		title: "Perspectiva de Pessoas: Engajamento e Retenção",
		code: "EANM-xlr60g",
	},
	{
		title: "Inovação e Planejamento Estratégico",
		code: "4xjAOJyfww8",
	},
];

const VideoModal = (props) => {
	const { video, onClose } = props;

	const url = "https://www.youtube.com/embed/" + video.code;

	return (
		<Modal centered isOpen={true} toggle={onClose}>
			<iframe
				width="560"
				height="315"
				src={url}
				title={video.title}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		</Modal>
	);
};

const VideoInfo = (props) => {
	const { video, ep, setVideoModal } = props;

	const thumbnail = "https://i.ytimg.com/vi/" + video.code + "/hqdefault.jpg";

	return (
		<tr
			style={{ backgroundColor: "#fff", cursor: "pointer" }}
			onClick={setVideoModal}
		>
			<td className={"text-center"} style={{ maxWidth: "25%" }}>
				<strong>#{ep}</strong>
			</td>
			<td className={"text-center d-none d-sm-table-cell"}>
				<img alt="" width="120" src={thumbnail} />
			</td>
			<td>
				<div>{video.title}</div>
				<div className={"small text-muted"}>{video.description}</div>
			</td>
			<td style={{ maxWidth: "33%" }}>
				<Button
					color="secondary"
					size="sm"
					title={`Assistir episódio #${ep}`}
					onClick={setVideoModal}
					block={true}
				>
					<strong>ASSISTIR</strong>
					<i className="fa fa-play-circle pl-2" />
				</Button>
			</td>
		</tr>
	);
};

const Playlist = () => {
	const [isLoading, setLoading] = useState(true);
	const [playlist, setPlaylist] = useState([]);
	const [videoModal, setVideoModal] = useState(null);

	const videos = useMemo(() => {
		return playlist.map((video, index) => {
			return (
				<VideoInfo
					key={index}
					video={video}
					ep={index + 1}
					setVideoModal={() => setVideoModal(video)}
				/>
			);
		});
	});

	useEffect(() => {
		CompanyService.removeCompanyLocalStorage();
		setPlaylist(playlistUrl);
		setLoading(false);
	}, []);

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	return (
		<Container>
			<Row>
				<Col xs={12}>
					{playlist.length > 0 && (
						<div className="table-responsive-lg mb-4">
							<Table hover className={"table-outline"}>
								<thead className={"thead-light"}>
									<tr>
										<th className={"text-center"} />
										<th className={"text-center d-none d-sm-table-cell"} />
										<th className={"text-center"}>Episódio</th>
										<th className={"text-center"} />
									</tr>
								</thead>
								<tbody>{videos}</tbody>
							</Table>
						</div>
					)}
				</Col>
			</Row>
			{videoModal && (
				<VideoModal video={videoModal} onClose={() => setVideoModal(null)} />
			)}
		</Container>
	);
};

export default Playlist;

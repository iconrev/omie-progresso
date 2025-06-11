import { useState } from "react";
import useQuery from "../../hooks/useQuery";
import ReportDiagnostico from "./reportDiagnostico";
import { useEffect } from "react";
// import reportDiagnostico from "../../mocks/reportDiagnostico.json";

function getComponentBySlug(report_type, params) {
	if (report_type === "diagnostico")
		return <ReportDiagnostico params={params} />;

	return <div>Relatório não encontrado</div>;
}

export default function ReportView() {
	const query = useQuery();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [params, setParams] = useState(null);

	useEffect(() => {
		(async () => {
			const reqId = query.get("req_id");
			const keyVerify = query.get("key_verify");
			if (!reqId) {
				setError(true);
				setLoading(false);
				return;
			}

			let response = await fetch(`https://api.simbiose-preview.omie.com.br/service-base/getReport?req_id=${reqId}&key_verify=${keyVerify}`)

			response = await response.json()

			console.log("REPONSE", response.Item.data)

			// TODO: faz a requisição aqui
			// se sucesso, atualiza params com setParams
			setParams(response.Item.data);

			setLoading(false);
		})();
	}, []);

	console.log("**********************************************");
	console.log("Render ReportView");
	console.log("Loading:", loading);
	console.log("params:", params);
	console.log("error:", error);

	if (loading) return <div>Carregando dados</div>;
	if (error || params === null) return <div>Erro ao carregar dados</div>;
	if (!params.report_type) return <div>Slug não encontrado</div>;

	console.log("report_type:", params.report_type);

	return (
		<div id={"report-body"}>
			{getComponentBySlug(params.report_type, params)}
		</div>
	);
}

import ReportExterno from "./ReportExterno";
import ReportInterno from "./ReportInterno";
import ReportSobrevivencia from "./ReportSobrevivencia";
import ReportCapa from "./reportCapa";

import styles from './Page.module.css'

export default function ReportDiagnostico(props) {
	console.log("**********************************************");
	console.log("Render ReportView");
	console.log(props);

	const { params } = props;

	return (
		<>
			<div className={styles.page}>
				<ReportCapa params={params} />
			</div>
				{/* <div>Relatório Diagnóstico - {params.year}</div> */}
			<div className={styles.page}>
				<ReportSobrevivencia params={params} />
			</div>
				<ReportExterno params={params} />
				<ReportInterno params={params} />
		</>
	);

	// return (
	// 	<div>
	// 		<GaugeChart
	// 			className="chart-wrapper"
	// 			id="vish"
	// 			textColor="#212121"
	// 			percent={params.get("percent") / 100}
	// 			needleColor="#CDC9C9"
	// 			needleBaseColor="#CDC9C9"
	// 			colors={["red", "yellow", "green"]}
	// 			style={{ width: "100%" }}
	// 		/>
	// 	</div>
	// );
}

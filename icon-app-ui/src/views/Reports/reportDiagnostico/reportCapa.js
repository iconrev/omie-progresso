import logo from "../../../assets/img/brand/omie_logo_novo.png";
import SRD1 from "../../../assets/img/reports/Simbiose-Relatorio-Img-1.png";
import SRD2 from "../../../assets/img/reports/Simbiose-Relatorio-Img-2.png";
import SRD3 from "../../../assets/img/reports/Simbiose-Relatorio-Img-3.png";


// import styles from './Page.module.css'


export default function ReportCapa(props) {
	const { params } = props;


	console.log('Params eita ->', params)


	const centerText = {
		margin: "auto",
		width: "80%",
		// border: "3px solid green",
		padding: "60px",
		marginRight: "auto",
		marginLeft: "auto",
		textAlign: "center",
		fontSize: "50px",
		
	}

	const textHeader = {
		margin: "auto",
		width: "70%",
		// border: "3px solid green",
		padding: "60px",
		marginRight: "auto",
		marginLeft: "auto",
		textAlign: "center",
		fontSize: "60px"
	}
	return (
		<>
			<img src={logo} style={{ marginTop: "15px", width: 300, alt: "Omie", marginRight: "auto", marginLeft: "auto", display: "block" }} />

			<div style={textHeader}>Gestão Estratégica</div>
			<div style={textHeader}>Relatório Simbiose</div>

			<div style={{width: 1000, marginRight: "auto", marginLeft: "auto", display: "block", textAlign: "center"}}>
				<img src={SRD1} style={{ width: 300}} />
				<img src={SRD2} style={{ width: 300}} />
				<img src={SRD3} style={{ width: 300}} />
			</div>
			<div style={centerText}>Diagnóstico Swot</div>

			<div style={centerText}>
			<div >{params.company_name}</div>
			<div >{params.company_cnpj}</div>
			<div >{params.user_name}</div>
			</div>
			<div style={{fontSize: "30px", marginTop: "200px"}}>{params.date}</div>

		</>
	);
}

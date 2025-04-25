// import 'react-app-polyfill/ie9'; // For IE 9-11 support
import "react-app-polyfill/ie11"; // For IE 11 support
import "react-app-polyfill/stable";
import "./polyfill";
import "./index.css";
import ReactDOM from "react-dom";
import { IntlProvider } from "react-intl";
import { Amplify, Auth } from "aws-amplify";
import config from "./service/config";
import TimeAgo from "javascript-time-ago";
import pt from "javascript-time-ago/locale/pt";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// console.disableYellowBox = true;

const custom_header = async () => {
	const stage =
		typeof process.env.REACT_APP_STAGE === "undefined"
			? "qa"
			: process.env.REACT_APP_STAGE;
	if (stage === "prod-local" || stage === "qa-local" || stage === "dev") {
		const user_id = (await Auth.currentAuthenticatedUser())["attributes"][
			"sub"
		];
		return { user_id: user_id };
	} else {
		return null;
	}
};

Amplify.configure({
	Auth: {
		mandatorySignIn: true,
		region: config.cognito.REGION,
		userPoolId: config.cognito.USER_POOL_ID,
		identityPoolId: config.cognito.IDENTITY_POOL_ID,
		userPoolWebClientId: config.cognito.APP_CLIENT_ID,
	},
	Storage: {
		AWSS3: {
			bucket: config.storage.BUCKET,
			region: config.storage.REGION,
			identityPoolId: config.storage.IDENTITY_POOL_ID,
		},
	},
	API: {
		endpoints: [
			{
				name: "api-base",
				endpoint: config.apiGateway["api-base"].URL,
				region: config.apiGateway["api-base"].REGION,
				custom_header: custom_header,
			},
			{
				name: "api-interno",
				endpoint: config.apiGateway["api-interno"].URL,
				region: config.apiGateway["api-interno"].REGION,
				custom_header: custom_header,
			},
			{
				name: "api-externo",
				endpoint: config.apiGateway["api-externo"].URL,
				region: config.apiGateway["api-externo"].REGION,
				custom_header: custom_header,
			},
			{
				name: "api-metas",
				endpoint: config.apiGateway["api-metas"].URL,
				region: config.apiGateway["api-metas"].REGION,
				custom_header: custom_header,
			},
		],
	},
});

const container = document.getElementById("root");

ReactDOM.render(
	<IntlProvider locale="pt-BR">
		<App />
	</IntlProvider>,
	container
);

TimeAgo.addDefaultLocale(pt);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

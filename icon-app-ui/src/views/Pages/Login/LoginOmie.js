import { Button } from "reactstrap";
import { Api_Base } from "../../../service/api_base";
import useOmieOAuth2 from "../../../hooks/useOmieOAuth2";
import OmieFavicon from "../../../assets/img/brand/omie_favicon.png";
import { LocalStorageService } from "../../../service/localStorageService";
import { logoutUsuario } from "../../../service/services";
import userService from "../../../service/UserService";

const isPreview =
	document.location.origin.includes("preview") ||
	document.location.origin.includes("localhost");
const CLIENT_ID = isPreview
	? "e21f05153f6fb1bcb11bc6475c1df9d0"
	: "603b11553a9645ca2847e311f7238d26";
const REDIRECT_TO = `${document.location.origin}/#/login/callback`;

export default function LoginOmie() {
	const callbackSuccess = async (payload) => {
		console.log("Success", payload);

		const response = await Api_Base.get(
			`/cadastros/usuarios/login/sso/${encodeURIComponent(payload.code)}`
		);
		console.log("response sso", response);

		const {
			status,
			message,
			attributes,
			admin,
			profile,
			contador,
			access_token,
			refresh_token,
			auth_by,
		} = response.data;
		if (status === "success") {
			console.info("INFO:", "Usuário autenticado com sucesso.");
			LocalStorageService.setToken(access_token);
			LocalStorageService.setRefreshToken(refresh_token);
			LocalStorageService.setUser(attributes);
			userService.setContador(contador);
			userService.setAdmin(admin);
			userService.setProfile(profile);
			userService.setLogged(true);
			window.location.href = "/#/dashboard";
		} else {
			console.log("ERROR vincularUsuario: ", message);
			await logoutUsuario();
		}
	};
	const callbackError = (error) => {
		console.log("Error", error);
	};

	const oauth = useOmieOAuth2({
		clientId: CLIENT_ID,
		redirectUri: REDIRECT_TO,
		scope: "openid profile offline_access",
		responseType: "code",
		onSuccess: callbackSuccess,
		onError: callbackError,
	});

	const onClickOmie = () => {
		oauth.getAuth();
	};

	return (
		<Button
			type="submit"
			color="primary"
			className="px-4"
			onClick={onClickOmie}
		>
			<img src={OmieFavicon} alt="omie" width="20px" className={"mr-2"} />
			Continuar com o Omie
		</Button>
	);
}

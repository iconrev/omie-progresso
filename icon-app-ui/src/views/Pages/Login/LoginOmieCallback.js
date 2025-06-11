import { useEffect } from "react";
import {
	OAUTH_RESPONSE,
	checkState,
	isWindowOpener,
	openerPostMessage,
	queryToObject,
} from "../../../hooks/useOmieOAuth2";
import LoadingFullScreen from "../../../components/LoadingFullScreen";

export default function LoginSSOCallback() {
	useEffect(() => {
		(async () => {
			const payload = {
				...queryToObject(window.location.search.split("?")[1]),
				...queryToObject(window.location.hash.split("#")[0]),
				...queryToObject(window.location.hash.split("#")[1]),
			};

			if (payload["/login/callback?state"]) {
				payload["state"] = payload["/login/callback?state"];
			}

			console.info("payload", payload);

			const state = payload?.state;
			const error = payload?.error;
			const opener = window?.opener;

			if (isWindowOpener(opener)) {
				const stateOk = state && checkState(state);

				if (!error && stateOk) {
					openerPostMessage(opener, {
						type: OAUTH_RESPONSE,
						payload,
					});
				} else {
					const errorMessage = error
						? decodeURI(error)
						: !stateOk
						? "OAuth error: State mismatch."
						: "OAuth error: An error has occured.";
					openerPostMessage(opener, {
						type: OAUTH_RESPONSE,
						error: errorMessage,
					});
				}
			} else {
				throw new Error("No window opener");
			}
		})();
	}, []);

	return <LoadingFullScreen />;
}

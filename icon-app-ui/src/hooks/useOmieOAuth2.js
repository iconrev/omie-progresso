import { useCallback, useRef, useState } from "react";
import useLocalStorageState from "use-local-storage-state";

export const POPUP_HEIGHT = 610;
export const POPUP_WIDTH = 660;
export const OAUTH_STATE_KEY = "react-use-omie-oauth2-state-key";
export const OAUTH_RESPONSE = "react-use-omie-oauth2-response";
export const DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD = "POST";

const isPreview =
	document.location.origin.includes("preview") ||
	document.location.origin.includes("localhost");
const OMIE_AUTH_URL = isPreview
	? "https://appdsv.omie.com.br/login/oauth2"
	: "https://app.omie.com.br/login/oauth2";

export const objectToQuery = (object) => {
	return new URLSearchParams(object).toString();
};

export const queryToObject = (query) => {
	const parameters = new URLSearchParams(query);
	return Object.fromEntries(parameters.entries());
};

export const formatAuthorizeUrl = (
	clientId,
	redirectUri,
	scope,
	state,
	responseType,
	extraQueryParameters = {}
) => {
	const query = objectToQuery({
		response_type: responseType,
		client_id: clientId,
		redirect_uri: redirectUri,
		scope,
		state,
		...extraQueryParameters,
	});

	return `${OMIE_AUTH_URL}?${query}`;
};

export const generateState = () => {
	const validChars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let array = new Uint8Array(40);
	window.crypto.getRandomValues(array);
	array = array.map((x) => validChars.codePointAt(x % validChars.length));
	const randomState = String.fromCharCode.apply(null, array);
	return randomState;
};

export const saveState = (state) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

export const removeState = () => {
	sessionStorage.removeItem(OAUTH_STATE_KEY);
};

export const checkState = (receivedState) => {
	const state = sessionStorage.getItem(OAUTH_STATE_KEY);
	return state === receivedState;
};

export const openPopup = (url) => {
	const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
	const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
	return window.open(
		url,
		"OAuth2 Popup",
		`height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
	);
};

export const closePopup = (popupRef) => {
	popupRef.current?.close();
};

export const isWindowOpener = (opener) =>
	opener !== null && opener !== undefined;

export const openerPostMessage = (opener, message) =>
	opener.postMessage(message);

export const cleanup = (intervalRef, popupRef, handleMessageListener) => {
	clearInterval(intervalRef.current);
	if (popupRef.current && typeof popupRef.current.close === "function")
		closePopup(popupRef);
	removeState();
	window.removeEventListener("message", handleMessageListener);
};

export const formatExchangeCodeForTokenServerURL = (
	exchangeCodeForTokenServerURL,
	clientId,
	code,
	redirectUri,
	state
) => {
	const url = exchangeCodeForTokenServerURL.split("?")[0];
	const anySearchParameters = queryToObject(
		exchangeCodeForTokenServerURL.split("?")[1]
	);
	return `${url}?${objectToQuery({
		...anySearchParameters,
		client_id: clientId,
		grant_type: "authorization_code",
		code,
		redirect_uri: redirectUri,
		state,
	})}`;
};

const useOmieOAuth2 = (props) => {
	const {
		clientId,
		redirectUri,
		scope = "",
		responseType,
		extraQueryParameters = {},
		onSuccess,
		onError,
	} = props;

	const extraQueryParametersRef = useRef(extraQueryParameters);
	const popupRef = useRef();
	const intervalRef = useRef();
	const [{ loading, error }, setUI] = useState({
		loading: false,
		error: null,
	});
	const [data, setData, { removeItem, isPersistent }] = useLocalStorageState(
		`${responseType}-${OMIE_AUTH_URL}-${clientId}-${scope}`,
		{
			defaultValue: null,
		}
	);

	const exchangeCodeForTokenServerURL =
		responseType === "code" && props.exchangeCodeForTokenServerURL;
	const exchangeCodeForTokenMethod =
		responseType === "code" && props.exchangeCodeForTokenMethod;
	const exchangeCodeForTokenHeaders =
		responseType === "code" && props.exchangeCodeForTokenHeaders;

	const getAuth = useCallback(() => {
		// 1. Init
		setUI({
			loading: true,
			error: null,
		});

		// 2. Generate and save state
		const state = generateState();
		saveState(state);

		// 3. Open popup
		popupRef.current = openPopup(
			formatAuthorizeUrl(
				clientId,
				redirectUri,
				scope,
				state,
				responseType,
				extraQueryParametersRef.current
			)
		);

		// 4. Register message listener
		async function handleMessageListener(message) {
			console.info("handleMessageListener", message);

			const type = message?.data?.type;
			if (type !== OAUTH_RESPONSE) {
				return;
			}
			try {
				if ("error" in message.data) {
					const errorMessage = message.data?.error || "Unknown Error occured.";
					setUI({
						loading: false,
						error: errorMessage,
					});
					if (onError) await onError(errorMessage);
				} else {
					let payload = message?.data?.payload;
					if (responseType === "code" && exchangeCodeForTokenServerURL) {
						const response = await fetch(
							formatExchangeCodeForTokenServerURL(
								exchangeCodeForTokenServerURL,
								clientId,
								payload?.code,
								redirectUri,
								state
							),
							{
								method:
									exchangeCodeForTokenMethod ||
									DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
								headers: exchangeCodeForTokenHeaders || {},
							}
						);
						payload = await response.json();
					}
					setUI({
						loading: false,
						error: null,
					});
					setData(payload);
					if (onSuccess) {
						await onSuccess(payload);
					}
				}
			} catch (genericError) {
				console.error(genericError);
				setUI({
					loading: false,
					error: genericError.toString(),
				});
			} finally {
				// Clear stuff ...
				cleanup(intervalRef, popupRef, handleMessageListener);
			}
		}
		window.addEventListener("message", handleMessageListener);

		// 4. Begin interval to check if popup was closed forcefully by the user
		intervalRef.current = setInterval(() => {
			const popupClosed =
				!popupRef.current?.window || popupRef.current?.window?.closed;
			if (popupClosed) {
				// Popup was closed before completing auth...
				setUI((ui) => ({
					...ui,
					loading: false,
				}));
				console.warn(
					"Warning: Popup was closed before completing authentication."
				);
				cleanup(intervalRef, popupRef, handleMessageListener);
			}
		}, 250);

		// 5. Remove listener(s) on unmount
		return () => {
			window.removeEventListener("message", handleMessageListener);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [
		clientId,
		redirectUri,
		scope,
		responseType,
		exchangeCodeForTokenServerURL,
		exchangeCodeForTokenMethod,
		exchangeCodeForTokenHeaders,
		onSuccess,
		onError,
		setUI,
		setData,
	]);

	const logout = useCallback(() => {
		removeItem();
		setUI({ loading: false, error: null });
	}, [removeItem]);

	return { data, loading, error, getAuth, logout, isPersistent };
};

export default useOmieOAuth2;

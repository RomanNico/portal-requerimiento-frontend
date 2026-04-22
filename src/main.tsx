import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/msalConfig";

import "./styles/styles.css";

// Inicializar instancia MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Establecer cuenta activa si ya hay una sesión
msalInstance.initialize().then(async () => {
    const isPopup = Boolean(window.opener && window.opener !== window);
    if (!isPopup) {
        try {
            const redirectResult = await msalInstance.handleRedirectPromise();
            if (redirectResult?.account) {
                msalInstance.setActiveAccount(redirectResult.account);
            }
        } catch (err) {
            console.error("[MSAL] handleRedirectPromise error:", err);
        }
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
    }

    // Actualizar cuenta activa en cada login exitoso
    msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as any;
            if (payload.account) {
                msalInstance.setActiveAccount(payload.account);
            }
        }
    });

    ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>
    );
});

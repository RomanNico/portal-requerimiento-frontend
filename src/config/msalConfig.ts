import { LogLevel } from "@azure/msal-browser";
import type { Configuration } from "@azure/msal-browser";

/**
 * Configuración de MSAL para Azure AD SSO
 *
 * Para obtener estos valores:
 * 1. Ve al Azure Portal → Azure Active Directory → Registros de aplicaciones
 * 2. Crea (o usa) la app registrada para este portal
 * 3. Copia el "Id. de cliente (aplicación)" → VITE_AZURE_CLIENT_ID
 * 4. Copia el "Id. de directorio (inquilino)" → VITE_AZURE_TENANT_ID
 * 5. En "Autenticación" agrega el URI de redirección: http://localhost:5173
 * 6. Habilita "Tokens de id." y "Tokens de acceso"
 *
 * Crea un archivo .env en /frontend con:
 *   VITE_AZURE_CLIENT_ID=tu-client-id
 *   VITE_AZURE_TENANT_ID=tu-tenant-id
 */
export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`,
        // redirectUri principal para la app (usado en flujos de redirect, no popup)
        redirectUri: `${window.location.origin}/`,
        postLogoutRedirectUri: `${window.location.origin}/`
    },
    cache: {
        cacheLocation: "localStorage"
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                if (level === LogLevel.Error) console.error("[MSAL]", message);
            },
            logLevel: LogLevel.Error
        }
    }
};

export const loginRequest = {
    // Para autenticación del portal (ID token)
    scopes: ["openid", "profile", "email"]
};

export const graphRequest = {
    // Para Microsoft Graph (foto, jobTitle, department, etc.)
    scopes: ["User.Read"]
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import { login, ssoLogin } from "../services/api";
import { guardarPerfilSSO } from "../services/auth";
import { graphRequest, loginRequest } from "../config/msalConfig";

import logo from "../assets/img/logo sin fondo.png";

export default function Login() {

    const navigate = useNavigate();
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");

    // ─── EFFECTS ────────────────────────────────────────────────────────

    // 1. Si ya tiene sesión local persistida, ir directamente al inicio
    useEffect(() => {
        if (localStorage.getItem("usuario") && !cargando) {
            navigate("/inicio");
        }
    }, []);

    // 2. Si MSAL detecta sesión activa (ej: al volver del redirect), completar el login
    useEffect(() => {
        const isPopupWindow = Boolean(window.opener && window.opener !== window);
        if (isPopupWindow) return; 

        // Solo procedemos si no hay interacción en curso y estamos autenticados
        if (isAuthenticated && inProgress === InteractionStatus.None && !cargando) {
            completarLoginSSO(true); 
        }
    }, [isAuthenticated, inProgress]);

    async function obtenerPerfilGraph() {
        const account = instance.getActiveAccount() || instance.getAllAccounts()[0];
        if (!account) return null;

        const tokenResp = await instance.acquireTokenSilent({
            ...graphRequest,
            account
        });

        const resp = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName,jobTitle,department,id", {
            headers: { Authorization: `Bearer ${tokenResp.accessToken}` }
        });

        if (!resp.ok) return null;
        return resp.json();
    }

    async function completarLoginSSO(isAutoLogin: boolean = false) {
        setCargando(true);
        setError("");

        try {
            // Usar la cuenta activa (la que el usuario seleccionó en el popup)
            const activeAccount = instance.getActiveAccount();
            const accounts = instance.getAllAccounts();
            const accountToUse = activeAccount || accounts[0];

            if (!accountToUse) {
                setCargando(false);
                return;
            }

            const tokenResponse = await instance.acquireTokenSilent({
                ...loginRequest,
                account: accountToUse
            });

            const idToken = (tokenResponse as any).idToken;
            if (!idToken) {
                throw new Error("No se recibio idToken desde MSAL");
            }

            console.log("[SSO] Validando usuario en backend...");
            const data = await ssoLogin(idToken);

            if (data.success) {
                console.log("[SSO] Login Exitoso. Rol:", data.rol);
                let graph: any = null;
                try {
                    graph = await obtenerPerfilGraph();
                } catch (e) {
                    console.warn("[SSO] Error al obtener datos extra de Graph:", e);
                }
                guardarPerfilSSO({
                    usuario: data.usuario,
                    correo: graph?.mail || graph?.userPrincipalName || data.correo,
                    nombre: graph?.displayName || data.nombre,
                    rol: data.rol,
                    cargo: graph?.jobTitle || data.cargo,
                    area: graph?.department || data.area,
                    centro_costo: data.centro_costo,
                    oid: data.oid
                });
                localStorage.setItem("rol", data.rol);
                navigate("/inicio");
            } else {
                console.error("[SSO] El backend rechazo el acceso:", data.message);
                setError(data.message || "No autorizado. Contacta con el administrador.");
                setCargando(false);
            }

        } catch (err: any) {
            console.error("[SSO] Error critico en completarLoginSSO:", err);
            if (!isAutoLogin) {
                setError("Ocurrio un problema al conectar con el servidor.");
            }
            setCargando(false);
        }
    }

    async function handleLoginSSO() {
        setError("");
        setCargando(true);

        try {
            // Usamos loginRedirect en lugar de popup porque no podemos registrar URLs adicionales en Azure
            await instance.loginRedirect({
                scopes: [...loginRequest.scopes, ...graphRequest.scopes]
            });
            // El usuario será redirigido a Microsoft. Al volver, main.tsx procesa el token 
            // y el useEffect de arriba llama automáticamente a completarLoginSSO()
        } catch (err: any) {
            console.error("SSO loginRedirect error:", err);
            setError("No se pudo iniciar sesión con Microsoft.");
            setCargando(false);
        }
    }

    async function handleLoginLocal(e: any) {
        e?.preventDefault?.();
        setError("");
        setCargando(true);

        try {
            const data = await login(usuario.trim(), password);

            if (data?.success) {
                // Limpiar datos SSO previos si existieran (sin redireccionar)
                localStorage.removeItem("sso_nombre");
                localStorage.removeItem("sso_correo");
                localStorage.removeItem("sso_cargo");
                localStorage.removeItem("sso_area");
                localStorage.removeItem("sso_centro_costo");
                localStorage.removeItem("sso_oid");

                localStorage.setItem("usuario", data.usuario);
                localStorage.setItem("rol", data.rol);
                navigate("/inicio");
                return;
            }

            setError("Usuario o contraseña inválidos.");
            setCargando(false);
        } catch (err) {
            console.error("Error login local:", err);
            setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
            setCargando(false);
        }
    }

    return (

        <div className="login-page">

            <div className="login-wrapper">

                <div className="login-card">

                    <h2>Iniciar Sesión</h2>

                    <p className="subtitle">
                        Plataforma de Gestión de Registro de Requerimientos
                    </p>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLoginLocal}>
                        <input
                            type="text"
                            placeholder="Usuario o correo"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            autoComplete="username"
                        />

                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <button
                            type="submit"
                            disabled={cargando || !usuario.trim() || !password}
                        >
                            Ingresar
                        </button>
                    </form>

                    <div className="login-separator">
                        <span>{"\u00F3"}</span>
                    </div>

                    <button
                        className="btn-sso"
                        onClick={handleLoginSSO}
                        disabled={cargando || inProgress !== InteractionStatus.None}
                    >
                        {cargando ? (
                            <span className="sso-loading">
                                <span className="spinner" />
                                Iniciando sesión...
                            </span>
                        ) : (
                            <span className="sso-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="20" height="20">
                                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                                </svg>
                                Ingresar con Microsoft
                            </span>
                        )}
                    </button>

                    <p className="login-info">
                        Usa tu cuenta corporativa de Comware
                    </p>

                </div>

                <div className="login-logo">

                    <div className="logo-placeholder">
                        <img src={logo} alt="Logo" />
                    </div>

                </div>

            </div>

        </div>

    );

}

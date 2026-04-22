import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { guardarPerfilSSO, obtenerPerfilSSO } from "../services/auth";
import type { PerfilSSO } from "../services/auth";
import { getPerfil } from "../services/api";
import Navbar from "../components/Navbar";

/**
 * Página de perfil de usuario.
 *
 * Muestra información completa del usuario autenticado:
 * - Datos básicos (nombre, correo, usuario, rol)
 * - Información de Azure AD (cargo, área) si es SSO
 * - Datos locales (centro de costo) si eslogin tradicional
 *
 * Flujo de carga:
 * 1. Intenta cargar perfil desde localStorage (obtenerPerfilSSO)
 * 2. Si es usuario SSO, refresca datos desde Microsoft Graph
 * 3. Si es usuario local, consulta perfil desde API local (/perfil/:usuario)
 *
 * @component
 */
export default function Perfil() {

    const { instance } = useMsal();
    /**
     * Perfil completo del usuario (puede venir de SSO o local).
     */
    const [perfil, setPerfil] = useState<PerfilSSO | null>(null);
    /**
     * Indica si el usuario autenticó vía SSO (tiene OID o correo SSO guardado).
     */
    const esSSO = Boolean(localStorage.getItem("sso_oid") || localStorage.getItem("sso_correo"));

    /**
     * Carga inicial del perfil al montar el componente.
     * - Intenta recuperar perfil de localStorage
     * - Si es SSO, refresca datos desde Graph API (si hay tokens válidos)
     * - Si es local, consulta API local para datos completos
     */
    useEffect(() => {

        // Cargar perfil desde localStorage (guardado durante SSO login)
        const p = obtenerPerfilSSO();
        if (p) setPerfil(p);

        if (p && esSSO) {
            // Refrescar datos del perfil desde Microsoft Graph (si es posible)
            cargarDatosMicrosoft(p);
        }

        if (p && !esSSO) {
            cargarPerfilLocal(p.usuario);
        }

    }, []);

    /**
     * Carga datos del perfil desde la API local (para usuarios no-SSO).
     * Consulta endpoint /perfil/:usuario y actualiza estado + localStorage.
     * @param {string} usuario - Nombre de usuario a buscar
     */
    async function cargarPerfilLocal(usuario: string) {
        try {
            const resp = await getPerfil(usuario);
            if (!resp?.success) return;

            const u = resp.usuario;
            const actualizado: PerfilSSO = {
                usuario: u.nombre_usuario || usuario,
                correo: u.correo || "",
                nombre: u.nombre_usuario || usuario,
                rol: u.rol || localStorage.getItem("rol") || "user",
                cargo: "",
                area: "",
                centro_costo: u.centro_costo || "",
                oid: ""
            };

            setPerfil(actualizado);
            guardarPerfilSSO(actualizado);
        } catch {
            // Ignorar
        }
    }

    /**
     * Refresca datos del perfil desde Microsoft Graph API.
     * Obtiene token silencioso y consulta /me para displayName, mail, jobTitle, department.
     * @param {PerfilSSO} perfilBase - Perfil actual para fallback en valores no encontrados
     */
    async function cargarDatosMicrosoft(perfilBase: PerfilSSO) {
        try {
            const accounts = instance.getAllAccounts();
            if (accounts.length === 0) return;

            const tokenResp = await instance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: accounts[0]
            });

            const resp = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName,jobTitle,department,id", {
                headers: { Authorization: `Bearer ${tokenResp.accessToken}` }
            });

            if (!resp.ok) return;
            const me: any = await resp.json();

            const actualizado: PerfilSSO = {
                ...perfilBase,
                nombre: me?.displayName || perfilBase.nombre,
                correo: me?.mail || me?.userPrincipalName || perfilBase.correo,
                cargo: me?.jobTitle || perfilBase.cargo,
                area: me?.department || perfilBase.area
            };

            setPerfil(actualizado);
            guardarPerfilSSO(actualizado);
        } catch {
            // Ignorar (sin permisos/consentimiento, token expirado, etc.)
        }
    }


    /**
     * Nombre a mostrar en el encabezado (prioriza nombre real, luego usuario).
     */
    const nombreMostrado = perfil?.nombre || perfil?.usuario || "Usuario";
    /**
     * Iniciales del usuario para avatar (ej: "Juan Pérez" → "JP").
     */
    const iniciales = nombreMostrado.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    return (

        <div>

            <Navbar />

            <main className="main-content perfil-page" style={{ marginTop: '30px' }}>

                <section style={{ maxWidth: '950px', margin: '0 auto', borderRadius: '16px', backgroundColor: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                    {/* Gradient Banner Top - Height increased for Name */}
                    <div style={{
                        height: '120px',
                        background: 'linear-gradient(135deg, #0d3b66 0%, #00a4ef 100%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '0 40px 15px 190px' // Padding left to clear the avatar
                    }}>
                        <h2 style={{ margin: 0, fontSize: '32px', color: '#fff', fontWeight: '700', letterSpacing: '-0.5px' }}>
                            {nombreMostrado}
                        </h2>
                    </div>

                    <div style={{ padding: '0 40px 40px' }}>

                        {/* Avatar and Info - Adjusted for inner name logic */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '-65px', paddingBottom: '30px', borderBottom: '1px solid #eef2f6' }}>

                            {/* Avatar Circle */}
                            <div style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#0077b6', background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)', border: '6px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '800', boxShadow: '0 8px 24px rgba(0, 119, 182, 0.25)', flexShrink: 0 }}>
                                {iniciales || "U"}
                            </div>

                            {/* Tags Area Below the Name */}
                            <div style={{ flex: 1, paddingTop: '75px' }}>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ backgroundColor: '#0d3b66', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', boxShadow: '0 2px 8px rgba(13, 59, 102, 0.2)' }}>
                                        {perfil?.rol || "user"}
                                    </span>

                                    {perfil?.cargo && (
                                        <span style={{ backgroundColor: '#f0f4f8', color: '#334155', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                                            {perfil.cargo}
                                        </span>
                                    )}

                                    {perfil?.centro_costo && (
                                        <span style={{ backgroundColor: '#eef2fb', color: '#005eb8', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {perfil.centro_costo}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Info Grid - 2 or 3 Columns Horizontal */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '35px' }}>

                            <div style={{ padding: '20px', backgroundColor: '#fcfcfd', borderRadius: '12px', border: '1px solid #ebeef5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Correo Corporativo</label>
                                </div>
                                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600', marginLeft: '44px', wordBreak: 'break-word' }}>{perfil?.correo || "-"}</div>
                            </div>

                            {(perfil?.usuario && perfil.usuario !== perfil.correo) && (
                                <div style={{ padding: '20px', backgroundColor: '#fcfcfd', borderRadius: '12px', border: '1px solid #ebeef5' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </div>
                                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Usuario</label>
                                    </div>
                                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600', marginLeft: '44px' }}>{perfil.usuario}</div>
                                </div>
                            )}

                            <div style={{ padding: '20px', backgroundColor: '#fcfcfd', borderRadius: '12px', border: '1px solid #ebeef5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Autenticación</label>
                                </div>
                                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600', marginLeft: '44px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {esSSO && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="16" height="16">
                                            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                                            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                                            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                                            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                                        </svg>
                                    )}
                                    {esSSO ? "Microsoft SSO" : "Autorización Local"}
                                </div>
                            </div>

                        </div>


                    </div>
                </section>

            </main>

        </div>

    );

}

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

import logo from "../assets/img/logo blanco.png";
import avatar from "../assets/img/avatar.png";
import logoutIcon from "../assets/img/log-out.png";

export default function Navbar() {

    const { instance } = useMsal();
    const rol = localStorage.getItem("rol");
    const esSSO = Boolean(localStorage.getItem("sso_oid") || localStorage.getItem("sso_correo"));
    const nombreSSO = localStorage.getItem("sso_nombre") || localStorage.getItem("usuario") || "";
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    function cerrarMenu() {
        setMenuOpen(false);
    }

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    // Inicializar tema
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    async function handleLogout() {
        // Limpiamos los datos locales directamente antes de salir
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");
        localStorage.removeItem("sso_nombre");
        localStorage.removeItem("sso_correo");
        localStorage.removeItem("sso_cargo");
        localStorage.removeItem("sso_area");
        localStorage.removeItem("sso_centro_costo");
        localStorage.removeItem("sso_oid");

        const accounts = instance.getAllAccounts();
        if (esSSO && accounts.length > 0) {
            // Solo redirigimos a Microsoft si realmente hay una sesión de Microsoft activa
            instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
        } else {
            // Para usuarios locales o si no hay cuenta de MSAL, volvemos al login directamente
            window.location.href = "/";
        }
    }

    // Obtener iniciales del nombre para mostrar en avatar
    const iniciales = nombreSSO
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (

        <header className="main-header">

            <div className="header-container">

                <nav className="nav-menu">

                    <Link to="/inicio" className="logo">
                        <img src={logo} alt="Logo" />
                    </Link>

                    <button
                        className={`menu-toggle ${menuOpen ? "open" : ""}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className={`nav-links ${menuOpen ? "active" : ""}`}>

                        <Link to="/inicio" onClick={cerrarMenu}>
                            Inicio
                        </Link>

                        <Link to="/mis-requerimientos" onClick={cerrarMenu}>
                            Mis Requerimientos
                        </Link>

                        {rol !== "user" && (
                            <Link to="/validacion" onClick={cerrarMenu}>
                                Validación
                            </Link>
                        )}

                        <Link className="mobile-only" to="/perfil" onClick={cerrarMenu}>
                            Perfil
                        </Link>

                    </div>

                    <div className="nav-actions">

                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title="Cambiar Tema"
                        >
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>

                        <Link to="/perfil" className="perfil-btn" title={nombreSSO}>
                            {iniciales ? (
                                <div className="nav-avatar-iniciales">
                                    {iniciales}
                                </div>
                            ) : (
                                <img src={avatar} alt="Perfil" />
                            )}
                        </Link>

                        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
                            <img src={logoutIcon} alt="Logout" />
                        </button>

                    </div>

                </nav>

            </div>

        </header>

    );
}

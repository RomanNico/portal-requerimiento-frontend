import { Link } from "react-router-dom";
import { logout } from "../services/auth";
import { useState } from "react";

import logo from "../assets/img/logo blanco.png";
import avatar from "../assets/img/avatar.png";
import logoutIcon from "../assets/img/log-out.png";

export default function Navbar() {

    const rol = localStorage.getItem("rol");
    const [menuOpen, setMenuOpen] = useState(false);

    function cerrarMenu() {
        setMenuOpen(false);
    }

    return (

        <header className="main-header">

            <div className="header-container">

                <nav className="nav-menu">

                    <Link to="/inicio" className="logo">
                        <img src={logo} />
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

                        <button
                            className="mobile-only logout-text"
                            onClick={logout}
                        >
                            CERRAR SESIÓN
                        </button>

                    </div>

                    <div className="nav-actions">

                        <Link to="/perfil" className="perfil-btn">
                            <img src={avatar} />
                        </Link>

                        <button className="logout-btn" onClick={logout}>
                            <img src={logoutIcon} />
                        </button>

                    </div>

                </nav>

            </div>

        </header>

    );
}
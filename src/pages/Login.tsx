import { login } from "../services/api";
import { guardarUsuario } from "../services/auth";
import { useNavigate } from "react-router-dom";

import logo from "../assets/img/logo sin fondo.png";

export default function Login() {
    

    const navigate = useNavigate();

    async function handleLogin() {

        const usuario = (document.getElementById("usuario") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        const data = await login(usuario, password);

        if (data.success) {

            guardarUsuario(data.usuario);
            localStorage.setItem("rol", data.rol);

            navigate("/inicio");

        } else {

            alert("Credenciales incorrectas");

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

                    <input id="usuario" placeholder="Usuario" />

                    <input
                        type="password"
                        id="password"
                        placeholder="Contraseña"
                    />

                    <button onClick={handleLogin}>
                        Ingresar
                    </button>

                </div>

                <div className="login-logo">

                    <div className="logo-placeholder">
                        <img src={logo} />
                    </div>

                </div>

            </div>

        </div>

    );

}
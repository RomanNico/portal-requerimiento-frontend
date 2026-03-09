import { useEffect, useState } from "react";
import avatar from "../assets/img/avatar.png";

import { logout, obtenerUsuario } from "../services/auth";
import { getPerfil, cambiarPassword } from "../services/api";
import Navbar from "../components/Navbar";

type Perfil = {
    nombre: string;
    correo: string;
    usuario: string;
    centroCosto: string;
};

export default function Perfil() {

    const [perfil, setPerfil] = useState<Perfil | null>(null);

    useEffect(() => {

        const usuario = obtenerUsuario();

        if (!usuario) return;

        getPerfil(usuario).then((res) => {

            if (!res.success) return;

            const u = res.usuario;

            setPerfil({
                nombre: u.nombre_usuario,
                correo: u.correo,
                usuario: u.nombre_usuario,
                centroCosto: u.centro_costo
            });

        });

    }, []);


    async function actualizarPassword() {

        const usuario = obtenerUsuario();

        const passActual = (document.getElementById("passActual") as HTMLInputElement).value;
        const passNueva = (document.getElementById("passNueva") as HTMLInputElement).value;
        const passConfirmar = (document.getElementById("passConfirmar") as HTMLInputElement).value;

        if (passNueva !== passConfirmar) {
            alert("Las contraseñas no coinciden");
            return;
        }

        const res = await cambiarPassword(usuario!, passActual, passNueva);

        if (res.success) {

            alert("Contraseña actualizada. Debes iniciar sesión nuevamente.");

            logout();
            window.location.href = "/";

        } else {
            alert(res.message || "Error al actualizar contraseña");
        }

    }


    return (

        <div>

            <Navbar />


            <main className="main-content perfil-page">

                <section className="perfil-card">

                    <div className="perfil-header">

                        <img
                            id="perfilIcono"
                            src={avatar}
                            alt="Avatar"
                        />

                        <h2 id="perfilNombre">
                            {perfil?.nombre || "Cargando..."}
                        </h2>

                        <span
                            className="perfil-rol"
                            id="perfilCentroCosto"
                        >
                            {perfil?.centroCosto || "Centro de costo"}
                        </span>

                    </div>


                    <div className="perfil-body">

                        <div className="perfil-item">

                            <label>Correo</label>

                            <span id="perfilCorreo">
                                {perfil?.correo || "-"}
                            </span>

                        </div>


                        <div className="perfil-item">

                            <label>Usuario</label>

                            <span id="perfilUsuario">
                                {perfil?.usuario || "-"}
                            </span>

                        </div>

                    </div>


                    <hr />


                    <div className="perfil-password">

                        <h3>
                            Cambiar contraseña
                        </h3>

                        <input
                            type="password"
                            id="passActual"
                            placeholder="Contraseña actual"
                        />

                        <input
                            type="password"
                            id="passNueva"
                            placeholder="Nueva contraseña"
                        />

                        <input
                            type="password"
                            id="passConfirmar"
                            placeholder="Confirmar contraseña"
                        />

                        <button
                            className="btn-primary"
                            onClick={actualizarPassword}
                        >
                            Actualizar contraseña
                        </button>

                    </div>

                </section>

            </main>

        </div>

    );

}
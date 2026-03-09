import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import volverIcon from "../assets/img/anterior.png";

import { getRequerimiento, actualizarRequerimiento } from "../services/api";
import Navbar from "../components/Navbar";

export default function Editar() {

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {

        if (!id) return;

        getRequerimiento(id).then(res => {

            if (res.success) {

                const editor = document.getElementById("editorContenido");

                if (editor) {
                    editor.innerHTML = res.data.contenido || "";
                }

            }

        });

    }, [id]);


    async function guardarEdicion() {

        if (!id) return;

        const contenido = (document.getElementById("editorContenido") as HTMLDivElement).innerHTML;

        const res = await actualizarRequerimiento(id, {
            contenido
        });

        if (res.success) {

            alert(`Cambios del ${id} guardados correctamente`);

            navigate(`/resultado/${id}`);

        } else {

            alert("No se pudo guardar la edición");

        }

    }


    function irAtras() {
        navigate(-1);
    }


    return (

        <div>

            <Navbar />

            <main className="main-content">

                <section className="result-card">

                    <h3>
                        Modificar Contenido Técnico
                    </h3>

                    <div
                        id="editorContenido"
                        contentEditable
                        className="document-preview editor-estilo-fijo"
                    >
                        ⏳ Cargando contenido...
                    </div>

                    <div className="actions-buttons">

                        <button
                            className="btn-icon-volver"
                            onClick={irAtras}
                            title="Volver"
                        >
                            <img
                                src={volverIcon}
                                alt="Regresar"
                                className="img-volver"
                            />
                        </button>

                        <div className="buttons-right">

                            <button
                                className="btn-primary"
                                onClick={guardarEdicion}
                            >
                                💾 Guardar Cambios
                            </button>

                            <button
                                className="btn-danger"
                                onClick={irAtras}
                            >
                                ❌ Cancelar
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

}
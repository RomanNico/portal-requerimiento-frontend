import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import volverIcon from "../assets/img/anterior.png";
import Navbar from "../components/Navbar";
import {
    getRequerimiento,
    guardarValidacion,
    enviarAJira,
    actualizarRequerimiento
} from "../services/api";

type Req = {
    id: string
    titulo: string
    contenido: string
    estado: string
    autor: string
    timestamp_ms: number
    centro_costo?: string
    adjuntos?: any[]
    check_po?: boolean
    check_qa?: boolean
    comentario?: string
}

export default function ValidacionRequerimiento() {

    const rol = localStorage.getItem("rol");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    const [requerimiento, setRequerimiento] = useState<Req | null>(null);
    const [loading, setLoading] = useState(true);

    const [po, setPo] = useState(false);
    const [qa, setQa] = useState(false);

    useEffect(() => {

        if (!id) return;

        getRequerimiento(id)
            .then(res => {

                if (res.success) {

                    setRequerimiento(res.data);

                    setPo(res.data.check_po || false);
                    setQa(res.data.check_qa || false);

                }

            })
            .finally(() => setLoading(false));

    }, []);


    async function actualizarValidacion(nuevoPO: boolean, nuevoQA: boolean) {

        if (!id || !requerimiento) return;

        const confirmar = window.confirm(
            `¿Estás seguro de aprobar el requerimiento ${requerimiento.id}?`
        );

        if (!confirmar) return;

        setPo(nuevoPO);
        setQa(nuevoQA);

        await guardarValidacion(id, nuevoPO, nuevoQA);

    }


    function irValidacion() {
        navigate("/validacion");
    }

    function verPDF() {

        if (!id) return;

        navigate(`/resultado/${id}`);

    }

    function editarPDF() {

        if (!id) return;

        navigate(`/editar/${id}`);

    }

    async function rechazarRequerimiento() {

        if (!requerimiento) return;

        const motivo = (document.getElementById("motivoRechazo") as HTMLTextAreaElement).value;

        if (!motivo) {
            alert("Debes indicar el motivo de rechazo");
            return;
        }

        if (!confirm(`¿Rechazar el requerimiento ${requerimiento.id}?`)) return;

        try {

            await actualizarRequerimiento(
                requerimiento.id,
                {
                    estado: "Rechazado",
                    comentario: motivo
                }
            );

            alert("❌ Requerimiento ${requerimiento.id} rechazado");

            navigate("/validacion");

        } catch (error) {

            console.error(error);

            alert("Error rechazando requerimiento");

        }

    }

    async function aprobarYEnviar() {

        if (!requerimiento) return;

        if (!po) {
            alert("⚠️ Falta validación Product Owner");
            return;
        }

        if (!qa) {
            alert("⚠️ Falta validación QA");
            return;
        }

        if (!confirm(`¿Enviar requerimiento ${requerimiento.id} a JIRA?`)) return;

        try {

            const fechaISO = new Date(
                Number(requerimiento.timestamp_ms)
            ).toISOString();

            const response = await enviarAJira({

                tipoCaso: {
                    Subject: requerimiento.titulo,
                    IdByProject: requerimiento.id
                },

                textoFinal: requerimiento.contenido,

                fechaRegistro: fechaISO,

                customfield_10120: requerimiento.centro_costo,

                adjuntos: requerimiento.adjuntos || []

            });

            if (!response.success) {

                console.error(response);

                alert("❌ Error enviando a JIRA");

                return;

            }

            await actualizarRequerimiento(
                requerimiento.id,
                {
                    estado: "Enviado",
                    enviado_jira: true,
                    fecha_envio_jira: new Date().toLocaleString()
                }
            );
            alert(`✅ Requerimiento ${requerimiento.id} enviado a Jira!\n🎫 Ticket en Jira: ${response.issueKey}`);

            navigate("/validacion");

        } catch (error) {

            console.error(error);

            alert("❌ Error enviando a JIRA");

        }

    }

    return (

        <div>

            <Navbar />


            <main className="main-content">

                <section className="page-header">

                    <h1>Validación del Requerimiento</h1>

                    <p>
                        Revisión técnica y funcional por parte de Product Owner y QA.
                    </p>

                </section>


                <section className="result-card">

                    {loading && (
                        <div className="loading-req">
                            ⏳ Cargando requerimiento...
                        </div>
                    )}

                    {!loading && requerimiento && (

                        <>

                            <div className="card-top-bar">

                                <div className={`status-badge ${requerimiento.estado.toLowerCase().replace(/\s/g, "")}`}>

                                    {requerimiento.estado}

                                </div>

                                <button
                                    className="btn-icon-volver top-volver"
                                    onClick={irValidacion}
                                    title="Volver"
                                >
                                    <img src={volverIcon} className="img-volver" />
                                </button>

                            </div>


                            <div className="document-preview">

                                <h2>{requerimiento.titulo}</h2>

                                <p style={{ marginTop: "10px" }}>
                                    <b>Autor:</b> {requerimiento.autor}
                                </p>

                                <p>
                                    <b>Fecha:</b> {new Date(Number(requerimiento.timestamp_ms)).toLocaleString("es-CO")}
                                </p>

                                {requerimiento.estado === "Rechazado" && requerimiento.comentario && (

                                    <div className="reject-banner">
                                        ❌ <b>Rechazado:</b> {requerimiento.comentario}
                                    </div>

                                )}

                                <hr style={{ margin: "20px 0" }} />

                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: requerimiento.contenido
                                    }}
                                />

                            </div>


                            <div className="validation-panel">

                                <h3>Controles de Validación</h3>

                                <div className="check-group">


                                    {rol === "po" && (
                                        <label className="check-card">

                                            <input
                                                type="checkbox"
                                                checked={po}
                                                onChange={(e) =>
                                                    actualizarValidacion(e.target.checked, qa)
                                                }
                                            />

                                            <div className="card-content">
                                                <span className="check-icon">👤</span>
                                                <span className="check-text">Product Owner</span>
                                            </div>

                                        </label>
                                    )}

                                    {rol === "qa" && (
                                        <label className="check-card">

                                            <input
                                                type="checkbox"
                                                checked={qa}
                                                onChange={(e) =>
                                                    actualizarValidacion(po, e.target.checked)
                                                }
                                            />

                                            <div className="card-content">
                                                <span className="check-icon">🛡️</span>
                                                <span className="check-text">QA Técnica</span>
                                            </div>

                                        </label>
                                    )}

                                </div>


                                <div className="reject-reason-container">

                                    <label
                                        htmlFor="motivoRechazo"
                                        className="textarea-label"
                                    >
                                        Motivo de rechazo u observaciones técnicas:
                                    </label>

                                    <textarea
                                        id="motivoRechazo"
                                        placeholder="Explica los cambios necesarios..."
                                    />

                                </div>

                            </div>


                            <div className="actions-buttons">

                                <div className="buttons-right">

                                    <button
                                        className="btn-primary"
                                        onClick={verPDF}
                                    >
                                        👁️ Ver
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        onClick={editarPDF}
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button
                                        className="btn-danger"
                                        onClick={rechazarRequerimiento}
                                    >
                                        ❌ Rechazar
                                    </button>

                                    <button
                                        className="btn-primary"
                                        onClick={aprobarYEnviar}
                                    >
                                        🚀 Aprobar y Enviar
                                    </button>

                                </div>

                            </div>

                        </>

                    )}

                </section>

            </main>

        </div>

    );

}
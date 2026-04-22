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

/**
 * Estructura de un requerimiento para validación.
 */
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

/**
 * Página de validación de requerimientos (Product Owner y QA).
 *
 * Permite:
 * - Revisar el contenido completo del requerimiento
 * - Aprobación por PO (Product Owner) y QA (Quality Assurance)
 * - Rechazar con motivo de rechazo
 * - Enviar a Jira (solo cuando ambas validaciones están aprobadas)
 *
 * Flujo de estados:
 * - Pendiente → En validación (cuando al menos una validación se marca)
 * - En validación → Listo para enviar (cuando ambas validaciones están aprobadas)
 * - En validación → Rechazado (cuando se rechaza)
 * - Listo para enviar → Enviado (cuando se envía a Jira)
 *
 * @component
 */
export default function ValidacionRequerimiento() {

    /**
     * Rol del usuario actual (po, qa, admin, user) desde localStorage.
     * Determina qué controles de validación se muestran.
     */
    const rol = localStorage.getItem("rol");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /**
     * ID del requerimiento a validar (obtenido de query params).
     */
    const id = searchParams.get("id");

    /**
     * Datos del requerimiento cargado desde la API.
     */
    const [requerimiento, setRequerimiento] = useState<Req | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Checkbox de validación Product Owner.
     */
    const [po, setPo] = useState(false);
    /**
     * Checkbox de validación QA Técnica.
     */
    const [qa, setQa] = useState(false);

    /**
     * Carga los datos del requerimiento al montar el componente.
     * Obtiene check_po y check_qa para inicializar los checkboxes.
     */
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

    /**
     * Actualiza el estado de las validaciones PO/QA en el backend.
     * Muestra confirmación antes de guardar.
     * @param {boolean} nuevoPO - Nuevo estado de validación PO
     * @param {boolean} nuevoQA - Nuevo estado de validación QA
     */
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

    /**
     * Navega de vuelta a la página de listado de validaciones.
     */
    function irValidacion() {
        navigate("/validacion");
    }

    /**
     * Navega a la página de visualización/resultado del requerimiento.
     */
    function verPDF() {

        if (!id) return;

        navigate(`/resultado/${id}`);

    }

    /**
     * Navega a la página de edición del requerimiento.
     */
    function editarPDF() {

        if (!id) return;

        navigate(`/editar/${id}`);

    }

    /**
     * Rechaza un requerimiento, actualizando su estado y guardando el motivo.
     * Lee el motivo del textarea con id="motivoRechazo".
     * Actualiza el requerimiento en BD y navega de vuelta a la lista de validación.
     */
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

            alert(`❌ Requerimiento ${requerimiento.id} rechazado`);

            navigate("/validacion");

        } catch (error) {

            console.error(error);

            alert("Error rechazando requerimiento");

        }

    }

    /**
     * Aprueba y envía el requerimiento a Jira.
     * Validaciones:
     * - Debe tener aprobación de PO
     * - Debe tener aprobación de QA
     * - Debe existir centro de costo configurado
     *
     * Proceso:
     * 1. Llama a enviarAJira() para crear ticket en Jira
     * 2. Si es exitoso, actualiza estado a "Enviado" con fecha de envío
     * 3. Muestra ticket creado (issueKey) y navega a validación
     *
     * @throws {Error} Si falta validación o falla la creación en Jira
     */
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

                const mensaje =
                    response?.mensaje ||
                    response?.error ||
                    "Error enviando a JIRA";

                alert(`⚠️ ${mensaje}`);

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

        } catch (error: any) {

            console.error(error);

            const mensaje =
                error?.response?.data?.mensaje ||
                error?.response?.data?.error ||
                "Error enviando a JIRA";

            alert(`❌ ${mensaje}`);

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

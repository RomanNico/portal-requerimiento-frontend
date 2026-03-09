import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import volverIcon from "../assets/img/anterior.png";
import { formatearPlantilla } from "../utils/formatearPlantilla";
import { getRequerimiento } from "../services/api";
import Navbar from "../components/Navbar";

type Adjunto = {
    nombre: string
    tipo: string
    data: string
}

type Req = {
    id: string
    titulo: string
    estado: string
    contenido: string,
    comentario?: string,
    adjuntos: Adjunto[]
}

export default function Resultado() {

    const { id } = useParams()

    const [requerimiento, setRequerimiento] = useState<Req | null>(null)
    const [imagenPreview, setImagenPreview] = useState<string | null>(null)
    const [pdfPreview, setPdfPreview] = useState<string | null>(null)

    useEffect(() => {

        if (!id) return

        getRequerimiento(id).then(res => {

            if (res.success) {
                setRequerimiento(res.data)
            }

        })

    }, [id])

    function limpiarHTML(html: string) {

        return html
            .replace(/Plantilla Final Generada\s*[–-].*?<br>/gi, "")
            .replace(/Título del requerimiento:.*?<br>/gi, "")
            .replace(/Título:.*?<br>/gi, "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<li>/gi, "• ")
            .replace(/<\/li>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim()

    }
    const seccionesPDF = [
        "Tipo de gestión",
        "Tipo de solicitud",
        "Descripción general del requerimiento",
        "Descripción breve de la necesidad",
        "Problema que se busca resolver",
        "Área / proceso impactado",
        "Área o proceso impactado",
        "Usuarios impactados",
        "Objetivo de la solución",
        "Descripción del proceso actual",
        "Descripción del proceso esperado",
        "Descripción del proceso propuesto",
        "Sistemas involucrados",
        "Ambientes y sistemas involucrados",
        "Reglas de asignación requeridas",
        "Implicaciones si no se realiza",
        "Impacto en la empresa",
        "Impacto en la empresa y riesgo operativo",
        "Beneficios esperados",
        "Prioridad asignada",
        "Riesgos",
        "Dependencias",
        "Alcance",
        "Exclusiones",
        "Criterios de aceptación",
        "Autor del requerimiento",
        "Área técnica responsable del desarrollo",
        "Centro de costos",
        "Adjuntos",
        "Observaciones adicionales"
    ]


    // DESCARGAR PDF
    function descargarPDF() {


        const contenido = limpiarHTML(requerimiento?.contenido || "")
        const pdf = new jsPDF("p", "mm", "a4")

        const margin = 20
        const pageWidth = 210
        const pageHeight = 297
        const usableWidth = pageWidth - margin * 2

        let y = 20


        /* TITULO */

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(18)

        const tituloPDF = requerimiento?.titulo || "Requerimiento"

        const tituloLineas = pdf.splitTextToSize(tituloPDF, usableWidth)

        tituloLineas.forEach((linea: string) => {
            pdf.text(linea, pageWidth / 2, y, { align: "center" })
            y += 8
        })

        y += 2

        /* LINEA SEPARADORA */

        pdf.setDrawColor(200)
        pdf.line(margin, y, pageWidth - margin, y)

        y += 10

        /* INFORMACIÓN DEL REQUERIMIENTO */

        pdf.setFontSize(12)
        pdf.setFont("helvetica", "normal")

        pdf.text(`ID: ${requerimiento?.id}`, margin, y)
        y += 7

        pdf.text(`Estado: ${requerimiento?.estado}`, margin, y)
        y += 7

        pdf.text(`Título: ${requerimiento?.titulo}`, margin, y)

        y += 10

        /* CONTENIDO */

        pdf.setFontSize(11)

        const lineas = contenido.split("\n")

        lineas.forEach((linea: string) => {

            if (y > pageHeight - 20) {
                pdf.addPage()
                y = margin
            }

            const texto = linea.trim()

            if (!texto) {
                y += 2
                return
            }

            const esTitulo = seccionesPDF.some(sec =>
                texto.toLowerCase().startsWith(sec.toLowerCase())
            )

            if (esTitulo) {

                pdf.setFont("helvetica", "bold")
                pdf.setFontSize(13)

                pdf.text(texto, margin, y)

                y += 8

                pdf.setFont("helvetica", "normal")
                pdf.setFontSize(11)

            } else {

                const wrapped = pdf.splitTextToSize(texto, usableWidth)

                wrapped.forEach((lineaWrap: string) => {

                    if (y > pageHeight - 20) {
                        pdf.addPage()
                        y = margin
                    }

                    pdf.text(lineaWrap, margin, y)
                    y += 6

                })
            }

        })


        const totalPaginas = pdf.getNumberOfPages()

        for (let i = 1; i <= totalPaginas; i++) {

            pdf.setPage(i)

            pdf.setFontSize(9)
            pdf.setTextColor(120)

            pdf.text(
                `Página ${i} de ${totalPaginas}`,
                pageWidth / 2,
                290,
                { align: "center" }
            )

            pdf.text(
                "Sistema PGRR - Portal de Gestión de Requerimientos",
                margin,
                290
            )

        }

        pdf.save(`${requerimiento?.id}.pdf`)
    }


    function obtenerIcono(tipo: string) {

        if (tipo.includes("pdf")) return "📄"
        if (tipo.includes("image")) return "🖼️"
        if (tipo.includes("video")) return "🎬"
        if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "📊"
        if (tipo.includes("word") || tipo.includes("document")) return "📝"
        if (tipo.includes("powerpoint")) return "📽️"

        return "📎"

    }


    function abrirPDF(tipo: string, base64: string) {

        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)

        const blob = new Blob([byteArray], { type: tipo })

        const url = URL.createObjectURL(blob)

        window.open(url, "_blank")

    }

    return (

        <div>

            <Navbar />


            <main className="main-content">

                <section className="page-header">

                    <h1>Documento Técnico</h1>

                    <p>
                        Revisa el documento generado antes de enviar el requerimiento.
                    </p>

                </section>


                <section className="result-card">

                    <div className="card-top-bar">

                        <div className="timeline-pro">

                            <div className={`timeline-item ${requerimiento?.estado === "Pendiente" ||
                                requerimiento?.estado === "En validación" ||
                                requerimiento?.estado === "Enviado"
                                ? "active"
                                : ""
                                }`}>

                                <div className="timeline-circle">🟡</div>
                                <span>Creado</span>

                            </div>


                            <div className="timeline-line"></div>


                            <div className={`timeline-item ${requerimiento?.estado === "En validación" ||
                                requerimiento?.estado === "Enviado"
                                ? "active"
                                : ""
                                }`}>

                                <div className="timeline-circle">🔵</div>
                                <span>En validación</span>

                            </div>


                            <div className="timeline-line"></div>


                            <div className={`timeline-item ${requerimiento?.estado === "Enviado"
                                ? "active"
                                : ""
                                }`}>

                                <div className="timeline-circle">🚀</div>
                                <span>Enviado</span>

                            </div>

                        </div>

                        <div className={`status-badge ${requerimiento?.estado?.toLowerCase()}`}>
                            {requerimiento?.estado === "Enviado"
                                ? "Enviado a Jira"
                                : requerimiento?.estado}
                        </div>

                        <Link to="/mis-requerimientos">

                            <button className="btn-icon-volver">

                                <img src={volverIcon} className="img-volver" />

                            </button>

                        </Link>

                    </div>


                    {/* DOCUMENTO */}
                    {requerimiento?.estado === "Rechazado" && requerimiento?.comentario && (

                        <div className="reject-banner">
                            ❌ <b>Rechazado:</b> {requerimiento.comentario}
                        </div>

                    )}
                    <div
                        id="documentoPDF"
                        className="doc-pro-view"
                        dangerouslySetInnerHTML={{
                            __html: formatearPlantilla(requerimiento?.contenido || "⏳ Cargando documento")
                        }}
                    />


                    {/* ADJUNTOS */}

                    {(requerimiento?.adjuntos?.length ?? 0) > 0 && (

                        <div className="adjuntos-seccion">

                            <h3>Archivos Adjuntos</h3>

                            <div className="lista-adjuntos-grid">

                                {requerimiento?.adjuntos?.map((a, i) => (

                                    <div key={i} className="archivo-card">

                                        <div className="archivo-info">

                                            <span className="mini-icono">
                                                {obtenerIcono(a.tipo)}
                                            </span>

                                            <span>
                                                {a.nombre}
                                            </span>

                                        </div>


                                        {/* Vista previa */}

                                        {a.tipo.includes("pdf") && (

                                            <div
                                                className="preview-pdf-wrapper"
                                                onClick={() => abrirPDF(a.tipo, a.data)}
                                            >

                                                <iframe
                                                    src={`data:${a.tipo};base64,${a.data}`}
                                                    className="preview-pdf"
                                                />

                                                <div className="pdf-overlay">
                                                    👁 Ver PDF
                                                </div>

                                            </div>

                                        )}


                                        {a.tipo.includes("image") && (

                                            <img
                                                src={`data:${a.tipo};base64,${a.data}`}
                                                onClick={() =>
                                                    setImagenPreview(`data:${a.tipo};base64,${a.data}`)
                                                }
                                                className="preview-img"
                                            />

                                        )}

                                        {a.tipo.includes("video") && (

                                            <video
                                                controls
                                                className="preview-video"
                                            >
                                                <source src={`data:${a.tipo};base64,${a.data}`} />
                                            </video>

                                        )}

                                        {(
                                            a.tipo.includes("word") ||
                                            a.tipo.includes("excel") ||
                                            a.tipo.includes("spreadsheet") ||
                                            a.tipo.includes("powerpoint")
                                        ) && (

                                                <div className="archivo-doc">

                                                    <div className="doc-icon">
                                                        {obtenerIcono(a.tipo)}
                                                    </div>

                                                    <p>{a.nombre}</p>

                                                    <button
                                                        className="btn-ver-doc"
                                                        onClick={() => abrirPDF(a.tipo, a.data)}
                                                    >
                                                        Abrir documento
                                                    </button>

                                                </div>

                                            )}


                                        <a
                                            href={`data:${a.tipo};base64,${a.data}`}
                                            download={a.nombre}
                                            className="btn-descargar-adjunto"
                                        >

                                            Descargar

                                        </a>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}


                    <div className="actions-buttons">

                        <div className="buttons-right">

                            <button
                                className="btn-pdf"
                                onClick={descargarPDF}
                            >

                                📥 Descargar PDF

                            </button>

                        </div>

                    </div>

                </section>

            </main>

            {imagenPreview && (

                <div
                    className="modal-imagen"
                    onClick={() => setImagenPreview(null)}
                >

                    <img
                        src={imagenPreview}
                        className="modal-imagen-contenido"
                    />

                </div>

            )}
            {pdfPreview && (

                <div className="modal-pdf">

                    <button
                        className="cerrar-modal"
                        onClick={() => setPdfPreview(null)}
                    >
                        ✕
                    </button>

                    <iframe
                        src={pdfPreview}
                        className="modal-pdf-contenido"
                    />

                </div>

            )}

        </div>

    )

}
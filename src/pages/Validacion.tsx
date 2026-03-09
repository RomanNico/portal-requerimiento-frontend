import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import avatar from "../assets/img/avatar.png";

import { getRequerimientos, API_URL } from "../services/api";

import Navbar from "../components/Navbar";

type Requerimiento = {
    id: string
    titulo: string
    estado: string
    prioridad?: "Alta" | "Media" | "Baja"
    autor?: string
    timestamp_ms?: number
    check_po?: boolean
    check_qa?: boolean
}

export default function Validacion() {

    const navigate = useNavigate();
    const rol = localStorage.getItem("rol");

    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);
    const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
    const [loading, setLoading] = useState(true);

    const requerimientosFiltrados = requerimientos.filter((r) => {

        const textoBusqueda = busqueda.toLowerCase();

        const fecha = r.timestamp_ms
            ? new Date(Number(r.timestamp_ms)).toLocaleDateString("es-CO")
            : "";

        const coincideBusqueda =
            r.id?.toLowerCase().includes(textoBusqueda) ||
            r.titulo?.toLowerCase().includes(textoBusqueda) ||
            r.autor?.toLowerCase().includes(textoBusqueda) ||
            fecha.includes(textoBusqueda);

        const coincideEstado =
            !estadoFiltro || r.estado === estadoFiltro;

        return coincideBusqueda && coincideEstado;

    });

    async function cargarRequerimientos() {

        setLoading(true);

        try {

            const res = await getRequerimientos("todos");

            const lista = Array.isArray(res?.data)
                ? res.data.filter((r: any) => r.estado !== "Finalizado")
                : [];

            const prioridadOrden: any = {
                Alta: 1,
                Media: 2,
                Baja: 3
            };

            lista.sort((a: any, b: any) => {

                const prioridad =
                    (prioridadOrden[a.prioridad] || 4) -
                    (prioridadOrden[b.prioridad] || 4);

                if (prioridad !== 0) return prioridad;

                const fechaA = Number(a.timestamp_ms || 0);
                const fechaB = Number(b.timestamp_ms || 0);

                return fechaB - fechaA;

            });

            setRequerimientos(lista);

        } catch (error) {

            console.error("Error cargando requerimientos", error);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        cargarRequerimientos();
    }, []);


    function abrirRequerimiento(id: string) {

        const rol = localStorage.getItem("rol");

        if (rol === "manager") {

            navigate(`/resultado/${id}`);

        } else {

            navigate(`/validacion-requerimiento?id=${id}`);

        }

    }

    async function finalizarRequerimiento(id: string) {

        const confirmar = window.confirm(
            "⚠ ¿Estás seguro de finalizar este requerimiento?\n\nNo aparecerá más en la bandeja."
        );

        if (!confirmar) return;

        try {

            const res = await fetch(
                `${API_URL}/requerimientos/finalizar/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        comentario: "Requerimiento finalizado por el usuario"
                    })
                }
            );

            const data = await res.json();

            if (data.success) {

                alert("Requerimiento finalizado");

                window.location.reload();

            } else {

                alert("No se pudo finalizar");

            }

        } catch (error) {

            console.error(error);
            alert("Error conectando con el servidor");

        }

    }

    const pendientes = requerimientos.filter(r => r.estado === "Pendiente").length;
    const validacion = requerimientos.filter(r => r.estado === "En validación").length;
    const listoParaEnviar = requerimientos.filter(r => r.estado === "Listo para enviar").length;
    const enviados = requerimientos.filter(r => r.estado === "Enviado").length;
    const rechazados = requerimientos.filter(r => r.estado === "Rechazado").length;
    const total = requerimientos.length;
    const totalFiltrados = requerimientosFiltrados.length;

    function formatearEstado(estado?: string) {

        if (!estado) return "";

        const mapa: any = {
            "Pendiente": "pendiente",
            "En validación": "validacion",
            "Listo para enviar": "listoparaenviar",
            "Enviado": "enviado",
            "Rechazado": "rechazado",
            "Editado": "editado"
        };

        return mapa[estado] || "";

    }

    return (

        <div>

            <Navbar />

            <main className="main-content">

                <section className="page-header">

                    <h1>
                        Bandeja de Validación
                    </h1>

                    <p>
                        Seleccione un requerimiento para revisar y validar.
                    </p>

                </section>

                <div style={{ marginBottom: "20px" }}>

                    <input
                        type="text"
                        placeholder="Buscar por ID, título, usuario o fecha..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            fontSize: "14px"
                        }}
                    />

                </div>

                <div className="contador-estados">

                    <span className="contador pendiente" onClick={() => setEstadoFiltro("Pendiente")}>
                        🟠 Pendientes: {pendientes}
                    </span>

                    <span className="contador validacion" onClick={() => setEstadoFiltro("En validación")}>
                        🔵 En validación: {validacion}
                    </span>

                    <span className="contador listo" onClick={() => setEstadoFiltro("Listo para enviar")}>
                        🟣 Listo para enviar: {listoParaEnviar}
                    </span>

                    <span className="contador enviado" onClick={() => setEstadoFiltro("Enviado")}>
                        🟢 Enviados: {enviados}
                    </span>

                    <span className="contador rechazado" onClick={() => setEstadoFiltro("Rechazado")}>
                        🔴 Rechazados: {rechazados}
                    </span>

                    {estadoFiltro && (
                        <span
                            className="contador"
                            style={{ cursor: "pointer" }}
                            onClick={() => setEstadoFiltro(null)}
                        >
                            ❌ Limpiar filtro
                        </span>
                    )}

                    <div className={`contador-total-right ${estadoFiltro ? "activo" : ""}`}>
                        📋 {totalFiltrados} de {total}
                    </div>

                </div>

                <section className="result-card">

                    <div className="validacion-grid">

                        {loading && (
                            <div className="loading-req">
                                ⏳ Cargando requerimientos...
                            </div>
                        )}

                        {!loading && requerimientosFiltrados.map((req) => (

                            <div
                                key={req.id}
                                className={`val-card jira ${req.prioridad?.toLowerCase()}`}
                                onClick={() => abrirRequerimiento(req.id)}
                            >

                                <div className="val-card-header">

                                    <span className="val-card-id">
                                        {req.id}
                                    </span>

                                    <h3 className="val-card-title">
                                        {req.titulo}
                                    </h3>

                                </div>

                                <div className="val-card-body">

                                    <div className="val-info-item">

                                        <img
                                            src={avatar}
                                            className="val-avatar"
                                        />

                                        <span className="autor">
                                            {req.autor || "Usuario"}
                                        </span>

                                    </div>

                                    <span className="fecha-req">

                                        📅 {req.timestamp_ms
                                            ? new Date(Number(req.timestamp_ms)).toLocaleDateString("es-CO")
                                            : "Sin fecha"}

                                    </span>

                                    <div className="val-validaciones">

                                        <span className={`val-chip ${req.check_po ? "ok" : "pendiente"}`}>
                                            👤 PO: {req.check_po ? "✅" : "⏳"}
                                        </span>

                                        <span className={`val-chip ${req.check_qa ? "ok" : "pendiente"}`}>
                                            🛡 QA: {req.check_qa ? "✅" : "⏳"}
                                        </span>

                                    </div>

                                </div>

                                <div className="val-card-footer">

                                    {req.prioridad && (
                                        <span className={`priority-badge ${req.prioridad.toLowerCase()}`}>
                                            {req.prioridad}
                                        </span>
                                    )}

                                    <span className={`val-badge ${formatearEstado(req.estado)}`}>
                                        {req.estado}
                                    </span>

                                </div>

                                {rol !== "manager" && (
                                    <button
                                        className="btn-finalizar"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            finalizarRequerimiento(req.id);
                                        }}
                                    >
                                        Finalizar
                                    </button>
                                )}

                            </div>

                        ))}

                    </div>

                </section>

            </main>

        </div>

    );

}
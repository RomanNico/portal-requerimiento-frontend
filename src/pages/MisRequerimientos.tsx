import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import agregar from "../assets/img/agregar.png";

import { obtenerUsuario } from "../services/auth";
import { getRequerimientos } from "../services/api";

type Requerimiento = {
    id: string
    titulo: string
    estado: string
    timestamp_ms: number
}

export default function MisRequerimientos() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
    const [filtrados, setFiltrados] = useState<Requerimiento[]>([]);

    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");

    useEffect(() => {

        const usuario = obtenerUsuario();

        if (!usuario) return;

        setLoading(true);

        getRequerimientos("mis", usuario)
            .then((res) => {

                const lista = res?.data || [];

                setRequerimientos(lista);
                setFiltrados(lista);

            })
            .catch(() => {

                setRequerimientos([]);
                setFiltrados([]);

            })
            .finally(() => {

                setLoading(false);

            });

    }, []);


    useEffect(() => {

        let lista = requerimientos;

        if (busqueda) {
            lista = lista.filter(r =>
                r.titulo.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (estadoFiltro) {
            lista = lista.filter(r => r.estado === estadoFiltro);
        }

        setFiltrados(lista);

    }, [busqueda, estadoFiltro, requerimientos]);


    function irNuevo() {
        navigate("/nuevo");
    }

    return (

        <div className="misrequerimientos-page">

            <Navbar />

            <main className="main-content">

                <section className="page-header">

                    <h1>Mis Requerimientos</h1>

                    <p>
                        Consulta el estado y detalle de tus solicitudes registradas.
                    </p>

                </section>


                <section className="req-toolbar">

                    <div className="req-search">

                        <input
                            type="text"
                            placeholder="🔎 Buscar Requerimiento..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />

                    </div>

                    <div className="req-filters">

                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                        >

                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En validación">En validación</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Rechazado">Rechazado</option>

                        </select>

                    </div>


                    <div className="req-counter">

                        <span>{filtrados.length}</span> requerimientos

                    </div>


                    <div className="req-footer">

                        <button className="btn-primary" onClick={irNuevo}>
                            <img src={agregar} alt="Nuevo" />
                        </button>

                    </div>

                </section>


                <section className="preview-card">

                    <div className="req-list">

                        {loading && (
                            <div className="loading-req">
                                ⏳ Cargando requerimientos...
                            </div>
                        )}

                        {!loading && filtrados.length === 0 && (
                            <p>No hay requerimientos registrados todavía...</p>
                        )}


                        {filtrados.map((r) => (

                            <div
                                key={r.id}
                                className="req-row"
                                onClick={() => navigate(`/resultado/${r.id}`)}
                            >

                                <div className="req-info">

                                    <span className="req-title">
                                        {r.titulo}
                                    </span>

                                    <span className="req-meta">
                                        📅 {new Date(Number(r.timestamp_ms)).toLocaleString("es-CO")}
                                    </span>

                                </div>

                                <span className="req-id">🧾
                                    {r.id}
                                </span>

                                <span className={`req-status-badge ${r.estado
                                    .toLowerCase()
                                    .normalize("NFD")
                                    .replace(/[\u0300-\u036f]/g, "")
                                    .replace(/\s/g, "")}`}>
                                    {r.estado}
                                </span>

                            </div>

                        ))}

                    </div>

                </section>

            </main>

        </div>

    );

}
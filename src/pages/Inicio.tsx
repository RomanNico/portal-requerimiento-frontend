import { Link } from "react-router-dom";
import registro from "../assets/img/registro.png";
import consulta from "../assets/img/consulta.png";
import pendiente from "../assets/img/pendiente.png";
import Navbar from "../components/Navbar";

export default function Inicio() {

  const rol = localStorage.getItem("rol");

  return (
    <>

      <Navbar />

      <main className="main-content">

        <section className="intro">

          <h1>
            Bienvenido(a) al Panel de Gestión de Requerimientos
          </h1>

          <p>
            Crea, consulta y da seguimiento a tus requerimientos en un solo lugar.
          </p>

        </section>

        <section className="actions">

          <Link to="/nuevo" className="action-card">

            <div className="icon">
              <img src={registro} />
            </div>

            <div className="content">

              <h3>Nuevo Requerimiento</h3>

              <p>
                Inicia el levantamiento de un requerimiento.
              </p>

              <span className="action-btn">
                Crear Ahora →
              </span>

            </div>

          </Link>


          <Link to="/mis-requerimientos" className="action-card">

            <div className="icon">
              <img src={consulta} />
            </div>

            <div className="content">

              <h3>Consultar Requerimientos</h3>

              <p>
                Visualiza los requerimientos que haz solicitado.
              </p>

              <span className="action-btn">
                Ver Detalles →
              </span>

            </div>

          </Link>


          {rol !== "user" && (

            <Link to="/validacion" className="action-card">

              <div className="icon">
                <img src={pendiente} />
              </div>

              <div className="content">

                <h3>Validación de Requerimientos</h3>

                <p>
                  Aprueba los requerimientos que han solicitado.
                </p>

                <span className="action-btn">
                  Ver Detalles →
                </span>

              </div>

            </Link>

          )}

        </section>

      </main>

    </>
  );

}
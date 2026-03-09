import { HashRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import MisRequerimientos from "./pages/MisRequerimientos";
import Nuevo from "./pages/Nuevo";
import Resultado from "./pages/Resultado";
import Validacion from "./pages/Validacion";
import ValidacionRequerimiento from "./pages/ValidacionRequerimiento";
import Editar from "./pages/Editar";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <HashRouter>

      <Routes>

        {/* LOGIN (sin protección) */}
        <Route path="/" element={<Login />} />

        {/* RUTAS PROTEGIDAS */}

        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <Inicio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-requerimientos"
          element={
            <ProtectedRoute>
              <MisRequerimientos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nuevo"
          element={
            <ProtectedRoute>
              <Nuevo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resultado/:id"
          element={
            <ProtectedRoute>
              <Resultado />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        {/* VALIDACIÓN SOLO ROLES ESPECÍFICOS */}

        <Route
          path="/validacion"
          element={
            <ProtectedRoute rolesPermitidos={["admin", "manager", "qa", "po"]}>
              <Validacion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/validacion-requerimiento"
          element={
            <ProtectedRoute rolesPermitidos={["admin", "manager", "qa", "po"]}>
              <ValidacionRequerimiento />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editar/:id"
          element={
            <ProtectedRoute rolesPermitidos={["admin", "manager", "qa", "po"]}>
              <Editar />
            </ProtectedRoute>
          }
        />

      </Routes>

    </HashRouter>
  );
}

export default App;
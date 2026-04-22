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

/**
 * Componente raíz de la aplicación.
 * Configura todas las rutas utilizando HashRouter (por compatibilidad con GitHub Pages).
 *
 * Estructura de rutas:
 * - / → Login (pública)
 * - /inicio → Dashboard (protegida)
 * - /mis-requerimientos → Lista personal (protegida)
 * - /nuevo → Crear requerimiento vía chat (protegida)
 * - /resultado/:id → Detalle del requerimiento (protegida)
 * - /perfil → Perfil de usuario (protegida)
 * - /validacion → Bandeja de validación (roles: admin, manager, qa, po)
 * - /validacion-requerimiento?id=xxx → Validación detallada (roles: admin, manager, qa, po)
 * - /editar/:id → Edición de requerimiento (roles: admin, manager, qa, po)
 * - /* → Fallback a Login (para MSAL redirect)
 *
 * @component
 */
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

        {/* Fallback: evita pantalla en blanco si MSAL retorna con #code=... */}
        <Route path="/*" element={<Login />} />

      </Routes>

    </HashRouter>
  );
}

export default App;

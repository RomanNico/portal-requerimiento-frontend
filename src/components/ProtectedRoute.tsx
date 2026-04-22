import { Navigate } from "react-router-dom";

type Props = {
    children: React.ReactNode;
    /**
     * Lista de roles permitidos para acceder a esta ruta.
     * Si no se especifica, cualquier usuario autenticado puede acceder.
     */
    rolesPermitidos?: string[];
};

/**
 * Componente HOC (Higher-Order Component) para proteger rutas.
 *
 * Lógica:
 * 1. Verifica que exista usuario Y rol en localStorage (autenticación)
 * 2. Si requiere roles específicos, valida que el usuario tenga uno de ellos
 * 3. Redirige a login (/) si no autenticado
 * 4. Redirige a inicio si autenticado pero sin permisos suficientes
 *
 * Uso: Envolver rutas protegidas en App.tsx
 *
 * @example
 * <ProtectedRoute rolesPermitidos={["admin", "manager"]}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, rolesPermitidos }: Props) {

    const usuario = localStorage.getItem("usuario");
    const rol = localStorage.getItem("rol");

    // Si no está autenticado (no hay usuario SSO en localStorage)
    if (!usuario || !rol) {
        return <Navigate to="/" replace />;
    }

    // Si tiene roles restringidos y el usuario no cumple
    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
        return <Navigate to="/inicio" replace />;
    }

    return <>{children}</>;
}
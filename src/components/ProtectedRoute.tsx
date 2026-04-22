import { Navigate } from "react-router-dom";

type Props = {
    children: React.ReactNode;
    rolesPermitidos?: string[];
};

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
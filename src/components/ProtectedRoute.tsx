import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode
  rolesPermitidos?: string[]
}

export default function ProtectedRoute({ children, rolesPermitidos }: Props) {

  const rol = localStorage.getItem("rol");

  // Si no está logueado
  if (!rol) {
    return <Navigate to="/" replace />;
  }

  // si no tiene permiso 
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/inicio" replace />;
  }

  return <>{children}</>;
}
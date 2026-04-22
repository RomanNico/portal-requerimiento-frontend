// ─── Perfil SSO completo ────────────────────────────────────────────

export interface PerfilSSO {
    usuario: string;
    correo: string;
    nombre: string;
    rol: string;
    cargo: string;
    area: string;
    centro_costo: string;
    oid: string;
}

export function guardarPerfilSSO(perfil: PerfilSSO) {
    localStorage.setItem("usuario", perfil.usuario);
    localStorage.setItem("rol", perfil.rol);
    localStorage.setItem("sso_nombre", perfil.nombre);
    localStorage.setItem("sso_correo", perfil.correo);
    localStorage.setItem("sso_cargo", perfil.cargo);
    localStorage.setItem("sso_area", perfil.area);
    localStorage.setItem("sso_centro_costo", perfil.centro_costo);
    localStorage.setItem("sso_oid", perfil.oid);
}

export function obtenerPerfilSSO(): PerfilSSO | null {
    const usuario = localStorage.getItem("usuario");
    const rol = localStorage.getItem("rol");
    if (!usuario || !rol) return null;
    return {
        usuario,
        rol,
        nombre: localStorage.getItem("sso_nombre") || usuario,
        correo: localStorage.getItem("sso_correo") || "",
        cargo: localStorage.getItem("sso_cargo") || "",
        area: localStorage.getItem("sso_area") || "",
        centro_costo: localStorage.getItem("sso_centro_costo") || "",
        oid: localStorage.getItem("sso_oid") || ""
    };
}

// ─── Compatibilidad con código existente ────────────────────────────

export function guardarUsuario(usuario: string) {
    localStorage.setItem("usuario", usuario);
}

export function obtenerUsuario() {
    return localStorage.getItem("usuario");
}

export function logout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("sso_nombre");
    localStorage.removeItem("sso_correo");
    localStorage.removeItem("sso_cargo");
    localStorage.removeItem("sso_area");
    localStorage.removeItem("sso_centro_costo");
    localStorage.removeItem("sso_oid");
    window.location.href = "/";
}
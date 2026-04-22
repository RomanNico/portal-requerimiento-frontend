// ─── Perfil SSO completo ────────────────────────────────────────────

/**
 * Interfaz que representa el perfil de un usuario autenticado vía SSO.
 * Contiene toda la información del usuario obtenida desde Azure AD y Graph API.
 */
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

/**
 * Guarda el perfil completo del usuario SSO en localStorage.
 * Se utiliza después de un login exitoso con Microsoft.
 * Almacena tanto datos básicos (usuario, rol) como extendidos (cargo, área, OID).
 * @param {PerfilSSO} perfil - Datos del usuario a guardar
 */
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

/**
 * Recupera el perfil SSO desde localStorage.
 * Verifica que existan usuario y rol (mínimo requerido).
 * @returns {PerfilSSO|null} Perfil del usuario o null si no hay sesión
 */
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

// ─── Compatibilidad con código existente (login local) ────────────────────

/**
 * Guarda solo el nombre de usuario (modo legacy/local).
 * @param {string} usuario - Nombre de usuario
 * @deprecated Usar guardarPerfilSSO para autenticación completa
 */
export function guardarUsuario(usuario: string) {
    localStorage.setItem("usuario", usuario);
}

/**
 * Obtiene el nombre de usuario desde localStorage.
 * @returns {string|null} Nombre de usuario o null si no hay sesión
 * @deprecated Usar obtenerPerfilSSO para obtener perfil completo con más datos
 */
export function obtenerUsuario() {
    return localStorage.getItem("usuario");
}

/**
 * Cierra sesión eliminando todos los datos de localStorage.
 * Incluye datos tanto de SSO como de login local.
 * Redirige a la página de login (/).
 */
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
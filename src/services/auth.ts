export function guardarUsuario(usuario: string) {

    localStorage.setItem("usuario", usuario);

}

export function obtenerUsuario() {

    return localStorage.getItem("usuario");

}

export function logout() {

    localStorage.removeItem("usuario");

    window.location.href = "/";

}
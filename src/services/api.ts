export const API_URL = "http://localhost:3000";

// ─── LOGIN SSO (Azure AD) ────────────────────────────────────────────────
export async function ssoLogin(idToken: string) {
    const res = await fetch(`${API_URL}/sso-login`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
        }
    });
    return res.json();
}

// LOGIN TRADICIONAL (mantenido para compatibilidad)
export async function login(usuario: string, password: string) {

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario,
            password
        })
    });

    return res.json();

}


// PERFIL

export async function getPerfil(usuario: string) {

    const res = await fetch(`${API_URL}/perfil/${usuario}`);

    return res.json();

}


// CAMBIAR CONTRASEÑA

export async function cambiarPassword(
    usuario: string,
    passActual: string,
    passNueva: string
) {

    const res = await fetch(`${API_URL}/cambiar-password`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            usuario,
            actual: passActual,
            nueva: passNueva
        })

    });

    return res.json();

}



// TRAER REQUERIMIENTOS
export async function getRequerimientos(vista: "mis" | "todos", usuario?: string) {

    let url = `${API_URL}/requerimientos?vista=${vista}`;

    if (usuario) {
        url += `&usuario=${usuario}`;
    }

    const res = await fetch(url);

    return await res.json();

}

// CREAR REQUERIMIENTO
export async function crearRequerimiento(data: any) {

    const res = await fetch(`${API_URL}/requerimientos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}

// REQUERIMIENTO POR USUARIO
export async function getRequerimiento(id: string) {

    const res = await fetch(
        `${API_URL}/requerimientos/${id}`
    );

    return res.json();

}

// CHATBOT
export async function chatNova(message: string, threadId: string, files?: File[]) {

    const formData = new FormData();

    formData.append("message", message);
    formData.append("threadId", threadId);
    formData.append("channel", "web");

    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append("files", file);
        });
    }

    const res = await fetch(`${API_URL}/api/nova`, {
        method: "POST",
        body: formData
    });

    return res.json();
}

// GUARDAR VALIDACIÓN
export async function guardarValidacion(
    id: string,
    po: boolean,
    qa: boolean
) {

    const res = await fetch(
        `${API_URL}/requerimientos/${id}/validacion`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                po,
                qa
            })
        }
    );

    return res.json();
}

// ENVIAR A JIRA
export async function enviarAJira(data: any) {

    const res = await fetch(`${API_URL}/crear-jira`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}


// ACTUALIZAR REQUERIMIENTO
export async function actualizarRequerimiento(
    id: string,
    campos: any
) {

    const res = await fetch(`${API_URL}/requerimientos/${id}`, {

        method: "PATCH",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(campos)

    });

    return res.json();
}

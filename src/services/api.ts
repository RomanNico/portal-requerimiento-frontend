export const API_URL = "http://localhost:3000";

// ─── LOGIN SSO (Azure AD) ────────────────────────────────────────────────
/**
 * Realiza autenticación SSO con Azure Active Directory.
 * Envía el token JWT de Azure AD al backend para validación.
 * @param {string} idToken - Token JWT de Azure AD (Bearer token)
 * @returns {Promise<Object>} Respuesta JSON con { success, usuario, correo, nombre, rol, ... }
 */
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

/**
 * Autenticación tradicional con usuario y contraseña.
 * Utiliza bcrypt en el backend para verificar la contraseña.
 * @deprecated Preferir ssoLogin para autenticación moderna
 * @param {string} usuario - Nombre de usuario o correo
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<Object>} Respuesta JSON con { success, usuario, rol } o { success: false }
 */
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

/**
 * Obtiene información de perfil de un usuario específico.
 * @param {string} usuario - Nombre de usuario o correo
 * @returns {Promise<Object>} Respuesta JSON con { success, usuario: { nombre_usuario, correo, centro_costo, genero, rol } }
 */
export async function getPerfil(usuario: string) {

    const res = await fetch(`${API_URL}/perfil/${usuario}`);

    return res.json();

}


// CAMBIAR CONTRASEÑA

/**
 * Cambia la contraseña de un usuario después de validar la actual.
 * @param {string} usuario - Nombre de usuario
 * @param {string} passActual - Contraseña actual (texto plano)
 * @param {string} passNueva - Nueva contraseña (se hashea en servidor)
 * @returns {Promise<Object>} Respuesta JSON con { success, message? }
 */
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

/**
 * Obtiene la lista de requerimientos desde la base de datos.
 * @param {"mis" | "todos"} vista - Tipo de consulta: 'mis' para requerimientos del usuario, 'todos' para todos
 * @param {string} [usuario] - Usuario filtrar (requerido si vista='mis')
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean, data: Array<Requerimiento> }
 */
export async function getRequerimientos(vista: "mis" | "todos", usuario?: string) {

    let url = `${API_URL}/requerimientos?vista=${vista}`;

    if (usuario) {
        url += `&usuario=${usuario}`;
    }

    const res = await fetch(url);

    return await res.json();

}

// CREAR REQUERIMIENTO

/**
 * Crea un nuevo requerimiento en la base de datos.
 * @param {Object} data - Datos del requerimiento (ver backend para campos exactos)
 * @param {string} data.titulo - Título del requerimiento
 * @param {string} data.autor -Usuario creador
 * @param {string} data.fecha - Fecha de creación
 * @param {number} data.timestamp_ms - Timestamp en milisegundos
 * @param {string} data.contenido - Contenido HTML/ADF
 * @param {string} [data.estado="Pendiente"] - Estado inicial
 * @param {string} data.prioridad - Prioridad
 * @param {string} [data.tipo_caso="Requerimiento"] - Tipo de caso
 * @param {string} [data.centro_costo] - Centro de costos
 * @param {Array} [data.adjuntos] - Array de archivos adjuntos
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean, id?: string }
 */
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

/**
 * Obtiene un requerimiento específico por su ID.
 * Parsea el campo adjuntos de JSON string a array automáticamente.
 * @param {string} id - Identificador del requerimiento (ej: REQ_0001)
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean, data: Requerimiento }
 */
export async function getRequerimiento(id: string) {

    const res = await fetch(
        `${API_URL}/requerimientos/${id}`
    );

    return res.json();

}

// CHATBOT

/**
 * Envía un mensaje al chatbot Nova IA.
 * Usa FormData para enviar texto y archivos adjuntos en una misma petición.
 * @param {string} message - Mensaje del usuario
 * @param {string} threadId - ID del hilo de conversación (persistente por usuario)
 * @param {File[]} [files] - Array de archivos adjuntos (opcional)
 * @returns {Promise<Object>} Respuesta JSON con { reply: string, adjuntos: Array }
 */
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

/**
 * Guarda el estado de validación PO/QA de un requerimiento.
 * @param {string} id - Identificador del requerimiento
 * @param {boolean} po - Aprobación de Product Owner
 * @param {boolean} qa - Aprobación de QA Técnica
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean }
 */
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

/**
 * Envía un requerimiento a Jira creando un nuevo ticket.
 * @param {Object} data - Datos para crear el ticket en Jira
 * @param {Object} data.tipoCaso - Información del tipo de caso { Subject, IdByProject }
 * @param {string} data.textoFinal - Contenido del requerimiento (formato HTML)
 * @param {string} data.fechaRegistro - Fecha de registro en formato ISO
 * @param {string} [data.customfield_10120] - Centro de costo (ID o nombre)
 * @param {Array} [data.adjuntos=[]] - Array de archivos adjuntos
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean, issueKey?: string, error?: string }
 */
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

/**
 * Actualiza campos específicos de un requerimiento existente.
 * @param {string} id - Identificador del requerimiento
 * @param {Object} campos - Campos a actualizar (estado, comentario, contenido, etc.)
 * @returns {Promise<Object>} Respuesta JSON con { success: boolean }
 */
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

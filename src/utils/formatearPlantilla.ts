/**
 * Formatea el contenido HTML de un requerimiento para visualización en el frontend.
 *
 * Transformaciones aplicadas:
 * 1. Elimina la marca "Plantilla Final Generada"
 * 2. Extrae el título principal y lo envuelve en <h1 class="doc-main-title">
 * 3. Reemplaza nombres de secciones por encabezados <h2> con emojis
 * 4. Convierte etiquetas clave en texto en negrita (<strong>)
 * 5. Transforma listas con bullet points (–, -, •) en <ul><li>
 * 6. Aplica badges de colores a la prioridad (Alta/Media/Baja)
 *
 * Lista de secciones reconocidas (con emojis):
 * - Tipo de gestión 📋
 * - Descripción general del requerimiento 📄
 * - Problema que se busca resolver ⚠️
 * - Área/proceso impactado 🏢
 * - Usuarios impactados 👥
 * - Objetivo de la solución 🎯
 * - Sistemas involucrados ⚙️
 * - Riesgos ⚠️
 * - Criterios de aceptación ✅
 * - Centro de costos 🏷️
 * - Adjuntos 📎
 * - Entre otras...
 *
 * @param {string} texto - Contenido HTML del requerimiento
 * @returns {string} HTML formateado con estilos CSS listo para renderizar
 */
export function formatearPlantilla(texto: string) {

    if (!texto) return "";

    let html = texto;

    // ─── LIMPIAR TEXTO BASURA ────────────────────────────────────────────────
    // Elimina la marca "Plantilla Final Generada" que agrega Nova IA
    html = html.replace(/Plantilla Final Generada/gi, "");

    // ─── EXTRAER TÍTULO PRINCIPAL ───────────────────────────────────────────
    // Busca "Título del requerimiento: <valor>" o "Plantilla Final Generada - <titulo>"
    let titulo = "";

    const matchTitulo = html.match(/Título del requerimiento:<br>(.*?)<br>/i);

    if (matchTitulo) {
        titulo = matchTitulo[1].trim();
    }

    if (!titulo) {
        const matchNova = texto.match(/Plantilla Final Generada\s*[–-]\s*(.*?)<br>/i);
        if (matchNova) {
            titulo = matchNova[1].trim();
        }
    }

    // Inserta el título como <h1> al inicio del contenido si se encontró
    if (titulo) {
        html = html.replace(
            /Título del requerimiento:<br>.*?<br>/i,
            ""
        );
        html = `<h1 class="doc-main-title">📌 ${titulo}</h1><br>` + html;
    }

    // ─── AGREGAR EMOJIS A SECCIONES ─────────────────────────────────────────
    // Mapa de secciones reconocidas con su emoji correspondiente
    const secciones = [
        { nombre: "Tipo de gestión", icon: "📋" },
        { nombre: "Tipo de solicitud", icon: "🧾" },
        { nombre: "Descripción general del requerimiento", icon: "📄" },
        { nombre: "Descripción breve de la necesidad", icon: "📄" },
        { nombre: "Problema que se busca resolver", icon: "⚠️" },
        { nombre: "Área / proceso impactado", icon: "🏢" },
        { nombre: "Área o proceso impactado", icon: "🏢" },
        { nombre: "Usuarios impactados", icon: "👥" },
        { nombre: "Objetivo de la solución", icon: "🎯" },
        { nombre: "Descripción del proceso actual", icon: "🔍" },
        { nombre: "Descripción del proceso esperado", icon: "🚀" },
        { nombre: "Descripción del proceso propuesto", icon: "🚀" },
        { nombre: "Sistemas involucrados", icon: "⚙️" },
        { nombre: "Ambientes y sistemas involucrados", icon: "⚙️" },
        { nombre: "Reglas de asignación requeridas", icon: "📑" },
        { nombre: "Implicaciones si no se realiza", icon: "⚠️" },
        { nombre: "Impacto en la empresa", icon: "📊" },
        { nombre: "Impacto en la empresa y riesgo operativo", icon: "📊" },
        { nombre: "Beneficios esperados", icon: "✨" },
        { nombre: "Prioridad asignada", icon: "🔥" },
        { nombre: "Riesgos", icon: "⚠️" },
        { nombre: "Dependencias", icon: "🔗" },
        { nombre: "Alcance", icon: "📦" },
        { nombre: "Alcance (qué incluye y qué no incluye)", icon: "📦" },
        { nombre: "Exclusiones", icon: "🚫" },
        { nombre: "Criterios de aceptación", icon: "✅" },
        { nombre: "Autor del requerimiento", icon: "👤" },
        { nombre: "Área técnica responsable del desarrollo", icon: "💻" },
        { nombre: "Centro de costos", icon: "🏷️" },
        { nombre: "Adjuntos", icon: "📎" },
        { nombre: "Observaciones adicionales", icon: "📝" }
    ];

    // ─── CONVERTIR NOMBRES DE SECCIONES EN ENCABEZADOS <h2> ─────────────────
    // Busca cada nombre de sección seguido de ":" y lo reemplaza por un h2 con emoji
    secciones.forEach(sec => {
        const regex = new RegExp(`${sec.nombre}:`, "gi");
        html = html.replace(
            regex,
            `<h2 class="doc-section">${sec.icon} ${sec.nombre}</h2>`
        );
    });

    // ─── FORMATEAR ETIQUETAS CLAVE EN NEGRITA ────────────────────────────────
    // Convierte etiquetas específicas en <strong class="doc-bold">
    const etiquetasBold = [
        "Incluye:",
        "No incluye (en esta fase):",
        "Prioridad asignada (análisis del requerimiento):",
        "Riesgos y consideraciones (documentales):",
        "Dependencias conocidas:",
        "Aprobador / responsable funcional:"
    ];

    etiquetasBold.forEach(et => {
        const regex = new RegExp(et, "gi");
        html = html.replace(
            regex,
            `<strong class="doc-bold">${et}</strong>`
        );
    });

    // ─── CONVERTIR LISTAS CON BULLETS ────────────────────────────────────────
    // Transforma '-', '–', '•' en <li> y agrupa en <ul>
    html = html.replace(/– /g, "<li>");
    html = html.replace(/- /g, "<li>");
    html = html.replace(/• /g, "<li>");

    // Cierra cada <li> encontrado (hasta el siguiente <br>)
    html = html.replace(/<li>(.*?)<br>/g, "<li>$1</li>");

    // Agrupa elementos <li> consecutivos en una lista <ul>
    html = html.replace(/(<li>.*?<\/li>)/g, "<ul>$1</ul>");

    // ─── FORMATEAR PRIORIDAD CON BADGE DE COLOR ─────────────────────────────
    // Aplica clase CSS según prioridad: Alta (rojo), Media (amarillo), Baja (verde)
    html = html.replace(
        /Prioridad:\s*(Alta|Media|Baja)/gi,
        (_, p1) => {
            let color = "priority-media";
            if (p1 === "Alta") color = "priority-alta";
            if (p1 === "Baja") color = "priority-baja";
            return `<span class="priority-badge ${color}">${p1}</span>`;
        }
    );

    return html;

}
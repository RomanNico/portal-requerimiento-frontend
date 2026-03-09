export function formatearPlantilla(texto: string) {

    if (!texto) return "";

    let html = texto;

    /* limpiar basura de nova */

    html = html.replace(/Plantilla Final Generada/gi, "");

    /* detectar titulo correcto */

    let titulo = "";

    /* prioridad 1: titulo del requerimiento */

    const matchTitulo = html.match(/Título del requerimiento:<br>(.*?)<br>/i);

    if (matchTitulo) {
        titulo = matchTitulo[1].trim();
    }

    /* prioridad 2: titulo de nova */

    if (!titulo) {

        const matchNova = texto.match(/Plantilla Final Generada\s*[–-]\s*(.*?)<br>/i);

        if (matchNova) {
            titulo = matchNova[1].trim();
        }

    }

    /* insertar titulo */

    if (titulo) {

        html = html.replace(
            /Título del requerimiento:<br>.*?<br>/i,
            ""
        );

        html = `<h1 class="doc-main-title">📌 ${titulo}</h1><br>` + html;

    }

    /* iconos secciones */

    const secciones = [
        { nombre: "Tipo de gestión", icon: "📋" },
        { nombre: "Tipo de solicitud", icon: "🧾" },
        { nombre: "Descripción general del requerimiento", icon: "📄" },
        { nombre: "Descripción breve de la necesidad", icon: "📄" },
        { nombre: "Problema que se busca resolver", icon: "⚠" },
        { nombre: "Área / proceso impactado", icon: "🏢" },
        { nombre: "Área o proceso impactado", icon: "🏢" },
        { nombre: "Usuarios impactados", icon: "👥" },
        { nombre: "Objetivo de la solución", icon: "🎯" },
        { nombre: "Descripción del proceso actual", icon: "🔍" },
        { nombre: "Descripción del proceso esperado", icon: "🚀" },
        { nombre: "Descripción del proceso propuesto", icon: "🚀" },
        { nombre: "Sistemas involucrados", icon: "⚙" },
        { nombre: "Ambientes y sistemas involucrados", icon: "⚙" },
        { nombre: "Reglas de asignación requeridas", icon: "📑" },
        { nombre: "Implicaciones si no se realiza", icon: "⚠" },
        { nombre: "Impacto en la empresa", icon: "📊" },
        { nombre: "Impacto en la empresa y riesgo operativo", icon: "📊" },
        { nombre: "Beneficios esperados", icon: "✨" },
        { nombre: "Prioridad asignada", icon: "🔥" },
        { nombre: "Riesgos", icon: "⚠" },
        { nombre: "Dependencias", icon: "🔗" },
        { nombre: "Alcance", icon: "📦" },
        { nombre: "Alcance (qué incluye y qué no incluye):", icon: "📦" },
        { nombre: "Exclusiones", icon: "🚫" },
        { nombre: "Criterios de aceptación", icon: "✅" },
        { nombre: "Autor del requerimiento", icon: "👤" },
        { nombre: "Área técnica responsable del desarrollo", icon: "💻" },
        { nombre: "Centro de costos", icon: "🏷" },
        { nombre: "Adjuntos", icon: "📎" },
        { nombre: "Observaciones adicionales", icon: "📝" }
    ];

    /* etiquetas en negrita */

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

    secciones.forEach(sec => {

        const regex = new RegExp(`${sec.nombre}:`, "gi");

        html = html.replace(
            regex,
            `<h2 class="doc-section">${sec.icon} ${sec.nombre}</h2>`
        );

    });

    /* listas */

    html = html.replace(/– /g, "<li>");
    html = html.replace(/- /g, "<li>");

    html = html.replace(/<li>(.*?)<br>/g, "<li>$1</li>");

    html = html.replace(/(<li>.*?<\/li>)/g, "<ul>$1</ul>");

    /* prioridad */

    html = html.replace(
        /Prioridad:\s*(Alta|Media|Baja)/gi,
        (match, p1) => {

            let color = "priority-media";

            if (p1 === "Alta") color = "priority-alta";
            if (p1 === "Baja") color = "priority-baja";

            return `<span class="priority-badge ${color}">${p1}</span>`;

        }
    );

    return html;

}
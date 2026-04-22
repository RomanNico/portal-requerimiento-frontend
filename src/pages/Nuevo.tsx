import { useState, useRef, useEffect } from "react";

import avatar from "../assets/img/avatar.png";
import bot from "../assets/img/bot.png";

import { chatNova, crearRequerimiento } from "../services/api";
import Navbar from "../components/Navbar";

import DOMPurify from "dompurify";

/**
 * Estructura de un archivo adjunto en el chat o requerimiento.
 */
type FilePreview = {
    nombre?: string
    name?: string
    tipo?: string
    type?: string
    data?: string
}

/**
 * Estructura de un mensaje en el chat (usuario o bot).
 */
type Message = {
    role: "user" | "bot"
    text: string
    files?: FilePreview[]
}

/**
 * Página para creación de nuevos requerimientos mediante chat con Nova IA.
 *
 * Flujo:
 * 1. Usuario interactúa con Nova IA a través de un chat conversacional
 * 2. Nova guía al usuario para completar la información del requerimiento
 * 3. Al detectar "Plantilla final generada", se extraen los datos automáticamente
 * 4. Se crea el requerimiento en la BD y se enlaza con el thread de Nova
 *
 * @component
 */
export default function Nuevo() {

    /**
     * Array de mensajes del chat. Cada mensaje tiene un rol (user/bot),
     * texto HTML (para el bot) y archivos adjuntos opcionales.
     */
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "bot",
            text: "Soy Asistente de Gestión de Requerimientos.<br><br>Te ayudaré a crear tu requerimiento paso a paso.<br><br>¿Cuál es tu nombre? 🙂"
        }
    ]);

    /**
     * Texto actual del input del chat.
     */
    const [input, setInput] = useState<string>("");

    /**
     * Indicador de carga mientras se espera respuesta de Nova IA.
     */
    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Archivos seleccionados por el usuario para subir al chat.
     */
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    /**
     * Referencia al contenedor de mensajes para hacer scroll automático.
     */
    const chatRef = useRef<HTMLDivElement>(null);

    /**
     * ID único del thread de conversación con Nova IA.
     * Se deriva del usuario actual en localStorage para mantener consistencia.
     */
    const threadId = "thread_" + localStorage.getItem("usuario");

    /**
     * Efecto para hacer scroll al fondo del chat cada vez que cambian los mensajes
     * o el estado de carga (para mostrar la última respuesta).
     */
    useEffect(() => {

        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "smooth"
        });

    }, [messages, loading]);



    /**
     * Envía un mensaje del usuario a Nova IA y procesa la respuesta.
     *
     * Flujo:
     * 1. Agrega el mensaje del usuario al chat
     * 2. Envía el mensaje + archivos adjuntos al endpoint /api/nova
     * 3. Agrega la respuesta de Nova al chat
     * 4. Si Nova detecta "Plantilla final generada", extrae los datos del requerimiento
     *    (título, centro de costo, prioridad) y crea el requerimiento en la BD
     */
    async function sendMessage() {

        if (!input.trim()) return;

        const userMessage = input;

        setMessages(prev => [
            ...prev,
            {
                role: "user",
                text: userMessage,
                files: selectedFiles as any
            }
        ]);

        setInput("");
        setLoading(true);

        try {

            const res = await chatNova(userMessage, threadId, selectedFiles);

            const botReply = res?.reply || "No hubo respuesta del asistente.";

            setMessages(prev => [
                ...prev,
                {
                    role: "bot",
                    text: botReply
                }
            ]);

            if (botReply.toLowerCase().includes("plantilla final generada")) {

                const nuevoReq = {

                    titulo: extraerTitulo(botReply) || "Requerimiento sin título",

                    autor: localStorage.getItem("usuario"),

                    fecha: new Date().toLocaleString(),

                    timestamp_ms: Date.now(),

                    contenido: convertirPlantillaAHTML(botReply),

                    estado: "Pendiente",

                    prioridad: extraerPrioridadTexto(botReply),

                    tipo_caso: "Requerimiento",

                    centro_costo: extraerCentroCostoTexto(botReply),

                    adjuntos: res.adjuntos || [],

                    threadId: threadId
                };

                await crearRequerimiento(nuevoReq);

            }

        } catch (error) {

            setMessages(prev => [
                ...prev,
                { role: "bot", text: "⚠️ Error al contactar el asistente." }
            ]);

        }

        setSelectedFiles([]);

        setLoading(false);

    }


    /**
     * Maneja la selección de archivos desde el input file.
     * Agrega los archivos seleccionados al estado selectedFiles.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input
     */
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

        if (!e.target.files) return;

        const files = Array.from(e.target.files) as File[];

        setSelectedFiles(prev => [...prev, ...files]);

        e.target.value = "";

    }



    return (

        <div className="nuevo-page">


            <Navbar />


            <main className="main-content-bot">

                <section className="chatbot-full">

                    <div className="chat-messages" ref={chatRef}>

                        {messages.map((msg, i) => (

                            <div key={i} className={`message ${msg.role}`}>

                                <div className="message-icon">

                                    {msg.role === "bot"
                                        ? <img src={bot} />
                                        : <img src={avatar} />
                                    }

                                </div>

                                <div className="message-content">

                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(msg.text)
                                        }}
                                    />

                                    {msg.files && msg.files.length > 0 && (

                                        <div className="file-preview">

                                            {msg.files.map((file: any, index: number) => {

                                                const isImage =
                                                    file.tipo?.startsWith("image") ||
                                                    file.type?.startsWith("image");

                                                if (isImage && file.data) {

                                                    return (
                                                        <img
                                                            key={index}
                                                            src={`data:${file.tipo};base64,${file.data}`}
                                                            className="chat-image"
                                                        />
                                                    );

                                                }

                                                if (file.data) {

                                                    return (

                                                        <a
                                                            key={index}
                                                            href={`data:${file.tipo};base64,${file.data}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="file-chip"
                                                        >
                                                            📎 {file.nombre || file.name}
                                                        </a>

                                                    );

                                                }

                                                return (

                                                    <div key={index} className="file-chip">
                                                        📎 {file.nombre || file.name}
                                                    </div>

                                                );

                                            })}

                                        </div>

                                    )}

                                </div>

                            </div>

                        ))}


                        {loading && (

                            <div className="message bot">

                                <div className="message-icon">
                                    <img src={bot} />
                                </div>

                                <div className="message-content typing">
                                    Nova está escribiendo...
                                </div>

                            </div>

                        )}

                    </div>



                    {selectedFiles.length > 0 && (

                        <div className="file-preview">

                            {selectedFiles.map((file, index) => {

                                const isImage = file.type.startsWith("image");

                                return (

                                    <div key={index} className="file-chip">

                                        {isImage && (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                className="file-thumb"
                                            />
                                        )}

                                        <span>{file.name}</span>

                                        <button
                                            onClick={() =>
                                                setSelectedFiles(prev =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                            ✖
                                        </button>

                                    </div>

                                );

                            })}

                        </div>

                    )}



                    <div className="chat-input-area">

                        <div className="input-box">

                            <label htmlFor="fileInput" className="attach-btn">
                                📎
                            </label>

                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                onChange={handleFileChange}
                            />

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />

                            <button onClick={sendMessage}>
                                ➤
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );
}


/* =============================
FUNCIONES EXTRAER CAMPOS
============================= */

/**
 * Extrae el título del requerimiento a partir de la respuesta de Nova.
 * Busca patrones como "Título del requerimiento: ..." o la primera línea.
 * @param {string} texto - Respuesta completa de Nova IA
 * @returns {string} Título extraído o "Requerimiento sin título" por defecto
 */
function extraerTitulo(texto: string) {

    if (!texto) return "Requerimiento sin título";

    const limpio = texto
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .trim();

    const matchPlantilla = limpio.match(/^(.+?)\s*-\s*Plantilla Final Generada/i);

    if (matchPlantilla) {
        return matchPlantilla[1].trim();
    }
    const matchTitulo = limpio.match(/t[ií]tulo del requerimiento[:\s]*\n?(.+)/i);

    if (matchTitulo) {
        return matchTitulo[1].trim();
    }
    const lineas = limpio.split("\n").map(l => l.trim()).filter(Boolean);

    if (lineas.length > 0) {
        return lineas[0];
    }

    return "Requerimiento sin título";

}

/**
 * Extrae el centro de costo de la respuesta de Nova.
 * Busca la línea que contiene "centro de costos" y retorna la siguiente línea.
 * @param {string} texto - Respuesta completa de Nova IA
 * @returns {string|null} Centro de costo extraído o null si no se encuentra
 */
function extraerCentroCostoTexto(texto: string) {

    if (!texto) return null;

    const limpio = texto.replace(/<br>/gi, "\n");

    const lineas = limpio.split("\n");

    for (let i = 0; i < lineas.length; i++) {

        if (lineas[i].toLowerCase().includes("centro de costos")) {

            const siguiente = lineas[i + 1];

            if (!siguiente) return null;

            return siguiente.trim();

        }

    }

    return null;

}

/**
 * Extrae la prioridad del requerimiento de la respuesta de Nova.
 * Busca la sección "prioridad" y detecta valores: Alta, Media, Baja.
 * Retorna "Media" como valor por defecto si no se encuentra.
 * @param {string} texto - Respuesta completa de Nova IA
 * @returns {string} Prioridad: "Alta", "Media" o "Baja"
 */
function extraerPrioridadTexto(texto: string) {

    if (!texto) return "Media";

    const limpio = texto
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .toLowerCase();

    const lineas = limpio.split("\n").map(l => l.trim());

    for (let i = 0; i < lineas.length; i++) {

        if (lineas[i].includes("prioridad")) {

            const siguiente = lineas[i + 1];

            if (!siguiente) return "Media";

            if (siguiente.includes("alta")) return "Alta";
            if (siguiente.includes("media")) return "Media";
            if (siguiente.includes("baja")) return "Baja";

        }

    }

    return "Media";

}

/**
 * Convierte el texto plano de la plantilla generada por Nova a HTML.
 * Reemplaza saltos de línea por <br> y elimina marcadores de negrita (**).
 * @param {string} texto - Texto plano de la plantilla
 * @returns {string} HTML formateado para almacenar en BD
 */
function convertirPlantillaAHTML(texto: string) {

    return texto
        .replace(/\n/g, "<br>")
        .replace(/\*\*/g, "");

}
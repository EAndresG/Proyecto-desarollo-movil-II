import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';

const LIBROS_BASE = [
    { titulo: 'El nombre del viento', genero: 'fantasia', paginas: 662 },
    { titulo: 'Harry Potter y la piedra filosofal', genero: 'fantasia', paginas: 309 },
    { titulo: 'Dune', genero: 'ciencia ficcion', paginas: 688 },
    { titulo: '1984', genero: 'ciencia ficcion', paginas: 328 },
    { titulo: 'El Principito', genero: 'corto', paginas: 96 },
    { titulo: 'Cien anos de soledad', genero: 'clasico', paginas: 432 },
    { titulo: 'Don Quijote de la Mancha', genero: 'clasico', paginas: 863 },
];

function detectarIntencion(texto) {
    if (/fantasia|magia|aventura|dragon|hechizo|epica/.test(texto)) return 'fantasia';
    if (/ciencia|futuro|espacio|tecnologia|distopia|ficcion/.test(texto)) return 'ciencia';
    if (/corto|rapido|poco tiempo|ligero|breve/.test(texto)) return 'corto';
    if (/clasico|historia|literatura|tradicional|canon/.test(texto)) return 'clasico';
    if (/romance|amor|pareja|emocional/.test(texto)) return 'romance';
    if (/miedo|terror|suspenso|thriller/.test(texto)) return 'suspenso';
    return 'general';
}

function generarRecomendaciones(intencion) {
    if (intencion === 'fantasia') {
        return LIBROS_BASE.filter((l) => l.genero === 'fantasia').slice(0, 2);
    }
    if (intencion === 'ciencia') {
        return LIBROS_BASE.filter((l) => l.genero === 'ciencia ficcion').slice(0, 2);
    }
    if (intencion === 'corto') {
        return LIBROS_BASE.filter((l) => l.genero === 'corto').slice(0, 1);
    }
    if (intencion === 'clasico') {
        return LIBROS_BASE.filter((l) => l.genero === 'clasico').slice(0, 2);
    }
    return [LIBROS_BASE[5], LIBROS_BASE[4]];
}

function generarRespuestaIA(textoUsuario) {
    const texto = textoUsuario.toLowerCase().trim();
    const intencion = detectarIntencion(texto);

    if (!texto) {
        return {
            respuesta: 'Escribe algo sobre lo que quieras leer y te doy una recomendacion personalizada.',
            recomendaciones: [],
        };
    }

    if (intencion === 'fantasia') {
        return {
            respuesta:
                'Te conviene fantasia de progreso: inicia con un mundo amigable y luego sube a una trama mas densa para mantener motivacion.',
            recomendaciones: generarRecomendaciones(intencion),
        };
    }

    if (intencion === 'ciencia') {
        return {
            respuesta:
                'Si quieres ciencia ficcion, alterna una lectura epica con una distopica. Asi comparas estilos sin cansarte del mismo ritmo.',
            recomendaciones: generarRecomendaciones(intencion),
        };
    }

    if (intencion === 'corto') {
        return {
            respuesta:
                'Para poco tiempo, elige lecturas de menos de 150 paginas y fija metas de 10 a 15 paginas por sesion.',
            recomendaciones: generarRecomendaciones(intencion),
        };
    }

    if (intencion === 'clasico') {
        return {
            respuesta:
                'Para clasicos, conviene leer con pausas y notas breves. Empieza por uno de complejidad media antes de un texto muy largo.',
            recomendaciones: generarRecomendaciones(intencion),
        };
    }

    if (intencion === 'romance') {
        return {
            respuesta:
                'No tengo romance en tu catalogo base todavia, pero te sugiero iniciar con historias de personajes fuertes y luego migrar a romance contemporaneo.',
            recomendaciones: generarRecomendaciones('general'),
        };
    }

    if (intencion === 'suspenso') {
        return {
            respuesta:
                'Si te gusta el suspenso, busca capitulos cortos y giros frecuentes. Es ideal para sesiones nocturnas o lectura por tramos.',
            recomendaciones: generarRecomendaciones('general'),
        };
    }

    return {
        respuesta: `Entendi que te interesa: "${textoUsuario.trim()}". Te recomiendo elegir un libro de 200 a 400 paginas para mantener el ritmo y luego subir complejidad.`,
        recomendaciones: generarRecomendaciones('general'),
    };
}

export default function AsistenteIAScreen() {
    const [entrada, setEntrada] = useState('');
    const [chat, setChat] = useState([
        {
            id: 'init-bot',
            rol: 'bot',
            texto: 'Hola, soy tu asistente IA de lectura. Cuentame que quieres leer hoy.',
        },
    ]);
    const [recomendaciones, setRecomendaciones] = useState([]);
    const scrollRef = useRef(null);

    const ejemplos = useMemo(
        () => [
            'Quiero algo de fantasia y magia',
            'Busco un libro corto para esta semana',
            'Me interesa ciencia ficcion',
        ],
        []
    );

    const manejarGenerar = () => {
        const texto = entrada.trim();
        const resultado = generarRespuestaIA(texto);

        if (!texto) {
            setChat((prev) => [
                ...prev,
                { id: `bot-${Date.now()}`, rol: 'bot', texto: resultado.respuesta },
            ]);
            setRecomendaciones([]);
            return;
        }

        setChat((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, rol: 'user', texto },
            { id: `bot-${Date.now() + 1}`, rol: 'bot', texto: resultado.respuesta },
        ]);
        setRecomendaciones(resultado.recomendaciones);
        setEntrada('');
        requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollToEnd({ animated: true });
            }
        });
    };

    return (
        <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.headerCard}>
                <Text style={styles.title}>Asistente IA de Lectura</Text>
                <Text style={styles.subtitle}>
                    Flujo tipo chatbot + recomendaciones segun tu consulta.
                </Text>
            </View>

            <View style={styles.chatCard}>
                {chat.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.bubble,
                            msg.rol === 'user' ? styles.bubbleUser : styles.bubbleBot,
                        ]}
                    >
                        <Text style={msg.rol === 'user' ? styles.bubbleUserText : styles.bubbleBotText}>
                            {msg.texto}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Tu mensaje</Text>
                <TextInput
                    value={entrada}
                    onChangeText={setEntrada}
                    placeholder="Ej: Quiero algo de fantasia"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    multiline
                />

                <TouchableOpacity style={styles.btn} onPress={manejarGenerar} activeOpacity={0.9}>
                    <Text style={styles.btnText}>Generar respuesta IA</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.examplesCard}>
                <Text style={styles.examplesTitle}>Pruebas rapidas</Text>
                {ejemplos.map((ejemplo) => (
                    <TouchableOpacity
                        key={ejemplo}
                        style={styles.chip}
                        onPress={() => {
                            const resultado = generarRespuestaIA(ejemplo);
                            setEntrada('');
                            setChat((prev) => [
                                ...prev,
                                { id: `user-${Date.now()}`, rol: 'user', texto: ejemplo },
                                { id: `bot-${Date.now() + 1}`, rol: 'bot', texto: resultado.respuesta },
                            ]);
                            setRecomendaciones(resultado.recomendaciones);
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.chipText}>{ejemplo}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {!!recomendaciones.length && (
                <View style={styles.responseCard}>
                    <Text style={styles.responseTitle}>Recomendaciones</Text>
                    {recomendaciones.map((item) => (
                        <View key={item.titulo} style={styles.recoItem}>
                            <Text style={styles.recoTitle}>{item.titulo}</Text>
                            <Text style={styles.recoMeta}>
                                {item.genero} · {item.paginas} pags.
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 28,
        backgroundColor: '#f8f9ff',
        gap: 14,
    },
    headerCard: {
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    title: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '800',
    },
    subtitle: {
        color: '#cbd5e1',
        fontSize: 13,
        marginTop: 6,
        lineHeight: 19,
    },
    chatCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    bubble: {
        maxWidth: '86%',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    bubbleUser: {
        alignSelf: 'flex-end',
        backgroundColor: '#2563eb',
    },
    bubbleBot: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f5f9',
    },
    bubbleUserText: {
        color: '#ffffff',
        fontSize: 14,
        lineHeight: 20,
    },
    bubbleBotText: {
        color: '#0f172a',
        fontSize: 14,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
        elevation: 3,
        gap: 10,
    },
    label: {
        color: '#374151',
        fontWeight: '700',
        fontSize: 13,
    },
    input: {
        minHeight: 90,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#f9fafb',
        textAlignVertical: 'top',
    },
    btn: {
        backgroundColor: '#2563eb',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    examplesCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    examplesTitle: {
        color: '#374151',
        fontWeight: '700',
        marginBottom: 2,
    },
    chip: {
        backgroundColor: '#eef2ff',
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    chipText: {
        color: '#3730a3',
        fontSize: 13,
        fontWeight: '600',
    },
    responseCard: {
        backgroundColor: '#ecfeff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#bae6fd',
        padding: 14,
    },
    responseTitle: {
        color: '#0c4a6e',
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    responseText: {
        color: '#0f172a',
        fontSize: 15,
        lineHeight: 22,
    },
    recoItem: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#dbeafe',
        marginTop: 8,
    },
    recoTitle: {
        color: '#0f172a',
        fontWeight: '700',
        fontSize: 14,
    },
    recoMeta: {
        color: '#475569',
        fontSize: 12,
        marginTop: 3,
    },
});
async function generateSystemPDF() {
    const btn = $('#generate-pdf-button');
    try {
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Generando...');

        // Obtener valores de los filtros desde los elementos UI
        const conditionValue = $('#filter-condition').val() || 'all';
        const groupValues = $('#filter-group').val() || [];
        const systemValues = $('#filter-system').val() || [];

        // Obtener texto de los filtros seleccionados para mostrar en el encabezado del PDF
        const conditionText = $('#filter-condition option:selected').text() || (conditionValue === 'all' ? 'Todos' : conditionValue);

        let groupNumbers = [];
        if (groupValues.length > 0 && !(groupValues.length === 1 && groupValues[0] === 'all')) {
            groupValues.forEach(val => {
                const text = $(`#filter-group option[value="${val}"]`).text();
                // Extrae el número usando una expresión regular
                const match = text.match(/\d+/);
                if (match) groupNumbers.push(match[0]);
            });
        }
        const selectedGroupTextForPDF = groupNumbers.length > 0 ? `${groupNumbers.join('-')}` : 'Todos';

        // Construir parámetros de consulta para obtener los datos
        const params = new URLSearchParams();
        params.append('all', 'true');

        if (conditionValue !== 'all') {
            params.append('condition', conditionValue);
        }
        groupValues.forEach(g => {
            if (g !== 'all') params.append('groups[]', g);
        });
        systemValues.forEach(s => {
            if (s !== 'all') params.append('systems[]', s);
        });

        const fetchUrl = `${listSystemUrl}?${params.toString()}`;
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, URL: ${fetchUrl}`);
        }

        const responseData = await response.json();
        let systemsData = responseData.systems;

        if (!systemsData || systemsData.length === 0) {
            Swal.fire({
                title: 'Sin resultados',
                text: 'No se encontraron sistemas con los filtros seleccionados.',
                icon: 'info'
            });
            return;
        }

        systemsData.sort((a, b) => {
            const groupA = Number(a.group);
            const groupB = Number(b.group);
            return groupA - groupB;
        });

        // Definir la fila de encabezado para la tabla con estilos específicos
        const tableHeaderRow = [
            { text: '#', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Grupo Áereo', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Sistema de Armas', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Siglas', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Condición', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'H.T.V.L', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Vida Útil', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5] },
            { text: 'Observaciones', style: 'tableHeader', alignment: 'left', margin: [0, 5, 0, 5] }
        ];

        // Mapear los datos de systemsData a las filas de la tabla, aplicando el margen deseado
        const cellMargin = [0, 5, 0, 5]; // Margen común para las celdas de datos
        const tableDataRows = systemsData.map(sys => [
            { text: sys.id || 'N/A', alignment: 'center', margin: cellMargin },
            { text: `Grupo ${sys.group}` || 'N/A', alignment: 'center', margin: cellMargin },
            { text: sys.system || 'N/A', alignment: 'center', margin: cellMargin },
            { text: sys.acronym || 'N/A', alignment: 'center', margin: cellMargin },
            { text: sys.condition || 'N/A', alignment: 'center', margin: cellMargin },
            { text: sys.status || 'N/A', alignment: 'center', margin: cellMargin }, // Corresponde a H.T.V.L
            { text: sys.utility_life || 'N/A', alignment: 'center', margin: cellMargin },
            {
                ul: sys.observations && sys.observations.length > 0
                    ? sys.observations.map(obs => {
                        let obsArr = [];
                        // Requisito en negrita
                        obsArr.push({ text: 'Requisito: ', bold: true }, { text: (obs.requirements || 'Sin requisito') + '\n' });
                        // Descripción en negrita
                        obsArr.push({ text: 'Descripción: ', bold: true }, { text: (obs.observation || 'Sin descripción') + '\n' });
                        // Tipo en negrita
                        obsArr.push({ text: 'Tipo: ', bold: true }, { text: (obs.tipo || 'Sin tipo') + '\n' });
                        // Fecha en negrita
                        obsArr.push({ text: 'Fecha de finalización: ', bold: true }, { text: (obs.end_date || '') });
                        return { text: obsArr, margin: [0, 0, 0, 5] };
                    })
                    : [{ text: 'Sin observaciones' }],
                alignment: 'left',
                margin: cellMargin
            }
        ]);

        const tableBody = [tableHeaderRow, ...tableDataRows];

        // Definir la estructura y contenido del documento PDF
        const docDefinition = {
            pageOrientation: 'landscape',
            pageSize: 'LETTER',
            content: [
                { // Imagen de Encabezado (Membrete)
                    image: letterhead,
                    width: 780,
                    // height: 100, // Altura eliminada para permitir auto-escalado basado en el ancho y aspect ratio
                    alignment: 'center',
                    margin: [0, -40, 0, 10] // Margen superior ajustado a -40
                },
                { // Sección de Título del Reporte y Filtros Seleccionados
                    columns: [
                        {
                            text: [
                                { text: "Condición: ", bold: true },
                                conditionText
                            ],
                            style: 'subheader',
                            alignment: 'left'
                        },
                        {
                            text: 'Reporte de Sistemas',
                            style: 'header',
                            alignment: 'center'
                        },
                        {
                            text: [
                                { text: "Grupos: ", bold: true },
                                selectedGroupTextForPDF
                            ],
                            style: 'subheader',
                            alignment: 'right'
                        }
                    ]
                    // Margen para el bloque de columnas eliminado para seguir el estilo de referencia
                },
                { // Tabla de Sistemas
                    table: {
                        headerRows: 1,
                        dontBreakRows: true,
                        widths: ['5%', '10%', '15%', '10%', '10%', '10%', '10%', '30%'],
                        body: tableBody
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex % 2 === 0 ? '#f3f3f3' : null;
                        }
                    }
                },
                { // Imagen de Firma
                    image: signature,
                    width: 300, // Ancho ajustado a 300
                    alignment: 'center',
                    margin: [0, 20, 0, 0] // Margen ajustado
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 10,
                    margin: [0, 0, 0, 10]
                },
            },
            defaultStyle: { // Estilo por defecto para todos los elementos de texto
                fontSize: 10
                // Margen y alineación por defecto eliminados; se manejan en celdas/elementos específicos
            }
        };

        pdfMake.createPdf(docDefinition).download(
            `Reporte_Sistemas_${new Date().toISOString().slice(0, 10)}.pdf`
        );

    } catch (error) {
        console.error('Error generando PDF:', error);
        Swal.fire({
            title: 'Error al generar PDF',
            text: `Ocurrió un error: ${error.message}. Asegúrese de que 'membrete' y 'firma' estén definidos como DataURLs.`,
            icon: 'error'
        });
    } finally {
        btn.prop('disabled', false).html('<i class="fas fa-file-pdf"></i> Generar PDF');
    }
}
// Helper para obtener el valor de condición desde el texto
function getConditionValue(text) {
    switch (text) {
        case "Disponible": return "0";
        case "Indisponible": return "1";
        case "Descartada": return "2";
        default: return "";
    }
}

// Función para obtener el texto del grupo según el valor
function getGroupText(value) {
    const groupOptions = document.querySelectorAll('#filter-group option');
    for (const option of groupOptions) {
        if (option.value === value) {
            return option.textContent.trim();
        }
    }
    return "";
}

// Función para obtener el texto del sistema según el valor
function getSystemText(value) {
    const systemOptions = document.querySelectorAll('#filter-system option');
    for (const option of systemOptions) {
        if (option.value === value) {
            return option.textContent.trim();
        }
    }
    return "";
}

// Manejar observaciones
$(document).on('click', '.view-observations-button', function () {
    const systemId = $(this).attr('data-id');

    fetch(`/system/get_observations/${systemId}/`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const container = $('#observations-container');
                container.empty();

                if (data.observations.length > 0) {
                    data.observations.forEach(obs => {
                        container.append(`
            <div class="mb-3">
                <strong>${obs.observation}</strong><br>
                <span class="text-muted"><b>Fecha de finalización:</b> ${obs.end_date}</span>
            </div>
        `);
                    });
                } else {
                    container.append('<p>No hay observaciones registradas.</p>');
                }

                $('#observations-modal').modal('show');
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Ocurrió un error al obtener las observaciones.', 'error');
        });
});
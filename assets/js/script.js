document.getElementById("convertirBtn").addEventListener("click", async () => {
    const montoCLP = document.getElementById("inputPesosCLP").value;
    const monedaSeleccionada = document.getElementById("moneda").value;
    const resultado = document.getElementById("resultado-conversion");

    if (!montoCLP || !monedaSeleccionada) {
        resultado.textContent = "Por favor, ingrese un monto y seleccione una moneda.";
        return;
    }

    try {
        const response = await fetch("https://mindicador.cl/api/");
        const data = await response.json();

        let tasaCambio;
        if (monedaSeleccionada === "dolar") {
            tasaCambio = data.dolar.valor;
        } else if (monedaSeleccionada === "euro") {
            tasaCambio = data.euro.valor;
        }

        const conversion = (montoCLP / tasaCambio).toFixed(2);
        resultado.textContent = `Resultado: $${conversion}`;

        // Obtén el historial y abre el gráfico en una nueva ventana
        const historial = await obtenerHistorial(monedaSeleccionada);
        abrirNuevaVentanaConGrafico(historial);

    } catch (error) {
        resultado.textContent = "Error al obtener los datos. Intente más tarde.";
        console.error("Error:", error);
    }
});

async function obtenerHistorial(moneda) {
    const response = await fetch(`https://mindicador.cl/api/${moneda}`);
    const data = await response.json();
    const ultimos10Dias = data.serie.slice(0, 10);
    return ultimos10Dias.reverse();
}

function abrirNuevaVentanaConGrafico(historial) {
    const nuevaVentana = window.open("", "Gráfico", "width=800,height=800");

    const etiquetas = historial.map(dia => new Date(dia.fecha).toLocaleDateString());
    const valores = historial.map(dia => dia.valor);

    nuevaVentana.document.write(`
        <html>
            <head>
                <title>Historial de Conversión</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="historialGrafico" width="700" height="700"></canvas>
                <script>
                    const ctx = document.getElementById('historialGrafico').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ${JSON.stringify(etiquetas)},
                            datasets: [{
                                label: 'Historial últimos 10 días',
                                data: ${JSON.stringify(valores)},
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                fill: false
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Fecha'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Valor'
                                    }
                                }
                            }
                        }
                    });
                </script>
            </body>
        </html>
    `);
    nuevaVentana.document.close();
}

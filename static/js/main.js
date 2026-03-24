document.addEventListener("DOMContentLoaded", () => {
    const btnResolver = document.getElementById('btn-resolver');
    const contenedorTablero = document.getElementById('tablero-contenedor');
    const alertaResultados = document.getElementById('alerta-resultados');
    const textoEstado = document.getElementById('texto-estado');
    const textoGeneraciones = document.getElementById('texto-generaciones');
    const panelGrafica = document.getElementById('panel-grafica'); // El nuevo panel
    
    // Variable para guardar la gráfica y poder borrarla si ejecutamos de nuevo
    let miGrafica = null; 

    btnResolver.addEventListener('click', async () => {
        const n_reinas = parseInt(document.getElementById('n_reinas').value);
        const tamaño_poblacion = parseInt(document.getElementById('poblacion').value);
        const tasa_mutacion = parseFloat(document.getElementById('mutacion').value);

        btnResolver.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
        btnResolver.disabled = true;
        alertaResultados.classList.add('d-none');

        try {
            const respuesta = await fetch('/api/resolver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    n_reinas: n_reinas,
                    tamaño_poblacion: tamaño_poblacion,
                    tasa_mutacion: tasa_mutacion,
                    max_generaciones: 1000
                })
            });

            const datos = await respuesta.json();

            // Alerta de Bootstrap
            alertaResultados.className = "alert mt-3 text-center"; 
            if (datos.exito) {
                alertaResultados.classList.add('alert-success');
                textoEstado.innerHTML = "✅ Solución optima encontrada";
            } else {
                alertaResultados.classList.add('alert-warning');
                textoEstado.innerHTML = "⚠️ Atascado en óptimo local";
            }
            textoGeneraciones.innerText = `Resolución en ${datos.generaciones} generaciones.`;
            alertaResultados.classList.remove('d-none');

            // Dibujar la cuadrícula
            dibujarTablero(datos.solucion, n_reinas);
            
            // Grafica nueva
            dibujarGrafica(datos.historial);

        } catch (error) {
            alert("Error al comunicarse con el motor de IA.");
            console.error(error);
        } finally {
            btnResolver.innerHTML = "🚀 Ejecutar IA";
            btnResolver.disabled = false;
        }
    });

    function dibujarTablero(vectorSolucion, n) {
        contenedorTablero.innerHTML = ''; 
        contenedorTablero.style.gridTemplateColumns = `repeat(${n}, 45px)`;
        contenedorTablero.style.gridTemplateRows = `repeat(${n}, 45px)`;

        for (let fila = 0; fila < n; fila++) {
            for (let col = 0; col < n; col++) {
                const celda = document.createElement('div');
                celda.classList.add('celda');

                if ((fila + col) % 2 === 0) {
                    celda.classList.add('blanca');
                } else {
                    celda.classList.add('negra');
                }

                if (vectorSolucion[col] === fila) {
                    const reina = document.createElement('span');
                    reina.innerText = '♛';
                    reina.classList.add('reina-animada');
                    celda.appendChild(reina);
                }

                contenedorTablero.appendChild(celda);
            }
        }
    }

    // Nueva funcion para la grafica
    function dibujarGrafica(historial) {

        panelGrafica.classList.remove('d-none');
        
        const ctx = document.getElementById('graficaConvergencia').getContext('2d');
        
        // Si ya existía una gráfica de una ejecución anterior, la destruimos para no encimarlas
        if (miGrafica) {
            miGrafica.destroy();
        }

        // Creamos un arreglo de números [1, 2, 3...] para el eje X (Las Generaciones)
        const etiquetasGeneraciones = Array.from({length: historial.length}, (_, i) => i + 1);

        miGrafica = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetasGeneraciones,
                datasets: [{
                    label: 'Conflictos (Fitness - meta: 0)',
                    data: historial,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.1 
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: 'Generaciones', color: '#adb5bd' },
                        ticks: { color: '#adb5bd' },
                        grid: { color: '#343a40' }
                    },
                    y: {
                        title: { display: true, text: 'Número de Conflictos', color: '#adb5bd' },
                        ticks: { color: '#adb5bd' },
                        grid: { color: '#343a40' },
                        min: 0 
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f8f9fa' } }
                }
            }
        });
    }
});
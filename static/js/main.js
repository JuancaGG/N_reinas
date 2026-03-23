document.addEventListener("DOMContentLoaded", () => {
    const btnResolver = document.getElementById('btn-resolver');
    const contenedorTablero = document.getElementById('tablero-contenedor');
    const alertaResultados = document.getElementById('alerta-resultados');
    const textoEstado = document.getElementById('texto-estado');
    const textoGeneraciones = document.getElementById('texto-generaciones');

    btnResolver.addEventListener('click', async () => {
        const n_reinas = parseInt(document.getElementById('n_reinas').value);
        const tamaño_poblacion = parseInt(document.getElementById('poblacion').value);
        const tasa_mutacion = parseFloat(document.getElementById('mutacion').value);

        btnResolver.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
        btnResolver.disabled = true;
        alertaResultados.classList.add('d-none'); // Ocultar alerta vieja

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

            // Configurar alerta de Bootstrap según el resultado
            alertaResultados.className = "alert mt-3 text-center"; // Resetear clases
            if (datos.exito) {
                alertaResultados.classList.add('alert-success');
                textoEstado.innerHTML = "✅ Solución Óptima Encontrada";
            } else {
                alertaResultados.classList.add('alert-warning');
                textoEstado.innerHTML = "⚠️ Atascado en óptimo local";
            }
            
            textoGeneraciones.innerText = `Resolución en ${datos.generaciones} generaciones.`;
            alertaResultados.classList.remove('d-none');

            // Dibujar la cuadrícula de forma estricta
            dibujarTablero(datos.solucion, n_reinas);

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
        
        // ¡ESTO ES CLAVE PARA EL ERROR VISUAL!
        // Le dice a CSS explícitamente cuántas columnas dibujar antes de pasar a la siguiente fila
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

                // Colocamos la reina si la fila coincide con el valor del vector en esa columna
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
});
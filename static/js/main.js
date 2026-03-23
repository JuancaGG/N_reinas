document.addEventListener("DOMContentLoaded", () => {
    const btnResolver = document.getElementById('btn-resolver');
    const contenedorTablero = document.getElementById('tablero-contenedor');
    const cajaResultados = document.getElementById('caja-resultados');
    const textoEstado = document.getElementById('texto-estado');
    const textoGeneraciones = document.getElementById('texto-generaciones');

    btnResolver.addEventListener('click', async () => {
        // 1. Recoger los valores del usuario
        const n_reinas = parseInt(document.getElementById('n_reinas').value);
        const tamaño_poblacion = parseInt(document.getElementById('poblacion').value);
        const tasa_mutacion = parseFloat(document.getElementById('mutacion').value);

        // Cambiar el texto del botón mientras piensa
        btnResolver.innerText = "⏳ Evolucionando...";
        btnResolver.disabled = true;

        try {
            // 2. Hacer la petición al backend (Flask)
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

            // 3. Mostrar Resultados
            cajaResultados.classList.remove('oculto');
            if (datos.exito) {
                textoEstado.innerHTML = "✅ <b>¡Solución Óptima Encontrada!</b>";
                textoEstado.style.color = "#2ecc71";
            } else {
                textoEstado.innerHTML = "⚠️ <b>Atascado en óptimo local.</b>";
                textoEstado.style.color = "#e74c3c";
            }
            textoGeneraciones.innerText = `Generaciones: ${datos.generaciones}`;

            // 4. ¡Dibujar el tablero!
            dibujarTablero(datos.solucion, n_reinas);

        } catch (error) {
            alert("Error al comunicarse con el servidor.");
            console.error(error);
        } finally {
            // Restaurar botón
            btnResolver.innerText = "🚀 Resolver con IA";
            btnResolver.disabled = false;
        }
    });

    // Función que pinta las celdas y las reinas basándose en tu vector
    function dibujarTablero(vectorSolucion, n) {
        contenedorTablero.innerHTML = ''; // Limpiar tablero anterior
        // Le decimos a CSS cuántas columnas usar
        contenedorTablero.style.gridTemplateColumns = `repeat(${n}, 50px)`;

        // Crear las celdas
        for (let fila = 0; fila < n; fila++) {
            for (let col = 0; col < n; col++) {
                const celda = document.createElement('div');
                celda.classList.add('celda');

                // Alternar colores del tablero
                if ((fila + col) % 2 === 0) {
                    celda.classList.add('blanca');
                } else {
                    celda.classList.add('negra');
                }

                // Si en esta columna, el valor del vector indica esta fila, pintamos reina
                if (vectorSolucion[col] === fila) {
                    celda.innerText = '♛';
                }

                contenedorTablero.appendChild(celda);
            }
        }
    }
});
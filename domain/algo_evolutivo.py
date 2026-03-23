# Capa logica 
import random

class AlgoritmoEvolutivoNReinas:
    def __init__(self, n_reinas, tamaño_poblacion, tasa_mutacion, max_generaciones=1000):
        """
        Constructor del motor evolutivo
        Recibe los parametros que el usuario elegira desde la pagina web.
        """
        self.N = n_reinas
        self.tamaño_poblacion = tamaño_poblacion
        self.tasa_mutacion = tasa_mutacion
        self.max_generaciones = max_generaciones

    def crear_individuo(self):
        """
        Crea un individuo (tablero)
        Se representa como un vector de tamaño N, donde el índice es la columna y el valor es la fila.
        Ejemplo para N=4: [1, 3, 0, 2]
        """
# random.sample crea una lista del 0 al N-1 sin repetir numeros.
# Garantizamos que nunca haya dos reinas en la misma fila ni columna.
        return random.sample(range(self.N),self.N)

    def inicializar_poblacion(self):
        """
        Crea la población inicial generando 'n' individuos aleatorios.
        """
        población = []
        for _ in range(self.tamaño_poblacion):
            población.append(self.crear_individuo())
        return población

    def calcular_aptitud(self, individuo):
        """
        Función fitness: Cuantifica cuántos pares de reinas están en conflicto.
        La meta minimizar estos conflictos hasta llegar a 0.
        """
        conflictos = 0
        for i in range(self.N):
            for j in range(i + 1, self.N):
                # Verificamos si estan en la misma fila (mismo numero)
                if individuo[i] == individuo[j]:
                    conflictos += 1
                # Verificamos si estan en la misma diagonal
                elif abs(i- j) == abs(individuo[i] - individuo[j]):
                    conflictos += 1
        return conflictos

        # Comparamos cada reina con todas las demas que estan a su derrecha 
        #for i in range(self.N):
            #for j in range(i + 1, self.N):
                # Solo revisamos si estan en la misma diagonal.
                # Una diagonal ocurre si la distancia en 'x' (columnas) es igual a la distancia en 'y' (filas).
                #distancia_columnas = abs(i - j)
                #distancia_filas = abs(individuo[i] - individuo[j])

                #if distancia_columnas == distancia_filas:
                    #conflictos += 1
        #return conflictos
        
    
    def seleccion_torneo(self, poblacion, k=3):
        """ 
        Tomamos 'k' individuos al azar y elegimos el que menos conflictos tenga.
        """
        seleccionados = random.sample(poblacion, k)
        # Ordenamos de menor a mayor 
        seleccionados.sort(key=self.calcular_aptitud)
        return seleccionados[0]
    
    def cruce(self, padre1, padre2):
        """
        Cruza dos padres para crear dos hijos usando un punto de corte aleatorio. 
        """
        punto_corte = random.randint(1, self.N - 2)
        hijo1 = padre1[:punto_corte] + padre2[punto_corte:]
        hijo2 = padre2[:punto_corte] + padre1[punto_corte:]
        return hijo1, hijo2
    
    def mutacion(self, individuo):
        """
        Mutacion swap (intercambio)
        Si un numero aleatorio cae dentro de la tasa de mutacion, intercambiamos las posiciones de dos reinas.
        Esto mantiene que no haya reinas en la misma fila.  
        """
        if random.random() < self.tasa_mutacion:
            idx1, idx2 = random.sample(range(self.N), 2)
            # Intercambiamos los valores en esas dos posiciones
            individuo[idx1], individuo[idx2] = individuo[idx2], individuo[idx1]
        return individuo
    
    def ejecutar(self):
        """
        Entrenamiento del modelo
        Retornara la mejor solucion y un historial para poder graficar 
        """
        poblacion = self.inicializar_poblacion()
        historial_fitness = []
        
        for generacion in range(self.max_generaciones):
            # Evaluar toda la poblacion y ordenarla
            poblacion.sort(key=self.calcular_aptitud)
            mejor_individuo = poblacion[0]
            mejor_fitness = self.calcular_aptitud(mejor_individuo)
            
            # Guardamos datos para futuras graficas
            historial_fitness.append(mejor_fitness)
            
            if mejor_fitness == 0:
                return {
                    "solucion": mejor_individuo,
                    "generaciones": generacion,
                    "exito": True,
                    "historial": historial_fitness
                }
                
            # Nueva generacion
            nueva_poblacion = []
            # Conservamos al mejor de la generación anterior (Elitismo, ayuda a no perder el progreso)
            nueva_poblacion.append(mejor_individuo)
            # Resto de la poblacion
            while len(nueva_poblacion) < self.tamaño_poblacion:
                padre1 = self.seleccion_torneo(poblacion)
                padre2 = self.seleccion_torneo(poblacion)
                
                hijo1, hijo2 = self.cruce(padre1,padre2)
                
                hijo1 = self.mutacion(hijo1)
                hijo2 = self.mutacion(hijo2)
                
                nueva_poblacion.extend([hijo1, hijo2])
                # Aseguramos que la población no se pase del tamaño exacto y reemplazamos
            poblacion = nueva_poblacion[:self.tamaño_poblacion]
                
        # Se acabaron la generaciones y no llego a 0
        poblacion.sort(key=self.calcular_aptitud)
        return {
            "solucion": poblacion[0],
            "generaciones": self.max_generaciones,
            "exito": False,
            "historial": historial_fitness
        }
        
# --- BLOQUE DE PRUEBA ---
# Este bloque solo se ejecutará si corres este archivo directamente.
if __name__ == "__main__":
    # 1. Definimos los parámetros de prueba (ej. Tablero clásico de 8x8)
    n_reinas = 8
    poblacion = 100
    mutacion = 0.1
    generaciones = 1000

    print(f"Iniciando evolución para un tablero de {n_reinas}x{n_reinas}...")

    # 2. Instanciamos nuestro motor evolutivo
    motor = AlgoritmoEvolutivoNReinas(
        n_reinas=n_reinas, 
        tamaño_poblacion=poblacion, 
        tasa_mutacion=mutacion, 
        max_generaciones=generaciones
    )

    # 3. Lo ponemos a ejecutar
    resultado = motor.ejecutar()

    # 4. Mostramos los resultados en la consola
    print("\n--- RESULTADOS ---")
    if resultado["exito"]:
        print(f"✅ ¡Solución perfecta encontrada!")
        print(f"Generaciones necesarias: {resultado['generaciones']}")
        print(f"Vector solución: {resultado['solucion']}")
        # Comprobamos que el fitness sea realmente 0
        fitness_final = motor.calcular_aptitud(resultado['solucion'])
        print(f"Conflictos (Fitness): {fitness_final}")
    else:
        print(f"❌ No se encontró la solución óptima en {generaciones} generaciones.")
        print(f"Mejor vector encontrado: {resultado['solucion']}")
        fitness_final = motor.calcular_aptitud(resultado['solucion'])
        print(f"Conflictos restantes (Fitness): {fitness_final}")
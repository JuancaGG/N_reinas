from flask import Flask, render_template, request, jsonify
from domain.algo_evolutivo import AlgoritmoEvolutivoNReinas

app = Flask(__name__)

# Ruta principal
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint
@app.route('/api/resolver', methods = ['POST'])
def resolver_n_reinas():
    try:
        datos = request.json
        n_reinas = int(datos.get('n_reinas', 8))
        tamaño_poblacion = int(datos.get('tamaño_poblacion', 100))
        tasa_mutacion = float(datos.get('tasa_mutacion', 0.1))
        max_generaciones = int(datos.get('max_generacioens', 1000))
        
        motor = AlgoritmoEvolutivoNReinas(
            n_reinas = n_reinas,
            tamaño_poblacion = tamaño_poblacion,
            tasa_mutacion = tasa_mutacion,
            max_generaciones = max_generaciones
        )   
        
        resultado = motor.ejecutar()
        
        # Devolvemos respuesta estructurada al navegador
        return jsonify({
            'exito': resultado['exito'],
            'solucion': resultado['solucion'],
            'generaciones': resultado['generaciones'],
            'historial': resultado['historial']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# Arranque del servidor
if __name__ == '__main__':
    app.run(debug=True)
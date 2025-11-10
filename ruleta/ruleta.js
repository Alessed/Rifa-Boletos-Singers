document.addEventListener('DOMContentLoaded', () => {
    const ruletaBase = document.getElementById('ruleta-base');
    const numeroDisplay = document.getElementById('numero-display');
    const girarBtn = document.getElementById('girar-btn');
    const continuarBtn = document.getElementById('continuar-btn');
    const resultadoDisplay = document.getElementById('resultado-display');
    const premioActualDisplay = document.getElementById('premio-actual');
    
    // Configuración de la Rifa (MODIFICADO: Solo 2 premios/lugares)
    const PREMIOS = [
        "Primer Lugar (Horno, Lámpara y Vino)", // Incluye el 1er y 2do premio original + vino
        "Segundo Lugar (Bocina, Aspiradora y Vino)" // Incluye el 3er y 4to premio original + vino
    ];
    
    let numerosDisponibles = [];
    let premioActualIndex = 0;
    const GIRO_BASE = 3600; // 10 vueltas para animación del círculo

    // Funciones de Control
    // ---------------------------------------------------------------
    
    function actualizarPremios() {
        // MODIFICADO: La condición de finalización se basa en los 2 elementos de PREMIOS
        if (premioActualIndex < PREMIOS.length) {
            premioActualDisplay.textContent = `Premio Actual: ${PREMIOS[premioActualIndex]}`;
            girarBtn.textContent = `Girar para el ${PREMIOS[premioActualIndex]}`;
            girarBtn.style.display = 'block';
            continuarBtn.style.display = 'none';
            girarBtn.disabled = false;
            resultadoDisplay.textContent = 'Esperando ganador...';
            numeroDisplay.textContent = 'Listo';

        } else {
            // Sorteo Finalizado después del 2do giro
            premioActualDisplay.textContent = "¡Sorteo Finalizado!";
            girarBtn.style.display = 'none';
            continuarBtn.style.display = 'none';
            // El mensaje de finalización ahora usa la cantidad real de premios (2)
            resultadoDisplay.innerHTML = `¡Los ${PREMIOS.length} premios han sido sorteados! 🎉`; 
            alert("¡Sorteo Finalizado! Se han entregado los dos premios.");
        }
    }

    function animarBusqueda(duracionMs) {
        // Intervalo para cambiar rápidamente los números en el centro
        const inicio = Date.now();
        const intervalId = setInterval(() => {
            if (Date.now() - inicio < duracionMs) {
                // Muestra un número aleatorio de los disponibles
                const randIndex = Math.floor(Math.random() * numerosDisponibles.length);
                numeroDisplay.textContent = numerosDisponibles[randIndex];
            } else {
                clearInterval(intervalId);
            }
        }, 50); // Cambia cada 50ms

        return intervalId;
    }

    // 1. Cargar datos del JSON
    // Se mantiene la ruta relativa que habías definido
    fetch('/Rifa-Boletos-Singers/data.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}. Verifique la ruta '../data.json'`);
            }
            return response.json();
        })
        .then(data => {
            // Accedemos a la propiedad 'occupied'
            if (!Array.isArray(data.occupied) || data.occupied.length === 0) {
                resultadoDisplay.textContent = "Error: No hay números vendidos en 'occupied'.";
                girarBtn.disabled = true;
                return;
            }
            
            // Convertimos todos los números a String
            numerosDisponibles = data.occupied.map(String);
            
            actualizarPremios(); // Inicializa la vista con el primer premio
        })
        .catch(error => {
            console.error('Error al cargar los números:', error);
            resultadoDisplay.textContent = `Error al cargar números: ${error.message}`;
            girarBtn.disabled = true;
        });

    // 2. Lógica principal del Sorteo
    function sortearGanador() {
        if (premioActualIndex >= PREMIOS.length) return; // Ya terminó el sorteo
        if (numerosDisponibles.length === 0) {
            resultadoDisplay.textContent = "No quedan números disponibles para sortear.";
            girarBtn.disabled = true;
            return;
        }

        // Deshabilitar botones
        girarBtn.disabled = true;
        continuarBtn.style.display = 'none';
        resultadoDisplay.textContent = "¡Buscando al ganador...";
        
        // Selecciona un ganador
        const indiceGanador = Math.floor(Math.random() * numerosDisponibles.length);
        const numeroGanador = numerosDisponibles[indiceGanador];
        
        // 3. Animaciones
        
        // A. Animación de "Búsqueda" de números
        const duracionAnimacionMs = 4500; // 4.5 segundos
        const animacionId = animarBusqueda(duracionAnimacionMs);
        
        // B. Animación de giro del círculo
        const giroExtra = Math.floor(Math.random() * 360);
        const anguloGiro = GIRO_BASE + giroExtra;
        ruletaBase.style.transition = 'transform 5s ease-out';
        ruletaBase.style.transform = `rotate(${anguloGiro}deg)`;

        // 4. Mostrar Resultado
        setTimeout(() => {
            clearInterval(animacionId); // Detiene la animación de búsqueda
            
            // Limpiamos la transición del círculo para el siguiente sorteo
            ruletaBase.style.transition = 'none';
            ruletaBase.style.transform = `rotate(${giroExtra}deg)`;

            // Mostrar el número ganador
            numeroDisplay.textContent = numeroGanador;
            
            // MODIFICADO: El mensaje usa la nueva leyenda del premio/lugar
            resultadoDisplay.innerHTML = `¡GANADOR del ${PREMIOS[premioActualIndex]}: <span style="color:#3a2b1f; font-size:1.2em;">${numeroGanador}</span>! 🎉`;
            
            // 5. Eliminar el número de la lista para que no se repita
            numerosDisponibles.splice(indiceGanador, 1);
            
            // Habilitar el botón de continuar
            continuarBtn.style.display = 'block';

        }, 5000); // 5000ms debe ser mayor que la duración de la animación (4500ms)
    }

    // Event Listeners
    girarBtn.addEventListener('click', sortearGanador);

    continuarBtn.addEventListener('click', () => {
        premioActualIndex++; // Pasa al siguiente premio (Lugar)
        actualizarPremios(); // Carga la interfaz para el siguiente sorteo
        
        // Resetear la ruleta visualmente para el nuevo sorteo
        ruletaBase.style.transform = 'rotate(0deg)';
    });

    // Inicialización de la ruleta antes de cargar los datos
    girarBtn.textContent = 'Cargando Números...';
    girarBtn.disabled = true;
});
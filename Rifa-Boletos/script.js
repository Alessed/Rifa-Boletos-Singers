// script.js
document.addEventListener('DOMContentLoaded', function() {
    const TOTAL_BOLETOS = 400; // ¡Cambiado de 120 a 400!
    
    // Función de ayuda para cargar datos y actualizar la vista
    function loadAndRenderTickets() {
        fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar data.json');
                }
                return response.json();
            })
            .then(data => {
                const grid = document.getElementById('tickets-grid');
                grid.innerHTML = '';
                
                let disponibles = TOTAL_BOLETOS;
                
                for (let i = 1; i <= TOTAL_BOLETOS; i++) {
                    const ticket = document.createElement('div');
                    let classList = 'ticket text-sm border-2'; 
                    
                    if (data.occupied.includes(i)) {
                        // Vendido/Apartado (Gris)
                        classList += ' occupied';
                        disponibles--;
                    } else {
                        // Disponible (Blanco/Naranja)
                        classList += ' available';
                    }

                    ticket.className = classList;
                    
                    // Formatear el número con 3 dígitos
                    ticket.textContent = i.toString().padStart(3, '0');
                    grid.appendChild(ticket);
                }
                
                // Actualizar contadores y total
                document.getElementById('available-count').textContent = disponibles;
                document.getElementById('occupied-count').textContent = TOTAL_BOLETOS - disponibles;
                document.getElementById('total-tickets').textContent = TOTAL_BOLETOS;

                // Actualizar fecha
                updateLastUpdated(data.lastUpdated);
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById('tickets-grid').innerHTML = 
                    '<div class="col-span-10 text-center text-red-500 p-4">Error cargando los boletos. Asegúrate de que existe un archivo data.json válido.</div>';
            });
    }

    // Función para actualizar la fecha (simplificada para solo el formato de fecha)
    function updateLastUpdated(dateString) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formattedDate = new Date(dateString).toLocaleString('es-ES', options);
        document.getElementById('last-update').textContent = formattedDate;
    }

    loadAndRenderTickets();
});
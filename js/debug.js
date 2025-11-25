// DEBUG TEMPORAL - Eliminar después de solucionar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: Iniciando verificación de elementos...');
    
    // Verificar que los elementos existen
    const startBtn = document.getElementById('startBtn');
    const splashScreen = document.getElementById('splash-screen');
    const loadingContent = document.getElementById('loadingContent');
    
    console.log('startBtn:', startBtn);
    console.log('splashScreen:', splashScreen);
    console.log('loadingContent:', loadingContent);
    
    // Verificar estilos que podrían bloquear clicks
    if (startBtn) {
        console.log('startBtn styles:', {
            display: startBtn.style.display,
            visibility: startBtn.style.visibility,
            opacity: startBtn.style.opacity,
            pointerEvents: startBtn.style.pointerEvents,
            position: startBtn.style.position,
            zIndex: startBtn.style.zIndex
        });
    }
    
    // Añadir evento de clic a TODO el documento para debug
    document.addEventListener('click', function(e) {
        console.log('🖱️ Click detectado en:', e.target);
        console.log('Coordenadas:', e.clientX, e.clientY);
    });
    
    // Verificar específicamente el botón START
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            console.log('🎯 CLICK EN START BTN DETECTADO!');
            e.stopPropagation();
        });
        
        startBtn.addEventListener('mousedown', function() {
            console.log('🖱️ Mouse DOWN en START btn');
        });
        
        startBtn.addEventListener('mouseup', function() {
            console.log('🖱️ Mouse UP en START btn');
        });
    }
    
    console.log('✅ Debug configurado. Ahora haz clic en el botón START...');
});

=== ARCHIVOS DE SONIDO PARA ARCADE AUCTION ===

La aplicación incluye por defecto un SINTETIZADOR 8-BIT en tiempo real (Web Audio API)
que genera los efectos de sonido automáticamente sin necesidad de archivos externos.

Si deseas utilizar tus propios efectos de sonido en formato MP3 o WAV, simplemente
colócalos en esta carpeta (`public/sounds/`) con los siguientes nombres:

1. coin.mp3        -> Sonido al pujar (+1 moneda)
2. roulette.mp3    -> Sonido continuo durante la ruleta o sorteo
3. countdown.mp3   -> Sonido del tic-tac del cronómetro (últimos 5 segundos)
4. win.mp3         -> Sonido de victoria cuando un jugador gana el personaje
5. discard.mp3     -> Sonido cuando el personaje es desechado (tiempo agotado sin pujas)
6. ready.mp3       -> Sonido cuando un jugador presiona "Listo"
7. gacha_reveal.mp3-> Sonido de revelación al salir una carta de alta rareza (UR / LR)
8. click.mp3       -> Sonido de botón general

El sistema detectará automáticamente si existen estos archivos; si no están presentes,
reproducirá los efectos de audio sintetizados retroarcade de alta fidelidad.

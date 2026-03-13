export type Locale = "en" | "es";

const translations = {
  en: {
    // Home
    "home.title": "Adivinamon",
    "home.subtitle": "Guess Who? — Anime Edition",
    "home.createRoom": "Create Room",
    "home.joinRoom": "Join Room",
    "home.yourName": "Your Name",
    "home.roomCode": "Room Code",
    "home.namePlaceholder": "Enter your name",
    "home.codePlaceholder": "Enter 5-character code",
    "home.creating": "Creating...",
    "home.joining": "Joining...",

    // Lobby
    "lobby.room": "Room",
    "lobby.copyCode": "Copy Code",
    "lobby.players": "Players",
    "lobby.spectators": "Spectators",
    "lobby.waitingOpponent": "Waiting for opponent...",
    "lobby.gameSettings": "Game Settings",
    "lobby.characterSource": "Character Source",
    "lobby.templates": "Templates",
    "lobby.searchAnime": "Search Anime",
    "lobby.pokemon": "Pokemon",
    "lobby.genderFilter": "Gender Filter",
    "lobby.genderAll": "All",
    "lobby.genderMale": "Male",
    "lobby.genderFemale": "Female",
    "lobby.poolSize": "{count} unique characters available ({grid} randomly picked per game)",
    "lobby.needMore": "— need at least {grid}, select more {type}",
    "lobby.generations": "generations",
    "lobby.packs": "packs",
    "lobby.searchAllPokemon": "Search any Pokémon during gameplay.",
    "lobby.spectating": "You are spectating this game.",
    "lobby.startGame": "Start Game",
    "lobby.starting": "Starting...",
    "lobby.needCharacters": "Need {grid}+ characters",
    "lobby.selectAnime": "Select an anime first",
    "lobby.selectGenerations": "Select generations first",
    "lobby.selectTemplates": "Select templates first",
    "lobby.waitingHost": "Waiting for host to start the game...",

    // Mode picker
    "mode.classic": "Classic",
    "mode.ruleMaster": "Rule Master",
    "mode.gameMode": "Game Mode",
    "mode.classicDesc": "Guess your opponent's character",
    "mode.ruleMasterDesc": "Guess your opponent's secret rule",

    // Generation picker
    "gen.title": "Generations (select one or more)",
    "gen.selectAll": "Select All",
    "gen.deselectAll": "Deselect All",

    // Template picker
    "template.title": "Character Packs (select one or more)",
    "template.selectAll": "Select All",
    "template.deselectAll": "Deselect All",

    // Selection phase
    "selection.pickCharacter": "Pick Your Character",
    "selection.random": "Random",
    "selection.lockIn": "Lock In",
    "selection.lockedIn": "You're locked in! Waiting for opponent...",
    "selection.enterRule": "Enter a rule for your opponent...",
    "selection.tipsTitle": "Tips for good rules:",
    "selection.tip1": "Be specific enough that your opponent can guess it",
    "selection.tip2": "Make sure multiple characters can match (not just one)",
    "selection.tip3": "Base it on visible traits, story roles, or well-known facts",
    "selection.examples": 'Examples: "Has blue hair", "Is a villain", "Uses a sword", "Female character", "From a shonen anime"',
    "selection.spectatorWaiting": "Players are making their selections...",

    // Game board
    "board.filter": "Filter characters...",
    "board.remaining": "{remaining}/{total} remaining",

    // Guess dialog
    "guess.makeGuess": "Make Final Guess",
    "guess.guessRule": "Guess the Rule",
    "guess.waitingJudgment": "Waiting for judgment...",
    "guess.confirmTitle": "Confirm your guess",
    "guess.whichCharacter": "Which character did they pick?",
    "guess.whatRule": "What rule did your opponent set for you?",
    "guess.areYouSure": "Are you sure this is their pick?",
    "guess.goBack": "Go Back",
    "guess.confirmGuess": "Confirm Guess",
    "guess.guessing": "Guessing...",
    "guess.ruleHint": "Based on the characters your opponent approved/rejected, guess what rule they set for you. Your opponent will judge if your guess is correct.",
    "guess.rulePlaceholder": 'e.g. "Has blue hair", "Female character"...',
    "guess.submitGuess": "Submit Guess",
    "guess.submitting": "Submitting...",

    // Playing - Classic
    "classic.opponentLeft": "Opponent has {count} left!",

    // Playing - Rule Master
    "ruleMaster.waitingJudge": "Waiting for opponent to judge your guess...",
    "ruleMaster.judgeGuess": "Judge your opponent's rule guess!",
    "ruleMaster.waitingAnswer": "Waiting for opponent's answer...",
    "ruleMaster.yourTurn": "Your turn - search for a character!",
    "ruleMaster.opponentTurn": "Opponent's turn...",
    "ruleMaster.searchCharacter": "Search for a character...",
    "ruleMaster.ask": "Ask",
    "ruleMaster.asking": "Asking...",

    // Answer prompt
    "answer.asks": "{name} asks:",
    "answer.doesFit": '"Does {name} fit?"',
    "answer.yourRule": "Your rule:",
    "answer.doesCharacterFit": "— does this character fit?",
    "answer.yes": "Yes",
    "answer.no": "No",

    // Rule guess prompt
    "ruleGuess.guessing": "{name} is guessing your rule!",
    "ruleGuess.yourRule": "Your rule:",
    "ruleGuess.theirGuess": "Their guess:",
    "ruleGuess.closeEnough": "Is this guess close enough to your rule?",
    "ruleGuess.correct": "Correct",
    "ruleGuess.wrong": "Wrong",

    // Rule Master Board
    "rmBoard.yourBoard": "Your Board",
    "rmBoard.noCharacters": "No characters asked yet.",
    "rmBoard.quickHistory": "Quick history ({count} asked)",
    "rmBoard.valid": "valid",
    "rmBoard.invalid": "invalid",

    // Game over
    "gameOver.youWin": "You Win!",
    "gameOver.youLose": "You Lose!",
    "gameOver.guessedCorrectly": "{name} guessed correctly.",
    "gameOver.guessedIncorrectly": "{name} guessed incorrectly.",
    "gameOver.answerWas": "The answer was {answer}.",
    "gameOver.ruleWas": 'The rule {name} set was "{rule}".',
    "gameOver.rematch": "Rematch",
    "gameOver.requesting": "Requesting...",
    "gameOver.reset": "reset",

    // Room header
    "header.resetBoard": "Reset Board",
    "header.backToLobby": "Back to Lobby",
    "header.cancelling": "Cancelling...",
    "header.leaveRoom": "Leave Room",
    "header.watching": "{count} watching",
    "header.confirmCancel": "This will end the current game and return both players to the lobby. Continue?",
    "header.confirmLeave": "You'll leave the room and lose your current game. Continue?",

    // Player info badge
    "player.yourPick": "Your pick",
    "player.yourRule": "Rule you set:",

    // Spectator
    "spectator.badge": "Spectating",

    // Toasts
    "toast.joined": "{name} joined the room!",
    "toast.joinedSpectator": "{name} joined as spectator!",
    "toast.lockedIn": "Opponent has locked in!",
    "toast.gameOn": "Both players locked in! Game on!",
    "toast.cancelled": "Host cancelled the game. Back to lobby.",
    "toast.asks": '{name} asks: "Does {character} fit?"',
    "toast.answeredYes": "{name} says Yes! ({character})",
    "toast.answeredNo": "{name} says No! ({character})",
    "toast.guessingRule": '{name} is guessing your rule: "{guess}"',
    "toast.wrongRuleGuess": 'Wrong guess! "{guess}" is not the rule.',
    "toast.wrongGuess": "Wrong guess! Game continues.",
    "toast.opponentWrongGuess": "{name} guessed wrong! Game continues.",
    "toast.opponentRemaining": "Opponent is down to {count} character{s}!",
    "toast.wantsRematch": "Opponent wants a rematch!",
    "toast.rematchAccepted": "Rematch accepted! Back to lobby.",
    "toast.playerLeft": "{name} left the room.",
  },
  es: {
    // Home
    "home.title": "Adivinamon",
    "home.subtitle": "¿Quién es quién? — Edición Anime",
    "home.createRoom": "Crear Sala",
    "home.joinRoom": "Unirse a Sala",
    "home.yourName": "Tu Nombre",
    "home.roomCode": "Código de Sala",
    "home.namePlaceholder": "Ingresa tu nombre",
    "home.codePlaceholder": "Ingresa código de 5 caracteres",
    "home.creating": "Creando...",
    "home.joining": "Uniéndose...",

    // Lobby
    "lobby.room": "Sala",
    "lobby.copyCode": "Copiar Código",
    "lobby.players": "Jugadores",
    "lobby.spectators": "Espectadores",
    "lobby.waitingOpponent": "Esperando oponente...",
    "lobby.gameSettings": "Configuración",
    "lobby.characterSource": "Fuente de Personajes",
    "lobby.templates": "Plantillas",
    "lobby.searchAnime": "Buscar Anime",
    "lobby.pokemon": "Pokemon",
    "lobby.genderFilter": "Filtro de Género",
    "lobby.genderAll": "Todos",
    "lobby.genderMale": "Masculino",
    "lobby.genderFemale": "Femenino",
    "lobby.poolSize": "{count} personajes disponibles ({grid} elegidos al azar por partida)",
    "lobby.needMore": "— se necesitan al menos {grid}, selecciona más {type}",
    "lobby.generations": "generaciones",
    "lobby.packs": "paquetes",
    "lobby.searchAllPokemon": "Busca cualquier Pokémon durante la partida.",
    "lobby.spectating": "Estás viendo esta partida.",
    "lobby.startGame": "Iniciar Partida",
    "lobby.starting": "Iniciando...",
    "lobby.needCharacters": "Necesitas {grid}+ personajes",
    "lobby.selectAnime": "Selecciona un anime primero",
    "lobby.selectGenerations": "Selecciona generaciones primero",
    "lobby.selectTemplates": "Selecciona plantillas primero",
    "lobby.waitingHost": "Esperando a que el anfitrión inicie la partida...",

    // Mode picker
    "mode.classic": "Clásico",
    "mode.ruleMaster": "Maestro de Reglas",
    "mode.gameMode": "Modo de Juego",
    "mode.classicDesc": "Adivina el personaje de tu oponente",
    "mode.ruleMasterDesc": "Adivina la regla secreta de tu oponente",

    // Generation picker
    "gen.title": "Generaciones (selecciona una o más)",
    "gen.selectAll": "Seleccionar Todo",
    "gen.deselectAll": "Deseleccionar Todo",

    // Template picker
    "template.title": "Paquetes de Personajes (selecciona uno o más)",
    "template.selectAll": "Seleccionar Todo",
    "template.deselectAll": "Deseleccionar Todo",

    // Selection phase
    "selection.pickCharacter": "Elige Tu Personaje",
    "selection.random": "Aleatorio",
    "selection.lockIn": "Confirmar",
    "selection.lockedIn": "¡Confirmado! Esperando al oponente...",
    "selection.enterRule": "Escribe una regla para tu oponente...",
    "selection.tipsTitle": "Consejos para buenas reglas:",
    "selection.tip1": "Sé lo suficientemente específico para que tu oponente pueda adivinarla",
    "selection.tip2": "Asegúrate de que varios personajes coincidan (no solo uno)",
    "selection.tip3": "Basar en rasgos visibles, roles en la historia o datos conocidos",
    "selection.examples": 'Ejemplos: "Tiene pelo azul", "Es un villano", "Usa espada", "Personaje femenino", "De un anime shonen"',
    "selection.spectatorWaiting": "Los jugadores están haciendo sus selecciones...",

    // Game board
    "board.filter": "Filtrar personajes...",
    "board.remaining": "{remaining}/{total} restantes",

    // Guess dialog
    "guess.makeGuess": "Adivinar",
    "guess.guessRule": "Adivinar la Regla",
    "guess.waitingJudgment": "Esperando veredicto...",
    "guess.confirmTitle": "Confirma tu respuesta",
    "guess.whichCharacter": "¿Qué personaje eligió?",
    "guess.whatRule": "¿Qué regla puso tu oponente?",
    "guess.areYouSure": "¿Estás seguro de que es este?",
    "guess.goBack": "Volver",
    "guess.confirmGuess": "Confirmar",
    "guess.guessing": "Adivinando...",
    "guess.ruleHint": "Basándote en los personajes que tu oponente aprobó/rechazó, adivina qué regla estableció. Tu oponente juzgará si tu respuesta es correcta.",
    "guess.rulePlaceholder": 'ej. "Tiene pelo azul", "Personaje femenino"...',
    "guess.submitGuess": "Enviar Respuesta",
    "guess.submitting": "Enviando...",

    // Playing - Classic
    "classic.opponentLeft": "¡Al oponente le quedan {count}!",

    // Playing - Rule Master
    "ruleMaster.waitingJudge": "Esperando que el oponente juzgue tu respuesta...",
    "ruleMaster.judgeGuess": "¡Juzga la respuesta de tu oponente!",
    "ruleMaster.waitingAnswer": "Esperando respuesta del oponente...",
    "ruleMaster.yourTurn": "¡Tu turno - busca un personaje!",
    "ruleMaster.opponentTurn": "Turno del oponente...",
    "ruleMaster.searchCharacter": "Buscar un personaje...",
    "ruleMaster.ask": "Preguntar",
    "ruleMaster.asking": "Preguntando...",

    // Answer prompt
    "answer.asks": "{name} pregunta:",
    "answer.doesFit": '"¿{name} encaja?"',
    "answer.yourRule": "Tu regla:",
    "answer.doesCharacterFit": "— ¿este personaje encaja?",
    "answer.yes": "Sí",
    "answer.no": "No",

    // Rule guess prompt
    "ruleGuess.guessing": "¡{name} está adivinando tu regla!",
    "ruleGuess.yourRule": "Tu regla:",
    "ruleGuess.theirGuess": "Su respuesta:",
    "ruleGuess.closeEnough": "¿Es esta respuesta lo suficientemente cercana a tu regla?",
    "ruleGuess.correct": "Correcto",
    "ruleGuess.wrong": "Incorrecto",

    // Rule Master Board
    "rmBoard.yourBoard": "Tu Tablero",
    "rmBoard.noCharacters": "No se han preguntado personajes aún.",
    "rmBoard.quickHistory": "Historial rápido ({count} preguntados)",
    "rmBoard.valid": "válidos",
    "rmBoard.invalid": "inválidos",

    // Game over
    "gameOver.youWin": "¡Ganaste!",
    "gameOver.youLose": "¡Perdiste!",
    "gameOver.guessedCorrectly": "{name} adivinó correctamente.",
    "gameOver.guessedIncorrectly": "{name} adivinó incorrectamente.",
    "gameOver.answerWas": "La respuesta era {answer}.",
    "gameOver.ruleWas": 'La regla de {name} era "{rule}".',
    "gameOver.rematch": "Revancha",
    "gameOver.requesting": "Solicitando...",
    "gameOver.reset": "reiniciar",

    // Room header
    "header.resetBoard": "Reiniciar Tablero",
    "header.backToLobby": "Volver al Lobby",
    "header.cancelling": "Cancelando...",
    "header.leaveRoom": "Salir",
    "header.watching": "{count} viendo",
    "header.confirmCancel": "Esto terminará la partida y regresará a ambos jugadores al lobby. ¿Continuar?",
    "header.confirmLeave": "Saldrás de la sala y perderás la partida actual. ¿Continuar?",

    // Player info badge
    "player.yourPick": "Tu elección",
    "player.yourRule": "Tu regla:",

    // Spectator
    "spectator.badge": "Espectando",

    // Toasts
    "toast.joined": "¡{name} se unió a la sala!",
    "toast.joinedSpectator": "¡{name} se unió como espectador!",
    "toast.lockedIn": "¡El oponente ha confirmado!",
    "toast.gameOn": "¡Ambos jugadores confirmaron! ¡A jugar!",
    "toast.cancelled": "El anfitrión canceló la partida. De vuelta al lobby.",
    "toast.asks": '{name} pregunta: "¿{character} encaja?"',
    "toast.answeredYes": "{name} dice ¡Sí! ({character})",
    "toast.answeredNo": "{name} dice ¡No! ({character})",
    "toast.guessingRule": '{name} está adivinando tu regla: "{guess}"',
    "toast.wrongRuleGuess": '¡Respuesta incorrecta! "{guess}" no es la regla.',
    "toast.wrongGuess": "¡Respuesta incorrecta! La partida continúa.",
    "toast.opponentWrongGuess": "¡{name} adivinó mal! La partida continúa.",
    "toast.opponentRemaining": "¡Al oponente le quedan {count} personaje{s}!",
    "toast.wantsRematch": "¡El oponente quiere revancha!",
    "toast.rematchAccepted": "¡Revancha aceptada! De vuelta al lobby.",
    "toast.playerLeft": "{name} salió de la sala.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function t(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  let text: string = translations[locale][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

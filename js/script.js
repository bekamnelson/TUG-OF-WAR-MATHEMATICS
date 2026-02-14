document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration initiale ---
    const gameState = {
        timer: 300, // 5 minutes en secondes (5 * 60)
        team1: { score: 0, currentAnswer: "", correctAnswer: 0 },
        team2: { score: 0, currentAnswer: "", correctAnswer: 0 },
        gameActive: true
    };

    // --- Sélecteurs ---
    const timerDisplay = document.querySelector('.timer');
    const tugWrapper = document.querySelector('.tug-animation-group');
    
    // Équipes
    const teams = {
        team1: {
            display: document.querySelectorAll('.result-display')[0],
            scorePill: document.querySelectorAll('.score-pill')[0],
            scoreDashboard: document.querySelectorAll('.team-info strong')[0],
            equation: document.querySelectorAll('.equation')[0],
            card: document.querySelectorAll('.math-card')[0]
        },
        team2: {
            display: document.querySelectorAll('.result-display')[1],
            scorePill: document.querySelectorAll('.score-pill')[1],
            scoreDashboard: document.querySelectorAll('.team-info strong')[1],
            equation: document.querySelectorAll('.equation')[1],
            card: document.querySelectorAll('.math-card')[1]
        }
    };

    // --- Logique du Jeu ---

    // Générer une opération (addition simple 1-20)
    function generateQuestion(teamKey) {
        const a = Math.floor(Math.random() * 15) + 1;
        const b = Math.floor(Math.random() * 15) + 1;
        gameState[teamKey].correctAnswer = a + b;
        teams[teamKey].equation.textContent = `${a} + ${b} = ?`;
    }

    // Gérer l'entrée du clavier
    function handleInput(teamKey, value) {
        if (!gameState.gameActive) return;

        const team = gameState[teamKey];
        const ui = teams[teamKey];

        if (value === '✖') {
            team.currentAnswer = "";
        } else if (value === '✔') {
            checkAnswer(teamKey);
            return;
        } else {
            if (team.currentAnswer.length < 3) {
                team.currentAnswer += value;
            }
        }
        ui.display.textContent = team.currentAnswer || "0";
    }

 function checkAnswer(teamKey) {
    const team = gameState[teamKey];
    const ui = teams[teamKey];

    if (parseInt(team.currentAnswer) === team.correctAnswer) {
        // --- CAS : BONNE RÉPONSE ---
        team.score++;
        
        // Ajoute l'illumination VERTE
        ui.card.classList.add('success-flash');
        setTimeout(() => ui.card.classList.remove('success-flash'), 1000);

        updateScoresUI();
        updateTugPosition();
        
        team.currentAnswer = "";
        ui.display.textContent = "0";
        generateQuestion(teamKey);
    } else {
        // --- CAS : MAUVAISE RÉPONSE ---
        
        // Ajoute l'illumination ROUGE + Secousse
        ui.card.classList.add('error-flash');
        setTimeout(() => ui.card.classList.remove('error-flash'), 1000);

        team.currentAnswer = "";
        ui.display.textContent = "0";
    }
}

    // Mise à jour des scores (Pillules latérales ET Cadran central)
    function updateScoresUI() {
        // Équipe 1
        teams.team1.scorePill.textContent = gameState.team1.score;
        teams.team1.scoreDashboard.textContent = gameState.team1.score;
        
        // Équipe 2
        teams.team2.scorePill.textContent = gameState.team2.score;
        teams.team2.scoreDashboard.textContent = gameState.team2.score;
    }

    // Animation de la corde
    function updateTugPosition() {
        const diff = gameState.team1.score - gameState.team2.score;
        const moveStep = 15; // Pixels par point d'écart
        tugWrapper.style.transform = `translateX(${diff * moveStep}px)`;
    }

    // --- Gestion du Temps (5 minutes) ---
    const timerInterval = setInterval(() => {
        if (gameState.timer > 0) {
            gameState.timer--;
            const mins = Math.floor(gameState.timer / 60);
            const secs = gameState.timer % 60;
            timerDisplay.textContent = `⏱ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            gameState.gameActive = false;
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);

    function endGame() {
    gameState.gameActive = false;

    // 1. Ajouter le flou sur tout le conteneur de jeu
    const gameContainer = document.querySelector('.app-container');
    gameContainer.style.filter = "blur(15px)";
    gameContainer.style.transition = "filter 0.5s ease";

    // 2. Déterminer le gagnant
    let resultTitle = "";
    let winnerClass = "";
    if (gameState.team1.score > gameState.team2.score) {
        resultTitle = "VICTOIRE ÉQUIPE BLEUE ! 🏆";
        winnerClass = "win-blue";
    } else if (gameState.team2.score > gameState.team1.score) {
        resultTitle = "VICTOIRE ÉQUIPE ROUGE ! 🏆";
        winnerClass = "win-red";
    } else {
        resultTitle = "MATCH NUL ! 🤝";
        winnerClass = "win-draw";
    }

    // 3. Créer et afficher la fenêtre de fin
    const overlay = document.createElement('div');
    overlay.className = 'end-game-overlay';
    overlay.innerHTML = `
        <div class="result-card ${winnerClass}">
            <h1>${resultTitle}</h1>
            <div class="final-scores">
                <div class="score-item">
                    <span>Team 1</span>
                    <strong>${gameState.team1.score}</strong>
                </div>
                <div class="score-separator">:</div>
                <div class="score-item">
                    <span>Team 2</span>
                    <strong>${gameState.team2.score}</strong>
                </div>
            </div>
            <button onclick="location.reload()" class="retry-btn">NOUVELLE PARTIE</button>
            <button onclick="window.location.href='accueil.html'" class="home-exit-btn">Retour Accueil</button>
        </div>
    `;

    document.body.appendChild(overlay);
}

    // --- Événements ---
    document.querySelectorAll('.number-grid').forEach((grid, index) => {
        const teamKey = index === 0 ? 'team1' : 'team2';
        grid.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                handleInput(teamKey, e.target.textContent);
            }
        });
    });

    // Initialisation
    generateQuestion('team1');
    generateQuestion('team2');
    updateScoresUI();
});

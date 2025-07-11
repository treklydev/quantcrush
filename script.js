let gameState = {
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    minRange: 2,
    maxRange: 100,
    timeLimit: 120, // Default to 2 minutes
    score: 0,
    timeLeft: 120,
    currentQuestion: {},
    gameTimer: null,
    startTime: null,
    correctAnswers: 0,
    totalQuestions: 0,
    questionTimes: [],
    includeDecimals: false,
    gameActive: false,
    sessionId: 0, // Added sessionId to gameState
    questionDetails: [] // Track per-question analytics
};

let globalGameTimer = null;
let gameSessionId = 0;
let lastValidMin = 1;
let lastValidMax = 12;

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Highlight checked operation toggles on load
    document.querySelectorAll('.checkbox-item[data-operation]').forEach(item => {
        const checkbox = item.querySelector('input');
        item.classList.toggle('selected', checkbox.checked);
    });
    setupEventListeners();
});

function setupEventListeners() {
    // Operation checkboxes
    document.querySelectorAll('.checkbox-item[data-operation]').forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            updateOperations();
        });
    });

    // Question type checkboxes
    document.getElementById('minRange').addEventListener('input', updateNumberRange);
    document.getElementById('maxRange').addEventListener('input', updateNumberRange);
    document.getElementById('minRange').addEventListener('blur', validateNumberRangeOnBlur);
    document.getElementById('maxRange').addEventListener('blur', validateNumberRangeOnBlur);

    // Time radio buttons
    document.querySelectorAll('.radio-item[data-time]').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.radio-item').forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
            const radio = this.querySelector('input');
            radio.checked = true;
            gameState.timeLimit = parseInt(this.dataset.time);
        });
    });

    // Answer input
    document.getElementById('answerInput').addEventListener('input', checkAnswer);
    document.getElementById('answerInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // Decimals checkbox - handle all logic in the box click event
    document.getElementById('decimalsToggle').addEventListener('click', function(e) {
        const checkbox = this.querySelector('input');
        // Only toggle if not clicking the input itself (to avoid double toggling)
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        gameState.includeDecimals = checkbox.checked;
        this.classList.toggle('selected', checkbox.checked);
    });
    // Mobile-friendly touch event for decimals toggle
    document.getElementById('decimalsToggle').addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior
        const checkbox = this.querySelector('input');
        checkbox.checked = !checkbox.checked;
        gameState.includeDecimals = checkbox.checked;
        this.classList.toggle('selected', checkbox.checked);
    });

    // Initialize selections
    updateOperations();
    updateNumberRange();
}

function updateOperations() {
    gameState.operations = [];
    document.querySelectorAll('.checkbox-item[data-operation] input:checked').forEach(checkbox => {
        gameState.operations.push(checkbox.parentElement.dataset.operation);
    });
    validateStart();
}

function updateNumberRange() {
    const minInput = document.getElementById('minRange');
    const maxInput = document.getElementById('maxRange');
    const minValue = minInput.value;
    const maxValue = maxInput.value;

    // If either input is empty, do not update gameState
    if (minValue === '' || maxValue === '') {
        return;
    }

    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);

    if (!isNaN(min)) lastValidMin = min;
    if (!isNaN(max)) lastValidMax = max;

    gameState.minRange = min;
    gameState.maxRange = max;
    validateStart();
}

function validateNumberRangeOnBlur(e) {
    const minInput = document.getElementById('minRange');
    const maxInput = document.getElementById('maxRange');
    let min = parseFloat(minInput.value);
    let max = parseFloat(maxInput.value);

    if (minInput.value === '' || isNaN(min)) {
        minInput.value = lastValidMin;
        min = lastValidMin;
    }
    if (maxInput.value === '' || isNaN(max)) {
        maxInput.value = lastValidMax;
        max = lastValidMax;
    }
    if (min >= max) {
        max = min + 0.01;
        maxInput.value = max.toFixed(2);
    }
    gameState.minRange = min;
    gameState.maxRange = max;
    validateStart();
}

function validateStart() {
    const startBtn = document.querySelector('.start-btn');
    const canStart = gameState.operations.length > 0 && gameState.minRange < gameState.maxRange;
    startBtn.disabled = !canStart;
}

function startGame() {
    stopGame();
    document.querySelector('.results-screen').classList.remove('active');
    document.querySelector('.setup-screen').classList.remove('active');
    document.querySelector('.game-screen').classList.add('active');
    gameState.score = 0;
    gameState.timeLeft = gameState.timeLimit;
    gameState.correctAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.questionTimes = [];
    gameState.questionDetails = [];
    gameState.startTime = Date.now();
    gameState.startedAt = new Date().toISOString();
    gameState.gameActive = true;
    
    // Reset score display
    document.getElementById('score').textContent = '0';
    
    generateNewQuestion();
    startTimer();
}

function stopGame() {
    gameState.gameActive = false;
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
}

function startTimer() {
    gameState.gameTimer = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(gameState.gameTimer);
            gameState.gameTimer = null;
            return;
        }
        gameState.timeLeft--;
        updateTimerDisplay();
        if (gameState.timeLeft <= 0) {
            if (gameState.gameActive) {
                endGame();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timerText').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update circular progress
    const totalTime = gameState.timeLimit;
    const elapsed = totalTime - gameState.timeLeft;
    const percentage = (elapsed / totalTime) * 360;
    
    const timerCircle = document.getElementById('timerCircle');
    timerCircle.style.background = `conic-gradient(#00cc66 ${percentage}deg, #333333 ${percentage}deg)`;
}

function generateNewQuestion() {
    const operation = gameState.operations[Math.floor(Math.random() * gameState.operations.length)];
    
    // Generate random numbers within the specified range
    function getRandomNumber() {
        const range = gameState.maxRange - gameState.minRange;
        let value = Math.random() * range + gameState.minRange;

        if (!gameState.includeDecimals) {
            return Math.floor(value);
        }

        return Math.round(value * 100) / 100; // round to 2 decimals
    }       

    
    let num1 = getRandomNumber();
    let num2 = getRandomNumber();
    let answer, questionText;

    switch (operation) {
        case 'addition':
            answer = num1 + num2;
            questionText = `${num1} + ${num2}`;
            break;
        case 'subtraction':
            // Ensure positive result
            if (num1 < num2) [num1, num2] = [num2, num1];
            answer = num1 - num2;
            questionText = `${num1} - ${num2}`;
            break;
        case 'multiplication':
            answer = num1 * num2;
            questionText = `${num1} × ${num2}`;
            break;
        case 'division':
            // Ensure we don't divide by very small numbers
            if (num2 < 0.1) num2 = 0.1;
            answer = num1 / num2;
            questionText = `${num1} ÷ ${num2}`;
            break;
        case 'exponents':
            // Perfect squares: base numbers 1-15
            const base = Math.floor(Math.random() * 15) + 1;
            answer = base * base;
            questionText = `${base}²`;
            break;
        case 'percentages':
            const percentages = [10, 20, 25, 50];
            const percent = percentages[Math.floor(Math.random() * percentages.length)];
            
            // Generate clean base numbers that result in whole number answers
            let value;
            if (percent === 10) {
                // 10% - use numbers divisible by 10
                value = (Math.floor(Math.random() * 20) + 1) * 10; // 10, 20, 30, ..., 200
            } else if (percent === 20) {
                // 20% - use numbers divisible by 5
                value = (Math.floor(Math.random() * 40) + 2) * 5; // 10, 15, 20, ..., 200
            } else if (percent === 25) {
                // 25% - use numbers divisible by 4
                value = (Math.floor(Math.random() * 50) + 3) * 4; // 12, 16, 20, ..., 200
            } else if (percent === 50) {
                // 50% - use numbers divisible by 2
                value = (Math.floor(Math.random() * 100) + 6) * 2; // 12, 14, 16, ..., 200
            }
            
            answer = (value * percent) / 100;
            questionText = `${percent}% of ${value}`;
            break;
    }

    // Round answer to 2 decimal places
    answer = Math.round(answer * 100) / 100;

    gameState.currentQuestion = {
        answer: answer,
        startTime: Date.now(),
        operationType: operation
    };

    document.getElementById('question').textContent = questionText + ' = ?';
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').className = 'answer-input';
    document.getElementById('answerInput').focus();
}

function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answerInput').value);
    const correctAnswer = gameState.currentQuestion.answer;
    const answerInput = document.getElementById('answerInput');
    
    if (isNaN(userAnswer)) return;

    const questionTime = Date.now() - gameState.currentQuestion.startTime;
    gameState.questionTimes.push(questionTime);
    gameState.totalQuestions++;
    // Record analytics for this question
    gameState.questionDetails.push({
        operationType: gameState.currentQuestion.operationType,
        isCorrect: Math.abs(userAnswer - correctAnswer) < 0.01,
        timeTakenMs: questionTime
    });

    if (Math.abs(userAnswer - correctAnswer) < 0.01) {
        // Correct answer
        gameState.correctAnswers++;
        gameState.score = gameState.correctAnswers; // Score equals correct answers
        document.getElementById('score').textContent = gameState.score;
        
        // Debug: log the score to console
        console.log('Correct answer! Score:', gameState.score, 'Correct answers:', gameState.correctAnswers);
        
        // Immediately generate next question for speed
        generateNewQuestion();
    } else {
        // Incorrect answer - no visual feedback, just continue
    }
}

function endGame() {
    if (!gameState.gameActive) return;
    stopGame();
    document.querySelector('.setup-screen').classList.remove('active');
    document.querySelector('.game-screen').classList.remove('active');
    document.querySelector('.results-screen').classList.add('active');
    // Calculate avg time as timeLimit divided by correctAnswers
    let avgTime = 0;
    if (gameState.correctAnswers > 0) {
        avgTime = Math.round((gameState.timeLimit / gameState.correctAnswers) * 10) / 10;
    }
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = gameState.correctAnswers;
    document.getElementById('avgTime').textContent = avgTime + 's';
    // --- Save analytics to Firestore if available ---
    if (window.saveGameResult) {
        const endedAt = new Date().toISOString();
        window.saveGameResult({
            mode: 'basic',
            score: gameState.score,
            correctAnswers: gameState.correctAnswers,
            totalQuestions: gameState.totalQuestions,
            avgTimePerQuestion: avgTime,
            startedAt: gameState.startedAt,
            endedAt,
            questions: gameState.questionDetails
        });
    }
}

function resetGame() {
    stopGame();
    document.querySelector('.results-screen').classList.remove('active');
    document.querySelector('.game-screen').classList.remove('active');
    document.querySelector('.setup-screen').classList.add('active');
}
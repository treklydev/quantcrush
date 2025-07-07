            let gameState = {
            operations: ['addition'],
            minRange: 1,
            maxRange: 12,
            timeLimit: 60,
            score: 0,
            timeLeft: 60,
            currentQuestion: {},
            gameTimer: null,
            startTime: null,
            correctAnswers: 0,
            totalQuestions: 0,
            questionTimes: [],
            includeDecimals: false,
            gameActive: false // Add this flag
        };

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
            const minValue = parseFloat(document.getElementById('minRange').value);
            const maxValue = parseFloat(document.getElementById('maxRange').value);
            
            if (minValue >= maxValue) {
                document.getElementById('maxRange').value = (minValue + 0.01).toFixed(2);
                gameState.maxRange = minValue + 0.01;
            } else {
                gameState.maxRange = maxValue;
            }
            
            gameState.minRange = minValue;
            validateStart();
        }

        function validateStart() {
            const startBtn = document.querySelector('.start-btn');
            const canStart = gameState.operations.length > 0 && gameState.minRange < gameState.maxRange;
            startBtn.disabled = !canStart;
        }

        function startGame() {
            if (gameState.operations.length === 0 || gameState.minRange >= gameState.maxRange) return;

            gameState.score = 0;
            gameState.timeLeft = gameState.timeLimit;
            gameState.correctAnswers = 0;
            gameState.totalQuestions = 0;
            gameState.questionTimes = [];
            gameState.startTime = Date.now();
            gameState.gameActive = true; // Set active

            document.querySelector('.setup-screen').classList.remove('active');
            document.querySelector('.game-screen').classList.add('active');

            generateNewQuestion();
            startTimer();
        }

        function startTimer() {
            gameState.gameTimer = setInterval(() => {
                gameState.timeLeft--;
                updateTimerDisplay();
                
                if (gameState.timeLeft <= 0) {
                    endGame();
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
            timerCircle.style.background = `conic-gradient(#00aaff ${percentage}deg, #333333 ${percentage}deg)`;
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
            }

            // Round answer to 2 decimal places
            answer = Math.round(answer * 100) / 100;

            gameState.currentQuestion = {
                answer: answer,
                startTime: Date.now()
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

            if (Math.abs(userAnswer - correctAnswer) < 0.01) {
                // Correct answer
                gameState.score += 10;
                gameState.correctAnswers++;
                answerInput.classList.add('correct');
                document.getElementById('score').textContent = gameState.score;
                
                setTimeout(() => {
                    answerInput.classList.remove('correct');
                    generateNewQuestion();
                }, 500);
            } else {
                // Incorrect answer - no visual feedback, just continue
            }
        }

        function endGame() {
            if (!gameState.gameActive) return; // Only show results if game is active
            gameState.gameActive = false;
            clearInterval(gameState.gameTimer);
            
            document.querySelector('.game-screen').classList.remove('active');
            document.querySelector('.results-screen').classList.add('active');
            
            const avgTime = gameState.questionTimes.length > 0 ? Math.round(gameState.questionTimes.reduce((a, b) => a + b, 0) / gameState.questionTimes.length / 1000 * 10) / 10 : 0;
            
            document.getElementById('finalScore').textContent = gameState.score;
            document.getElementById('correctCount').textContent = gameState.correctAnswers;
            document.getElementById('totalCount').textContent = gameState.totalQuestions;
            document.getElementById('avgTime').textContent = avgTime + 's';
        }

        function resetGame() {
            document.querySelector('.results-screen').classList.remove('active');
            document.querySelector('.setup-screen').classList.add('active');
        }
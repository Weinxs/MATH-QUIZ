document.addEventListener("DOMContentLoaded", () => {
    let num1, num2, correctAnswer, timer;
    let timeLeft = 10;
    let correctCount = 0;
    let incorrectCount = 0;
    let timerPaused = false;
    let startTime, endTime;
    let sequentialCounter = 1;
    let sequentialBase = 0;
    let responseTimes = {
        addition: [],
        subtraction: [],
        multiplication: [],
        division: [],
        square: [],
        "square-root": []
    };
    const timerElement = document.getElementById("timer");
    const progressBar = document.getElementById("progress-bar");
    const questionElement = document.getElementById("question");
    const answerInput = document.getElementById("answer");
    const checkButton = document.getElementById("check-button");
    const feedbackElement = document.getElementById("feedback");
    const correctElement = document.getElementById("correct");
    const incorrectElement = document.getElementById("incorrect");
    const overlay = document.getElementById("overlay");
    const popupMessage = document.getElementById("popup-message");
    const acceptModalButton = document.getElementById("accept-modal");
    const operationSelect = document.getElementById("operation");
    const modeSelect = document.getElementById("mode");
    const specificNumbersDiv = document.getElementById("specific-numbers");
    const specificNumberSelect = document.getElementById("specific-number-select");
    const sequentialModeCheckbox = document.getElementById("sequential-mode");

    modeSelect.addEventListener("change", () => {
        specificNumbersDiv.style.display = modeSelect.value === "specific" ? "block" : "none";
        generateQuestion();
    });

    function getSelectedNumber() {
        return parseInt(specificNumberSelect.value);
    }

    function generateQuestion() {
        clearInterval(timer);
        timeLeft = 10;
        timerElement.textContent = timeLeft;
        progressBar.style.width = "100%";
        progressBar.style.backgroundColor = "green";
        timerPaused = false;
        startTimer();
        
        const operation = operationSelect.value;
        const mode = modeSelect.value;
        const isSequentialMode = sequentialModeCheckbox.checked;
        const useSpecificNumber = mode === "specific";
        
        if (isSequentialMode) {
            
            if (sequentialCounter === 1 || sequentialBase === 0) {
                
                if (useSpecificNumber) {
                    sequentialBase = getSelectedNumber();
                } else {
                    
                    sequentialBase = Math.floor(Math.random() * 10) + 1;
                }
            }
            
            num1 = sequentialBase;
            num2 = sequentialCounter;
            
            if (operation === "square") {
                num1 = sequentialCounter;
                num2 = 0;
            } else if (operation === "square-root") {

                num1 = sequentialCounter * sequentialCounter;
                num2 = 0;
            }
        } 

        else if (useSpecificNumber) {
            const selectedNumber = getSelectedNumber();
            
            if (operation !== "square" && operation !== "square-root") {
                num1 = selectedNumber;
                
                if (Math.random() > 0.5) {
                    num2 = selectedNumber;
                } else {
                    num2 = Math.floor(Math.random() * 10) + 1;
                }
                
                if (operation === "division" && num2 === 0) {
                    num2 = 1;
                }
            } 

            else if (operation === "square") {
                num1 = selectedNumber;
                num2 = 0;
            } 

            else if (operation === "square-root") {

                const usePerfectSquare = Math.random() > 0.5;
                
                if (usePerfectSquare) {
                    num1 = selectedNumber * selectedNumber;
                } else {
                    num1 = selectedNumber;
                }
                
                num2 = 0;
            }
        }
        else {

            if (!isSequentialMode) {
                sequentialCounter = 1;
                sequentialBase = 0;
            } 
            do {
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                
                if (operation === "division") {
                    num2 = Math.max(1, num2);
                }
                let checkValue;
                if (operation === "square" || operation === "square-root") {
                    checkValue = num1;
                } else {
                    checkValue = num1 * num2;
                }
                if ((mode === "even" && checkValue % 2 !== 0) || 
                    (mode === "odd" && checkValue % 2 === 0)) {
                    continue;
                }
                break;
            } while (true);
        }
        
        switch (operation) {
            case "addition":
                correctAnswer = num1 + num2;
                questionElement.textContent = `${num1} + ${num2} = ?`;
                break;
            case "subtraction":
                correctAnswer = num1 - num2;
                questionElement.textContent = `${num1} - ${num2} = ?`;
                break;
            case "multiplication":
                correctAnswer = num1 * num2;
                questionElement.textContent = `${num1} × ${num2} = ?`;
                break;
            case "division":
                correctAnswer = num1 / num2;
                questionElement.textContent = `${num1} ÷ ${num2} = ?`;
                break;
            case "square":
                correctAnswer = num1 * num1;
                questionElement.textContent = `${num1}² = ?`;
                break;
            case "square-root":
                const sqrtValue = Math.sqrt(num1);
                if (Number.isInteger(sqrtValue)) {
                    correctAnswer = sqrtValue;
                    questionElement.textContent = `√${num1} = ?`;
                } else {
                    correctAnswer = parseFloat(sqrtValue.toFixed(2));
                    questionElement.textContent = `√${num1} = ? (2 decimales)`;
                }
                break;
        }
        

        if (operation !== "square-root") {
            correctAnswer = Number.isInteger(correctAnswer) ? 
                correctAnswer : parseFloat(correctAnswer.toFixed(2));
        }
        

        answerInput.value = "";
        feedbackElement.textContent = "";
        startTime = Date.now();
    }

    function startTimer() {
        timer = setInterval(() => {
            if (!timerPaused && timeLeft > 0) {
                timeLeft--;
                timerElement.textContent = timeLeft;
                progressBar.style.width = `${timeLeft * 10}%`;
                

                if (timeLeft <= 3) {
                    progressBar.style.backgroundColor = "red";
                } else if (timeLeft <= 6) {
                    progressBar.style.backgroundColor = "yellow";
                }
            } else if (timeLeft <= 0) {
                showModal(`Tiempo agotado. La respuesta correcta es ${correctAnswer}`);
                pauseTimer();
            }
        }, 1000);
    }

    function showModal(message) {
        popupMessage.textContent = message;
        overlay.style.display = "flex";
    }

    function closeModal() {
        overlay.style.display = "none";
        generateQuestion();
    }

    function pauseTimer() {
        timerPaused = true;
        clearInterval(timer);
        endTime = Date.now();
        updateResponseTimes();
    }

    function updateResponseTimes() {
        const operation = operationSelect.value;
        const timeTaken = (endTime - startTime) / 1000;
        responseTimes[operation].push(timeTaken);
        

        const avgTime = responseTimes[operation].reduce((sum, time) => sum + time, 0) / 
                        responseTimes[operation].length;
        

        const avgElementId = `avg-${operation}`;
        const avgElement = document.getElementById(avgElementId);
        if (avgElement) {
            avgElement.textContent = avgTime.toFixed(2);
        }
    }

    function checkAnswer() {
        const userAnswer = parseFloat(answerInput.value);
        

        if (isNaN(userAnswer)) {
            feedbackElement.textContent = "Por favor, ingresa un número válido.";
            feedbackElement.style.color = "red";
            return;
        }
        

        const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;
        
        if (isCorrect) {

            correctCount++;
            correctElement.textContent = correctCount;
            feedbackElement.textContent = "¡Correcto!";
            feedbackElement.style.color = "green";
            endTime = Date.now();
            updateResponseTimes();
            

            if (sequentialModeCheckbox.checked) {
                sequentialCounter++;
                

                if (sequentialCounter > 20) {
                    sequentialCounter = 1;
                    sequentialBase = 0;
                    showModal("¡Secuencia completada! Comenzando una nueva secuencia.");
                    pauseTimer();
                    return;
                }
            }
            
            generateQuestion();
        } else {

            incorrectCount++;
            incorrectElement.textContent = incorrectCount;
            feedbackElement.textContent = "Incorrecto, intenta de nuevo.";
            feedbackElement.style.color = "red";
            showModal(`Respuesta incorrecta. La respuesta correcta es ${correctAnswer}`);
            pauseTimer();
        }
    }

    function autoCheckAnswer() {
        const userAnswer = parseFloat(answerInput.value);
        
        if (!isNaN(userAnswer)) {

            const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;
            
            if (isCorrect) {
                checkAnswer();
            }
        }
    }

    function handleEnterKeyPress(event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    }


    specificNumberSelect.addEventListener("change", () => {
        if (modeSelect.value === "specific") {
            generateQuestion();
        }
    });


    operationSelect.addEventListener("change", () => {
        sequentialCounter = 1;
        sequentialBase = 0;
        generateQuestion();
    });


    modeSelect.addEventListener("change", generateQuestion);
    sequentialModeCheckbox.addEventListener("change", () => {

        if (sequentialModeCheckbox.checked) {
            sequentialCounter = 1;
            sequentialBase = 0;
        }
        generateQuestion();
    });


    checkButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("input", autoCheckAnswer);
    answerInput.addEventListener("keydown", handleEnterKeyPress);
    acceptModalButton.addEventListener("click", closeModal);


    generateQuestion();
});

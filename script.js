document.addEventListener("DOMContentLoaded", () => {
    let num1, num2, correctAnswer, timer;
    let timeLeft = 10;
    let correctCount = 0;
    let incorrectCount = 0;
    let timerPaused = false;
    let startTime, endTime;
    let sequentialCounter = 1; // Counter for sequential mode
    let sequentialBase = 0;    // Base number for sequential mode
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

    // Show/hide specific numbers section based on mode selection
    modeSelect.addEventListener("change", () => {
        specificNumbersDiv.style.display = modeSelect.value === "specific" ? "block" : "none";
        generateQuestion();
    });

    // Function to get the selected specific number
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
        
        // Handle sequential mode
        if (isSequentialMode) {
            // If starting a new sequence or changing operations
            if (sequentialCounter === 1 || sequentialBase === 0) {
                // If specific number is selected, use that as the base
                if (useSpecificNumber) {
                    sequentialBase = getSelectedNumber();
                } else {
                    // Generate a random base number between 1 and 10
                    sequentialBase = Math.floor(Math.random() * 10) + 1;
                }
            }
            
            num1 = sequentialBase;
            num2 = sequentialCounter;
            
            // For square and square-root in sequential mode
            if (operation === "square") {
                num1 = sequentialCounter;
                num2 = 0; // Not used for square
            } else if (operation === "square-root") {
                // Find perfect squares for sequential mode
                // We'll use sequentialCounter^2 as the number to find the root of
                num1 = sequentialCounter * sequentialCounter;
                num2 = 0; // Not used for square-root
            }
        } 
        // Handle specific number mode
        else if (useSpecificNumber) {
            const selectedNumber = getSelectedNumber();
            
            // For operations that use two numbers
            if (operation !== "square" && operation !== "square-root") {
                num1 = selectedNumber;
                
                // For the second number, either use the specific number or generate random
                // Let's use a 50/50 chance to make it more varied
                if (Math.random() > 0.5) {
                    num2 = selectedNumber;
                } else {
                    num2 = Math.floor(Math.random() * 10) + 1;
                }
                
                // Ensure non-zero divisor for division
                if (operation === "division" && num2 === 0) {
                    num2 = 1;
                }
            } 
            // For square operation
            else if (operation === "square") {
                num1 = selectedNumber;
                num2 = 0; // Not used for square
            } 
            // For square-root operation
            else if (operation === "square-root") {
                // Option 1: Use the selected number as is (may result in decimal answers)
                // Option 2: Use it as a perfect square (selectedNumber * selectedNumber)
                const usePerfectSquare = Math.random() > 0.5;
                
                if (usePerfectSquare) {
                    num1 = selectedNumber * selectedNumber; // Make it a perfect square
                } else {
                    num1 = selectedNumber;
                }
                
                num2 = 0; // Not used for square-root
            }
        }
        else {
            // Reset sequential counter when not in sequential mode
            if (!isSequentialMode) {
                sequentialCounter = 1;
                sequentialBase = 0;
            }
            
            // Generate random numbers based on operation and mode
            do {
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                
                // Ensure non-zero divisor for division
                if (operation === "division") {
                    num2 = Math.max(1, num2);
                }
                
                // Determine which value to check for even/odd
                let checkValue;
                if (operation === "square" || operation === "square-root") {
                    checkValue = num1;
                } else {
                    checkValue = num1 * num2;
                }
                
                // Continue generating if mode conditions aren't met
                if ((mode === "even" && checkValue % 2 !== 0) || 
                    (mode === "odd" && checkValue % 2 === 0)) {
                    continue;
                }
                
                break;
            } while (true);
        }
        
        // Set question and correct answer based on operation
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
        
        // Format the correct answer for non-square-root operations
        if (operation !== "square-root") {
            correctAnswer = Number.isInteger(correctAnswer) ? 
                correctAnswer : parseFloat(correctAnswer.toFixed(2));
        }
        
        // Reset input and feedback
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
                
                // Change progress bar color based on time left
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
        
        // Calculate and display average time
        const avgTime = responseTimes[operation].reduce((sum, time) => sum + time, 0) / 
                        responseTimes[operation].length;
        
        // Update the corresponding average time display
        const avgElementId = `avg-${operation}`;
        const avgElement = document.getElementById(avgElementId);
        if (avgElement) {
            avgElement.textContent = avgTime.toFixed(2);
        }
    }

    function checkAnswer() {
        const userAnswer = parseFloat(answerInput.value);
        
        // Check if input is valid
        if (isNaN(userAnswer)) {
            feedbackElement.textContent = "Por favor, ingresa un número válido.";
            feedbackElement.style.color = "red";
            return;
        }
        
        // Compare with a small tolerance for floating point errors
        const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;
        
        if (isCorrect) {
            // Handle correct answer
            correctCount++;
            correctElement.textContent = correctCount;
            feedbackElement.textContent = "¡Correcto!";
            feedbackElement.style.color = "green";
            endTime = Date.now();
            updateResponseTimes();
            
            // Increment sequential counter if in sequential mode
            if (sequentialModeCheckbox.checked) {
                sequentialCounter++;
                
                // Reset sequence after reaching 20
                if (sequentialCounter > 20) {
                    sequentialCounter = 1;
                    sequentialBase = 0; // This will trigger a new base number
                    showModal("¡Secuencia completada! Comenzando una nueva secuencia.");
                    pauseTimer();
                    return;
                }
            }
            
            generateQuestion(); // Generate a new question
        } else {
            // Handle incorrect answer
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
            // Use the same comparison logic as in checkAnswer
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

    // Add event listener for specific number select to regenerate question when selection changes
    specificNumberSelect.addEventListener("change", () => {
        if (modeSelect.value === "specific") {
            generateQuestion();
        }
    });

    // Reset sequential counter when changing operations
    operationSelect.addEventListener("change", () => {
        sequentialCounter = 1;
        sequentialBase = 0;
        generateQuestion();
    });

    // Set up event listeners for mode changes
    modeSelect.addEventListener("change", generateQuestion);
    sequentialModeCheckbox.addEventListener("change", () => {
        // Reset sequential counter when toggling sequential mode
        if (sequentialModeCheckbox.checked) {
            sequentialCounter = 1;
            sequentialBase = 0;
        }
        generateQuestion();
    });

    // Set up event listeners
    checkButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("input", autoCheckAnswer);
    answerInput.addEventListener("keydown", handleEnterKeyPress);
    acceptModalButton.addEventListener("click", closeModal);

    // Start with the first question
    generateQuestion();
});
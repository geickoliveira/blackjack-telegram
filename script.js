import { v4 as uuidv4 } from 'uuid';


Telegram.WebApp.ready();

document.addEventListener('DOMContentLoaded', () => {
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let gameEnded = false;
    let balance = 100;
    let betAmount = 10;
    let insuranceAmount = 0;
    let gamesPlayed = 0;
    let hasInsurance = false;
    let gameHistory = [];

    const balanceValue = document.getElementById('balance-value');
    const betAmountInput = document.getElementById('bet-amount');
    const betButton = document.getElementById('bet-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const doubleButton = document.getElementById('double-button');
    const insuranceButton = document.getElementById('insurance-button');
    const insuranceContainer = document.getElementById('insurance-container');
    const dealerHandValueDisplay = document.getElementById('dealer-hand-value');
    const playerHandValueDisplay = document.getElementById('player-hand-value');
    const gameMessage = document.getElementById('game-message');
    const toggleHistoryButton = document.getElementById('toggle-history');
    const gameHistoryContainer = document.getElementById('game-history');
    const historyList = document.getElementById('history-list');

    function createDeck() {
        const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const deck = [];

        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
        return deck;
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function dealCard() {
        if (deck.length > 0) {
            return deck.pop();
        } else {
            console.warn("No more cards in the deck!");
            return null;
        }
    }

    function calculateHandValue(hand) {
        let hasAce = false;
        let total = 0;

        for (const card of hand) {
            let cardValue = parseInt(card.value);
            if (card.value === "A") {
                hasAce = true;
                cardValue = 11;
            } else if (["J", "Q", "K"].includes(card.value)) {
                cardValue = 10;
            }
            total += cardValue;
        }

        if (hasAce && total > 21) {
            total -= 10;
        }

        return total;
    }

    function displayCard(card, targetElement) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "80");
        svg.setAttribute("height", "112");
        svg.setAttribute("viewBox", "0 0 80 112");

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "80");
        rect.setAttribute("height", "112");
        rect.setAttribute("rx", "8");
        rect.setAttribute("fill", "white");
        rect.setAttribute("stroke", "#333");
        rect.setAttribute("stroke-width", "2");
        svg.appendChild(rect);

        const textValue = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textValue.setAttribute("x", "10");
        textValue.setAttribute("y", "30");
        textValue.setAttribute("font-size", "20");
        textValue.setAttribute("font-family", "Arial");
        textValue.setAttribute("fill", "#333");
        textValue.textContent = card.value;
        svg.appendChild(textValue);

        const textSuit = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textSuit.setAttribute("x", "10");
        textSuit.setAttribute("y", "60");
        textSuit.setAttribute("font-size", "20");
        textSuit.setAttribute("font-family", "Arial");
        textSuit.setAttribute("fill", getSuitColor(card.suit));
        textSuit.textContent = getSuitSymbol(card.suit);
        svg.appendChild(textSuit);

        cardDiv.appendChild(svg);
        targetElement.appendChild(cardDiv);
    }

    function getSuitSymbol(suit) {
        switch (suit) {
            case "Hearts":
                return "♥";
            case "Diamonds":
                return "♦";
            case "Clubs":
                return "♣";
            case "Spades":
                return "♠";
            default:
                return "";
        }
    }

    function getSuitColor(suit) {
        switch (suit) {
            case "Hearts":
            case "Diamonds":
                return "red";
            default:
                return "black";
        }
    }

    function clearCards() {
        document.getElementById('dealer-cards').innerHTML = '';
        document.getElementById('player-cards').innerHTML = '';
    }

    function startGame() {
        gameEnded = false;
        playerHand = [];
        dealerHand = [];
        hasInsurance = false;
        insuranceAmount = 0;
        insuranceContainer.style.display = 'none';

        clearCards();
        deck = createDeck();
        shuffleDeck();

        playerHand.push(dealCard());
        dealerHand.push(dealCard());
        playerHand.push(dealCard());
        dealerHand.push(dealCard());

        displayCard(dealerHand[0], document.getElementById('dealer-cards'));
        displayCard(playerHand[0], document.getElementById('player-cards'));
        displayCard(playerHand[1], document.getElementById('player-cards'));

        dealerHandValueDisplay.innerText = calculateHandValue([dealerHand[0]]);
        playerHandValueDisplay.innerText = calculateHandValue(playerHand);

        hitButton.disabled = false;
        standButton.disabled = false;
        betButton.disabled = true;
        doubleButton.disabled = balance < betAmount * 2 ? true : false;

        // Check if dealer has an Ace showing
        if (dealerHand[0].value === 'A' && balance >= betAmount / 2) {
            insuranceContainer.style.display = 'block';
        }

        gameMessage.innerText = '';

        if (calculateHandValue(playerHand) === 21) {
            endGame();
        }
    }

    function handleBet() {
        betAmount = parseInt(betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            gameMessage.innerText = 'Invalid bet!';
            return;
        }

        balance -= betAmount;
        balanceValue.innerText = balance;
        gameMessage.innerText = 'Bet placed!';
        startGame();
    }

    function handleInsurance() {
        // Insurance costs half the original bet
        insuranceAmount = betAmount / 2;
        
        if (balance < insuranceAmount) {
            gameMessage.innerText = 'Not enough balance for insurance!';
            return;
        }

        balance -= insuranceAmount;
        balanceValue.innerText = balance;
        hasInsurance = true;
        
        // Hide insurance option after selection
        insuranceContainer.style.display = 'none';
        
        gameMessage.innerText = 'Insurance purchased!';
    }

    function handleHit() {
        const newCard = dealCard();
        playerHand.push(newCard);
        displayCard(newCard, document.getElementById('player-cards'));
        playerHandValueDisplay.innerText = calculateHandValue(playerHand);

        // Disable double down after hitting
        doubleButton.disabled = true;
        
        // Hide insurance option after hitting
        insuranceContainer.style.display = 'none';

        if (calculateHandValue(playerHand) > 21) {
            endGame();
        }
    }

    function handleStand() {
        hitButton.disabled = true;
        standButton.disabled = true;
        doubleButton.disabled = true;
        insuranceContainer.style.display = 'none';

        // Reveal dealer's hidden card
        document.getElementById('dealer-cards').innerHTML = '';
        dealerHand.forEach(card => {
            displayCard(card, document.getElementById('dealer-cards'));
        });
        dealerHandValueDisplay.innerText = calculateHandValue(dealerHand);

        // Check insurance outcome
        if (hasInsurance && calculateHandValue(dealerHand) === 21) {
            balance += insuranceAmount * 3; // 2:1 payout
            balanceValue.innerText = balance;
            gameMessage.innerText = 'Insurance paid!';
        }

        // Dealer's turn
        while (calculateHandValue(dealerHand) < 17) {
            const newCard = dealCard();
            dealerHand.push(newCard);
            displayCard(newCard, document.getElementById('dealer-cards'));
            dealerHandValueDisplay.innerText = calculateHandValue(dealerHand);
        }

        endGame();
    }

    function handleDouble() {
        if (balance < betAmount) {
            gameMessage.innerText = 'Not enough balance to double down!';
            return;
        }

        // Double the bet
        balance -= betAmount;
        betAmount *= 2;
        balanceValue.innerText = balance;
        
        // Hide insurance option
        insuranceContainer.style.display = 'none';

        // Deal one more card to player
        const newCard = dealCard();
        playerHand.push(newCard);
        displayCard(newCard, document.getElementById('player-cards'));
        playerHandValueDisplay.innerText = calculateHandValue(playerHand);

        // Automatically stand after doubling
        if (calculateHandValue(playerHand) <= 21) {
            handleStand();
        } else {
            endGame();
        }
    }

    function determineWinner() {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        // Check for natural blackjack (21 with first two cards)
        const playerHasBlackjack = playerValue === 21 && playerHand.length === 2;
        const dealerHasBlackjack = dealerValue === 21 && dealerHand.length === 2;

        if (playerValue > 21) {
            addToHistory('loss', 'Player busted', betAmount);
            return 'Dealer wins!';
        } else if (dealerValue > 21) {
            const winAmount = betAmount * 2;
            balance += winAmount;
            balanceValue.innerText = balance;
            addToHistory('win', 'Dealer busted', winAmount - betAmount);
            return 'Player wins!';
        } else if (playerHasBlackjack && !dealerHasBlackjack) {
            // Blackjack pays 3:2
            const winAmount = betAmount * 2.5;
            balance += winAmount;
            balanceValue.innerText = balance;
            addToHistory('win', 'Player Blackjack', winAmount - betAmount);
            return 'Blackjack! Player wins!';
        } else if (dealerHasBlackjack && !playerHasBlackjack) {
            addToHistory('loss', 'Dealer Blackjack', betAmount);
            return 'Dealer has Blackjack!';
        } else if (playerHasBlackjack && dealerHasBlackjack) {
            balance += betAmount;
            balanceValue.innerText = balance;
            addToHistory('push', 'Both have Blackjack', 0);
            return 'Both have Blackjack! Push!';
        } else if (playerValue > dealerValue) {
            const winAmount = betAmount * 2;
            balance += winAmount;
            balanceValue.innerText = balance;
            addToHistory('win', `Player: ${playerValue} vs Dealer: ${dealerValue}`, winAmount - betAmount);
            return 'Player wins!';
        } else if (playerValue === dealerValue) {
            balance += betAmount;
            balanceValue.innerText = balance;
            addToHistory('push', `Tie: ${playerValue}`, 0);
            return 'Push!';
        } else {
            addToHistory('loss', `Player: ${playerValue} vs Dealer: ${dealerValue}`, betAmount);
            return 'Dealer wins!';
        }
    }

    function addToHistory(result, description, amount) {
        const timestamp = new Date().toLocaleTimeString();
        const record = {
            id: uuidv4(),
            timestamp: timestamp,
            result: result,
            description: description,
            betAmount: betAmount,
            amount: amount,
        };
        
        gameHistory.unshift(record); // Add to beginning of array
        
        // Keep only the last 10 games
        if (gameHistory.length > 10) {
            gameHistory.pop();
        }
        
        updateHistoryDisplay();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        gameHistory.forEach(game => {
            const li = document.createElement('li');
            li.classList.add(game.result);
            
            let amountText = '';
            if (game.result === 'win') {
                amountText = `+${game.amount}`;
            } else if (game.result === 'loss') {
                amountText = `-${game.betAmount}`;
            }
            
            li.innerHTML = `
                <span>${game.timestamp}</span> - 
                <strong>${game.description}</strong> 
                <span>${amountText}</span>
            `;
            
            historyList.appendChild(li);
        });
    }

    function toggleHistory() {
        if (gameHistoryContainer.style.display === 'none') {
            gameHistoryContainer.style.display = 'block';
            toggleHistoryButton.textContent = 'Hide History';
        } else {
            gameHistoryContainer.style.display = 'none';
            toggleHistoryButton.textContent = 'Show History';
        }
    }

    function endGame() {
        hitButton.disabled = true;
        standButton.disabled = true;
        doubleButton.disabled = true;
        insuranceContainer.style.display = 'none';
        betButton.disabled = false;
        gameEnded = true;

        // Show dealer's hidden card
        document.getElementById('dealer-cards').innerHTML = '';
        dealerHand.forEach(card => {
            displayCard(card, document.getElementById('dealer-cards'));
        });
        dealerHandValueDisplay.innerText = calculateHandValue(dealerHand);

        const result = determineWinner();
        gameMessage.innerText = result;

        gamesPlayed++;
        if (gamesPlayed % 3 === 0) {
            // Commented out for local testing
            //showAd();
            /*
            // Add credits directly for local testing
            balance += 10;
            balanceValue.innerText = balance;
            alert('You earned 10 extra credits!'); */

     
    // Function commented out for local testing
    function showAd() {
        show_9108066().then(() => {
            // Add extra credits after watching the ad
            balance += 10;
            balanceValue.innerText = balance;
            alert('You earned 10 extra credits for watching the ad!');
        }).catch((error) => {
            console.error('Error showing ad:', error);
        });
    }

            }
    }
            
    betButton.addEventListener('click', handleBet);
    hitButton.addEventListener('click', handleHit);
    standButton.addEventListener('click', handleStand);
    doubleButton.addEventListener('click', handleDouble);
    insuranceButton.addEventListener('click', handleInsurance);
    toggleHistoryButton.addEventListener('click', toggleHistory);
});

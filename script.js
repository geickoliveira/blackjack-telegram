import { v4 as uuidv4 } from 'uuid';

Telegram.WebApp.ready();

document.addEventListener('DOMContentLoaded', () => {
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let gameEnded = false;
    let balance = 100;
    let betAmount = 10;
    let gamesPlayed = 0;

    const balanceValue = document.getElementById('balance-value');
    const betAmountInput = document.getElementById('bet-amount');
    const betButton = document.getElementById('bet-button');
    const dealButton = document.getElementById('deal-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const dealerHandValueDisplay = document.getElementById('dealer-hand-value');
    const playerHandValueDisplay = document.getElementById('player-hand-value');
    const gameMessage = document.getElementById('game-message');

    function createDeck() {
        const suits = ["Copas", "Ouros", "Paus", "Espadas"];
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
            case "Copas":
                return "♥";
            case "Ouros":
                return "♦";
            case "Paus":
                return "♣";
            case "Espadas":
                return "♠";
            default:
                return "";
        }
    }

    function getSuitColor(suit) {
        switch (suit) {
            case "Copas":
            case "Ouros":
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

        dealerHandValueDisplay.innerText = calculateHandValue(dealerHand);
        playerHandValueDisplay.innerText = calculateHandValue(playerHand);

        hitButton.disabled = false;
        standButton.disabled = false;
        dealButton.disabled = true;
        betButton.disabled = true;

        gameMessage.innerText = '';

        if (calculateHandValue(playerHand) === 21) {
            endGame();
        }
    }

    function handleBet() {
        betAmount = parseInt(betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
            gameMessage.innerText = 'Aposta inválida!';
            return;
        }

        balance -= betAmount;
        balanceValue.innerText = balance;
        gameMessage.innerText = 'Aposta realizada!';
        startGame();
    }

    function handleHit() {
        const newCard = dealCard();
        playerHand.push(newCard);
        displayCard(newCard, document.getElementById('player-cards'));
        playerHandValueDisplay.innerText = calculateHandValue(playerHand);

        if (calculateHandValue(playerHand) > 21) {
            endGame();
        }
    }

    function handleStand() {
        while (calculateHandValue(dealerHand) < 17) {
            const newCard = dealCard();
            dealerHand.push(newCard);
            displayCard(newCard, document.getElementById('dealer-cards'));
            dealerHandValueDisplay.innerText = calculateHandValue(dealerHand);
        }

        endGame();
    }

    function determineWinner() {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        if (playerValue > 21) {
            return 'Dealer venceu!';
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            balance += betAmount * 2;
            balanceValue.innerText = balance;
            return 'Jogador venceu!';
        } else if (playerValue === dealerValue) {
            balance += betAmount;
            balanceValue.innerText = balance;
            return 'Empate!';
        } else {
            return 'Dealer venceu!';
        }
    }

    function endGame() {
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.disabled = false;
        betButton.disabled = false;
        gameEnded = true;

        const result = determineWinner();
        gameMessage.innerText = result;

        gamesPlayed++;
        if (gamesPlayed % 3 === 0) {
            showAd();
        }
    }


    // Rewarded interstitial
        
show_9108066().then(() => {
	 function showAd() {
        Telegram.WebApp.showAlert("Assista a um anúncio para ganhar créditos extras!", () => {
            balance += 10;
            balanceValue.innerText = balance;
        });
    }
    // You need to add your user reward function here, which will be executed after the user watches the ad.
    // For more details, please refer to the detailed instructions.
    alert('You have seen an ad!');
})

    betButton.addEventListener('click', handleBet);
    dealButton.addEventListener('click', startGame);
    hitButton.addEventListener('click', handleHit);
    standButton.addEventListener('click', handleStand);
});
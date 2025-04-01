# Blackjack Game

A sleek, elegant Blackjack game built with HTML, CSS, and JavaScript. The game features a responsive design with a classic casino theme using dark green and gold colors.

![Blackjack Game Screenshot](blackjack_screenshot.png)

## Features

- Classic Blackjack gameplay
- Responsive design that works on desktop and mobile
- Elegant casino-style UI with green and gold theme
- Game options:
  - Hit
  - Stand
  - Double Down
  - Insurance (when dealer shows an Ace)
- Blackjack pays 3:2
- Game history tracking
- Dealer stands on soft 17
- Adjustable bet amounts
- Automatic credit rewards

## How to Play

1. Set your bet amount using the input field
2. Click "Bet" to place your bet and start the game
3. Choose your action: "Hit", "Stand", or "Double Down"
4. If the dealer shows an Ace, you'll have the option to buy "Insurance"
5. The game will automatically determine the winner
6. View your game history by clicking the "Show History" button

## Rules

- The goal is to get a hand value closer to 21 than the dealer without going over
- Cards 2-10 are worth their face value
- Jack, Queen, and King are worth 10
- Ace can be worth 1 or 11, whichever is more beneficial
- A "Blackjack" (an Ace and a 10-value card) on the first two cards pays 3:2
- The dealer must hit until they have at least 17
- If both player and dealer bust, the dealer wins
- If the player and dealer have the same total, it's a push (tie)
- Double Down allows you to double your bet and receive exactly one more card

## Technical Details

- Built with vanilla JavaScript, HTML5, and CSS3
- SVG-based card rendering
- No external libraries (except UUID for generating unique IDs)
- Fully responsive design
- Maintains game history

## Local Development

1. Clone the repository
2. Navigate to the project directory
3. Run a local server (e.g., `node server.js`)
4. Open `http://localhost:3000` in your browser

## Credits

Created as a project to demonstrate modern web development techniques and to provide an enjoyable classic card game experience. 
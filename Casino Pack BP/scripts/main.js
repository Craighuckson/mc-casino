import { system, world, BlockPermutation, Block, Player, BlockType } from '@minecraft/server';

import { ModalFormData } from '@minecraft/server-ui';

var player = world.getAllPlayers()[0];

// Displays "Hello, world!"
world.afterEvents.buttonPush.subscribe((bEvent) => {
    if (bEvent.block.permutation.matches("minecraft:polished_blackstone_button")) {
        initBaccarat();
    }
});

function initBaccarat() {
    //player.onScreenDisplay.setTitle("Welcome to Baccarat");

    const form = new ModalFormData()
        .title("Baccarat")
        .slider("Bet  Amount", 5, player.getTotalXp(), 5, 5)
        .dropdown("Bet On?", ["Player", "Banker", "Tie"], 1);

    form.show(player).then((formData) => {
        let betAmount = formData.formValues[0];
        if (formData.formValues[1] === 0) {
            var choice = 'Player';
        } else if (formData.formValues[1] === 1) {
            var choice = 'Banker';
        } else {
            var choice = 'Tie';
        }
        player.sendMessage(`You have ${player.getTotalXp()} XP`);
        player.sendMessage(`You bet ${betAmount} on ${choice}`)
        playBaccarat(betAmount, choice);
    });
}

function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    let deck = [];

    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return deck;
}

// Function to shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Function to deal cards
function dealCards(deck) {
    return [deck.pop(), deck.pop()];
}

function dealCard(deck, hand) {
    return hand.push(deck.pop());
}

// Function to calculate the score of a hand
function calculateScore(hand) {
    let score = 0;
    for (let card of hand) {
        let value = card.value;
        if (value === 'Ace') {
            score += 1;
        } else if (['Jack', 'Queen', 'King'].includes(value)) {
            score += 0;
        } else {
            score += parseInt(value);
        }
    }
    return score % 10;
}

// Function to determine the winner
/**
* @param {[string,string]} playerHand
* @param {any[]} bankerHand
*/
function determineWinner(playerHand, bankerHand) {
    const playerScore = calculateScore(playerHand);
    const bankerScore = calculateScore(bankerHand);
    player.sendMessage(`Player score is ${JSON.stringify(playerScore)}`);
    player.sendMessage(`Banker score is ${JSON.stringify(bankerScore)}`);
    if (playerScore > bankerScore) {
        return 'Player';
    } else if (playerScore < bankerScore) {
        return 'Banker';
    } else {
        return 'Tie';
    }
}

// Main game function
/**
* @param {string | number | boolean} wager
* @param {string} pick
*/
function playBaccarat(wager, pick) {
    let deck = createDeck();
    deck = shuffleDeck(deck);
    const playerHand = dealCards(deck);
    const bankerHand = dealCards(deck);
    const firstPlayerCard = playerHand[0];
    const secondPlayerCard = playerHand[1];
    const firstBankerCard = bankerHand[0];
    const secondBankerCard = bankerHand[1];
    player.sendMessage(`Players hand is ${firstPlayerCard.value} of ${firstPlayerCard.suit}, ${secondPlayerCard.value} of ${secondPlayerCard.suit}`)
    player.sendMessage(`Bankers hand is ${firstBankerCard.value} of ${firstBankerCard.suit}, ${secondBankerCard.value} of ${secondBankerCard.suit}`)
    const winner = determineWinner(playerHand, bankerHand);
    player.sendMessage(winner);
}

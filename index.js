const { cardData } = require('./data/cardData.js');

class Card {
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
  }
}

class CardPool {
  constructor() {
    this.cards = cardData.map(card => {
      return new Card(card);
    });
    this.length = this.cards.length;
  }

  getRandom() {
    const rnd = Math.floor(Math.random() * this.length);
    return this.cards[rnd];
  }
}

class Game {
  constructor(players) {
    this.players = players;
    this.turn = 0; // index of player
    this.pool = new CardPool();
    this.deckSize = 60;
  }

  getRandomPlayer() {
    return Math.floor(Math.random() * this.players.length);
  }

  createDecks() {
    for (let i = 0; i < this.deckSize; i++) {
      for (let p = 0; p < this.players.length; p++) {
        const player = this.players[p];
        player.deck.push(this.pool.getRandom());
      }
    }
  }

  drawCards(startingPlayerIndex) {
    for (let p = 0; p < this.players.length; p++) {
      const player = this.players[p];
      const drawCardsNumber = p === startingPlayerIndex ? 7 : 8;
      for (let i = 0; i < drawCardsNumber; i++) {
        player.hand.push(player.deck.pop());
      }
    }
  }

  startGame() {
    this.createDecks();
    this.drawCards(this.getRandomPlayer());
  }
}

class Player {
  constructor() {
    this.life = 20;
    this.deck = [];
    this.hand = [];
  }
}

const playerA = new Player();
const playerB = new Player();

const game = new Game([playerA, playerB]);

game.startGame();

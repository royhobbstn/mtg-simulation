const { cardData } = require('./data/cardData.js');
const { v4: uuidv4 } = require('uuid');

class Card {
  constructor(obj) {
    for (let key of Object.keys(obj)) {
      this[key] = obj[key];
    }
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
    const card = JSON.parse(JSON.stringify(this.cards[rnd]));
    card.uuid = uuidv4();
    return card;
  }
}

class Game {
  constructor(players) {
    this.players = players;
    this.turn = 0; // index of player
    this.pool = new CardPool();
    this.libraryCardCount = 60;
  }

  getRandomPlayer() {
    return Math.floor(Math.random() * this.players.length);
  }

  createLibraries() {
    for (let i = 0; i < this.libraryCardCount; i++) {
      for (let p = 0; p < this.players.length; p++) {
        const player = this.players[p];
        player.library.push(this.pool.getRandom());
      }
    }
  }

  drawCards(startingPlayerIndex) {
    for (let p = 0; p < this.players.length; p++) {
      const player = this.players[p];
      const drawCardsNumber = p === startingPlayerIndex ? 7 : 8;
      for (let i = 0; i < drawCardsNumber; i++) {
        player.hand.push(player.library.pop());
      }
    }
  }

  multiplePlayersAreStillAlive() {
    let playerCount = 0;
    for (let player of this.players) {
      if (player.life > 0) {
        playerCount++;
      }
    }
    return playerCount > 1;
  }

  getNextPlayerTurn() {
    let updated = false;
    do {
      this.turn++;
      if (this.turn >= this.players.length) {
        this.turn = 0;
      }
      if (this.players[this.turn].life > 0) {
        updated = true;
      }
    } while (updated === false);
  }

  playerTurn() {
    // figure out who's turn it is next
    this.getNextPlayerTurn();

    const player = this.players[this.turn];

    // start untap phase
    player.board.untap(this.turn);
    // start draw phase
    player.drawPhase(this.turn);

    // start main phase
    player.mainPhase(this.turn);

    player.discardPhase(this.turn);
  }

  startGame() {
    this.createLibraries();
    this.turn = this.getRandomPlayer();
    this.drawCards(this.turn);
    // -----game-loop--------
    let preventInfinite = 0;
    while (this.multiplePlayersAreStillAlive()) {
      preventInfinite++;
      if (preventInfinite > 1000000) {
        throw new Error('breaking infinite loop');
      }
      //
      this.playerTurn();
    }
  }
}

class Board {
  constructor() {
    this.lands = [];
    this.creatures = [];
    this.enchantments = [];
    this.artifacts = [];
  }

  untap(playerId) {
    this.lands.forEach(land => {
      if (land.tapped) {
        console.log(`${playerId}: untapped ${land.name}`);
      }
      land.tapped = false;
    });
  }
}

class Player {
  constructor() {
    this.life = 20;
    this.lostBecause = '';
    this.library = [];
    this.hand = [];
    this.graveyard = [];
    this.exile = [];
    this.board = new Board();
    this.manaPool = { red: 0, blue: 0, black: 0, white: 0, green: 0, colorless: 0 };
  }

  discardPhase(playerId) {
    if (this.life <= 0) {
      return;
    }

    if (this.hand.length > 7) {
      // DECISION POINT
      // choose random card to discard
      this.graveyard.push(this.hand.pop());
      console.log(`${playerId}: discarded card`);
    }
  }

  mainPhase(playerId) {
    if (this.life <= 0) {
      return;
    }

    // DECISION POINT
    this.findRandomLandToPlay(playerId);

    // DECISION POINT
    this.findRandomCardToPlay(playerId);
  }

  findRandomCardToPlay(playerId) {
    if (this.life <= 0) {
      return;
    }
    //
  }

  findRandomLandToPlay(playerId) {
    const card = this.hand.find(c => {
      return c.type === 'basic land';
    });
    if (card) {
      this.hand = this.hand.filter(c => {
        return c.uuid !== card.uuid;
      });
      this.board.lands.push(card);
      console.log(`${playerId}: playing ${card.name}`);
    } else {
      console.log(`${playerId}: no basic land to play`);
    }
  }

  drawPhase(playerId) {
    if (this.library.length === 0) {
      this.life = 0;
      this.lostBecause = 'Out of cards in library.';
      console.log(`${playerId}: LOST: ${this.lostBecause}`);
      return;
    }
    const newCard = this.library.pop();
    console.log(`${playerId}: draws ${newCard.name}`);
    this.hand.push(newCard);
  }

  modifyMana(manaObj) {
    ['red', 'blue', 'black', 'white', 'green', 'colorless'].forEach(mana => {
      if (manaObj[mana]) {
        this.manaPool[mana] += manaObj[mana];
      }
    });
  }
}

const playerA = new Player();
const playerB = new Player();

const game = new Game([playerA, playerB]);

game.startGame();

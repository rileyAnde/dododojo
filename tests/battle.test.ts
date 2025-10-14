import { Card, Battle } from '../battle';
import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

describe('Battle Tests', () => {
    let xmlCards: any[];

    beforeAll(() => {
        // Load cards from XML
        const xmlData = readFileSync('./resources/cards.xml', 'utf-8');
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            textNodeName: "#text"
        });
        const result = parser.parse(xmlData);
        xmlCards = result.cards.card;
    });

    function createCard(xmlCard: any): Card {
        return new Card(
            parseInt(xmlCard['@_id']),
            xmlCard.type,
            parseInt(xmlCard.level),
            xmlCard.color,
            xmlCard.fx || ''
        );
    }

    test('Winner determination', () => {
        const battle = new Battle('player1', 'player2');
        
        // Test same type, different ranks
        const card1 = new Card(1, 'fire', 5, 'blue', '');
        const card2 = new Card(2, 'fire', 3, 'red', '');
        expect(battle.winner(card1, card2)).toBe(card1);
        
        // Test type advantages
        const card3 = new Card(3, 'water', 1, 'green', '');
        const card4 = new Card(4, 'fire', 5, 'yellow', '');
        expect(battle.winner(card3, card4)).toBe(card3);
    });

    test('Win condition: Five cards of same type, different colors', () => {
        const battle = new Battle('player1', 'player2');
        const fireCards = xmlCards
            .filter(card => card.type === 'fire')
            .filter((card, index, self) => 
                index === self.findIndex(c => c.color === card.color)
            )
            .slice(0, 5)
            .map(createCard);

        console.log('Selected fire cards:', fireCards);

        // Simulate player winning these cards by feeding them into .turn with enemy cards that will lose
        // We'll choose enemy cards that lose to the fire cards (use low-rank or losing type)
        fireCards.forEach((card, i) => {
            const before = battle.getState();
            console.log(`Before turn ${i}:`, before.player_won.map(a => a.length));
            // enemy uses the same type (fire) but lower rank, so player wins by rank
            const enemy = new Card(1000 + i, card.type, 0, 'black', '');
            battle.turn(card, enemy);
            const after = battle.getState();
            console.log(` After turn ${i}:`, after.player_won.map(a => a.length));
        });

        // Log the player's won cards
        console.log('Player won cards:', battle['player_won']);

        expect(battle.checkwin()).toBe(1);
    });

    test('Win condition: Five cards of different types, different colors', () => {
        const battle = new Battle('player1', 'player2');
        
        // Get one card of each type with different colors
        const types = ['water', 'ice', 'fire', 'air', 'earth'];
        const cards = types.map((type, index) => {
            const card = xmlCards.find(c => 
                c.type === type && 
                !xmlCards.slice(0, index).some(prevCard => prevCard.color === c.color)
            );
            return createCard(card);
        });

        // Simulate player winning these cards by feeding them into .turn with enemy cards that will lose
        cards.forEach((card, i) => {
            const before = battle.getState();
            console.log(`Before turn ${i}:`, before.player_won.map(a => a.length));
            // Choose an enemy card that will lose to this card's type: create a low-rank same-type card
            const enemy = new Card(2000 + i, card.type, 0, 'black', '');
            battle.turn(card, enemy);
            const after = battle.getState();
            console.log(` After turn ${i}:`, after.player_won.map(a => a.length));
        });

        expect(battle.checkwin()).toBe(1);
    });

    test('No win condition met', () => {
        const battle = new Battle('player1', 'player2');
        
        // Get four cards of same type, different colors
        const fireCards = xmlCards
            .filter(card => card.type === 'fire')
            .filter((card, index, self) => 
                index === self.findIndex(c => c.color === card.color)
            )
            .slice(0, 4)
            .map(createCard);

        // Simulate player winning these cards via turns (enemy will lose)
        fireCards.forEach((card, i) => {
            const before = battle.getState();
            console.log(`Before turn ${i}:`, before.player_won.map(a => a.length));
            const enemy = new Card(3000 + i, card.type, 0, 'black', '');
            battle.turn(card, enemy);
            const after = battle.getState();
            console.log(` After turn ${i}:`, after.player_won.map(a => a.length));
        });

        expect(battle.checkwin()).toBe(0);
    });

    test('Enemy win: Five cards of same type, different colors', () => {
        const battle = new Battle('player1', 'player2');
        // Enemy will win five rounds and collect five 'ice' cards of different colors
        const colors = ['blue', 'red', 'green', 'yellow', 'purple'];
        for (let i = 0; i < 5; i++) {
            const before = battle.getState();
            console.log(`Enemy test - before turn ${i}:`, before.enemy_won.map(a => a.length));
            // player plays water (which loses to ice), enemy plays ice
            const player = new Card(5000 + i, 'water', 1, 'black', '');
            const enemy = new Card(6000 + i, 'ice', 1, colors[i], '');
            battle.turn(player, enemy);
            const after = battle.getState();
            console.log(` Enemy test - after turn ${i}:`, after.enemy_won.map(a => a.length));
        }

        expect(battle.checkwin()).toBe(2);
    });

    test('Close game: mixed wins and losses, no winner', () => {
        const battle = new Battle('player1', 'player2');
        const rounds = [
            { p: new Card(7001, 'fire', 2, 'blue', ''), e: new Card(8001, 'ice', 1, 'black', '') }, // player wins (fire > ice)
            { p: new Card(7002, 'water', 1, 'red', ''), e: new Card(8002, 'earth', 2, 'black', '') }, // enemy wins (earth > water)
            { p: new Card(7003, 'air', 1, 'green', ''), e: new Card(8003, 'fire', 2, 'black', '') }, // enemy wins (fire > air)
            { p: new Card(7004, 'ice', 2, 'yellow', ''), e: new Card(8004, 'earth', 1, 'black', '') } // player wins (ice > earth)
        ];

        rounds.forEach((r, i) => {
            const before = battle.getState();
            console.log(`Close game - before turn ${i}:`, before.player_won.map(a => a.length), before.enemy_won.map(a => a.length));
            battle.turn(r.p, r.e);
            const after = battle.getState();
            console.log(` Close game - after turn ${i}:`, after.player_won.map(a => a.length), after.enemy_won.map(a => a.length));
        });

        expect(battle.checkwin()).toBe(0);
    });
});
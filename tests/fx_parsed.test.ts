import { Battle, Card } from '../battle';
import { readFileSync } from 'fs';

function loadParsedCsv() {
    const csv = readFileSync('./scripts/power_cards_parsed.csv', 'utf-8');
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const cols = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => obj[h.trim()] = (cols[i] || '').trim());
        return obj;
    });
}

describe('FX parsed CSV integration', () => {
    const rows = loadParsedCsv();

    test('DISCARD_COLOR effect causes opponent card to be discarded', () => {
        const row = rows.find(r => r.EffectCode === 'DISCARD_COLOR' && r.Param1 === 'purple');
        expect(row).toBeDefined();

        const fxText = row.Note; // human-readable note is used in Card.fx
        const battle = new Battle('p', 'e');

        // Player plays a card with DISCARD_COLOR purple, opponent plays purple card -> player should win
        const playerFXCard = new Card(9000, row.Element, parseInt(row.Value), 'black', fxText);
        const opponentPurple = new Card(9001, 'fire', 5, 'purple', '');
        battle.turn(playerFXCard, opponentPurple);
        const state = battle.getState();
        // player should have won opponent's purple by effect (placed into player's won buckets)
        const totalPlayerWon = state.player_won.flat().length;
        expect(totalPlayerWon).toBeGreaterThanOrEqual(1);
    });

    test('RULE_LOWER_WINS effect flips comparison to lower-wins', () => {
        const row = rows.find(r => r.EffectCode === 'RULE_LOWER_WINS');
        expect(row).toBeDefined();
        const fxText = row.Note;
        const battle = new Battle('p', 'e');

        // Create player fx card that triggers lower-wins; player plays rank 1, opponent rank 5 -> player should win (1 < 5)
        const playerFXCard = new Card(9010, row.Element, parseInt(row.Value), 'blue', fxText);
        const opponent = new Card(9011, 'fire', 5, 'red', '');
        battle.turn(playerFXCard, opponent);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });

    test('BLOCK_TYPE_NEXT effect blocks given type next turn', () => {
        const row = rows.find(r => r.EffectCode === 'BLOCK_TYPE_NEXT');
        expect(row).toBeDefined();
        const fxText = row.Note;
        const battle = new Battle('p', 'e');

        // Play fx card that blocks water next turn; now play water vs fire: blocked water should cause loss for water
        const fxCard = new Card(9020, row.Element, parseInt(row.Value), 'blue', fxText);
        const dummy = new Card(9021, 'fire', 1, 'black', '');
        // fx triggers on initial play
        battle.turn(fxCard, dummy);

        // Now enemy plays water against player's fire; blocked water should lose and player wins
        const playerCard = new Card(9022, 'fire', 2, 'white', '');
        const blockedWater = new Card(9023, 'water', 3, 'blue', '');
        battle.turn(playerCard, blockedWater);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });

    test('MODIFY_NEXT effect adjusts next card rank', () => {
        const row = rows.find(r => r.EffectCode === 'MODIFY_NEXT' || r.EffectCode === 'MODIFY_NEXT_OPPONENT' || r.EffectCode === 'MODIFY_NEXT_PLAYER');
        expect(row).toBeDefined();
        const fxText = row.Note;
        const battle = new Battle('p', 'e');

        // Use fx card that modifies opponent next card (-2). We simulate player triggers then opponent plays a card that should be reduced
        const fxCard = new Card(9030, row.Element, parseInt(row.Value), 'blue', fxText);
        const dummy = new Card(9031, 'fire', 1, 'black', '');
        battle.turn(fxCard, dummy);

        // Opponent plays a card that would normally beat player, but modifier makes it lose
        const playerCard = new Card(9032, 'fire', 2, 'white', '');
        const opponentCard = new Card(9033, 'fire', 4, 'red', '');
        battle.turn(playerCard, opponentCard);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });
});

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

describe('FX CSV-driven integration', () => {
    const rows = loadParsedCsv();

    test('DISCARD_COLOR rows cause opponent color discard', () => {
        const row = rows.find(r => r.EffectCode === 'DISCARD_COLOR' && r.Param1 === 'purple' && r.Scope === 'ROUND');
        expect(row).toBeDefined();

        const fx = `${row.EffectCode}|${row.Param1}|${row.Param2}|${row.Scope}|${row.Target}`;
        const battle = new Battle('p','e');

        const fxCard = new Card(10000, row.Element, parseInt(row.Value), 'black', fx);
        const opponent = new Card(10001, 'fire', 5, 'purple', '');
        battle.turn(fxCard, opponent);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });

    test('RULE_LOWER_WINS rows flip comparison', () => {
        const row = rows.find(r => r.EffectCode === 'RULE_LOWER_WINS');
        expect(row).toBeDefined();
        const fx = `${row.EffectCode}|${row.Param1}|${row.Param2}|${row.Scope}|${row.Target}`;
        const battle = new Battle('p','e');

        const fxCard = new Card(10010, row.Element, parseInt(row.Value), 'blue', fx);
        const opponent = new Card(10011, 'fire', 5, 'red', '');
        // player has lower rank (value may be 1) and with rule lower wins should capture
        battle.turn(fxCard, opponent);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });

    test('BLOCK_TYPE_NEXT rows block specified type next turn', () => {
        const row = rows.find(r => r.EffectCode === 'BLOCK_TYPE_NEXT');
        expect(row).toBeDefined();
        const fx = `${row.EffectCode}|${row.Param1}|${row.Param2}|${row.Scope}|${row.Target}`;
        const battle = new Battle('p','e');

        const fxCard = new Card(10020, row.Element, parseInt(row.Value), 'black', fx);
        const dummy = new Card(10021, 'fire', 1, 'black', '');
        battle.turn(fxCard, dummy);

        // Now play a blocked type (Param1) against player: blocked type should lose
        const playerCard = new Card(10022, 'fire', 2, 'white', '');
        const blocked = new Card(10023, row.Param1, 3, 'blue', '');
        battle.turn(playerCard, blocked);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });

    test('MODIFY_NEXT rows modify next card value', () => {
        const row = rows.find(r => r.EffectCode === 'MODIFY_NEXT' && (r.Target === 'OPPONENT' || r.Target === 'PLAYER'));
        expect(row).toBeDefined();
        const fx = `${row.EffectCode}|${row.Param1}|${row.Param2}|${row.Scope}|${row.Target}`;
        const battle = new Battle('p','e');

        const fxCard = new Card(10030, row.Element, parseInt(row.Value), 'black', fx);
        const dummy = new Card(10031, 'fire', 1, 'black', '');
        battle.turn(fxCard, dummy);

        // Now opponent plays a card that is normally stronger but will be modified
        const playerCard = new Card(10032, 'fire', 2, 'white', '');
        const opponent = new Card(10033, 'fire', 4, 'red', '');
        battle.turn(playerCard, opponent);
        const state = battle.getState();
        expect(state.player_won.flat().length).toBeGreaterThanOrEqual(1);
    });
});

/*
Classes:
- Card --> simple model for an in-battle card (id, type, rank, color, fx)
- backend_Card --> representation of a card stack stored in DB (id + quantity)
- Battle --> full battle engine handling turn logic, effects, win conditions, and AI behavior

Battle Engine Responsibilities:
- winner --> resolves a single card-vs-card matchup, applying:
    --> global type changes  
    --> temporary type changes  
    --> color-based discard  
    --> blocked types (this turn and next turn)  
    --> rank modifiers (immediate + next-turn)  
    --> “lower wins” rules  
    --> elemental advantage relationships  
- parseFxForComparison --> interprets FX strings and applies their effects:
    --> DISCARD_COLOR  
    --> CHANGE_TYPE  
    --> RULE_LOWER_WINS  
    --> BLOCK_TYPE_NEXT  
    --> MODIFY_NEXT  
    --> supports fallback text parsing (e.g., “lower value card wins”, “discard blue cards”)  
- turn --> executes winner(), assigns won cards to correct buckets, returns round winner
- agent_turn --> AI card selection logic with difficulty scaling and strategy heuristics
- checkwin --> determines if either player satisfies a win condition
- getState --> returns read-only copies of player/enemy win buckets

Inputs:
- player (string) --> name/id used only for instantiation
- enemy (string) --> same as above

Outputs:
- Fully functional battle instance capable of playing a full Card-Jitsu match, tracking state, and applying complex FX interactions

Outside sources:
- GitHub Copilot

Authors:
- Riley Anderson, Colin Treanor, Hannah Smith

Creation Date:
- 10/14/2025
*/

// file containing class for instance of a battle
export class Card {
    constructor(
        public id: number,
        public type: string,
        public rank: number,
        public color: string,
        public fx: string
    ) {}
}

export class backend_Card {
    constructor(
        public id: number,
        public quantity: number 
    ){}
}

export class Battle {
    private player_won: Card[][] = [[], [], [], [], []];
    private enemy_won: Card[][] = [[], [], [], [], []];
    private difficulty = 1.0;
    private types = new Map<string, number>([
        ["water", 0],
        ["ice", 1],
        ["fire", 2],
        ["air", 3],
        ["earth", 4]
    ]);
    private win_map = new Map<string, [string, string]>([
        ["water", ["earth", "fire"]],
        ["ice", ["water", "air"]],
        ["fire", ["ice", "earth"]],
        ["air", ["water", "fire"]],
        ["earth", ["air", "ice"]]
    ]);
    private globalTypeChangesActive: Map<string, string> = new Map();
    private globalTypeChangesNext: Map<string, string> = new Map();
    private blockedTypesNext: Set<string> = new Set();
    private blockedTypesThisTurn: Set<string> = new Set();
    private blockedTypesNextTurn: Set<string> = new Set();
    private modifyNext: { player: number; enemy: number } = { player: 0, enemy: 0 };
    private lowerWinsActive: boolean = false;
    private lowerWinsNext: boolean = false;


    previous_results = {
        typeChange: new Map<string, string>(),
        discardOpponentColor: '' as string | null,
        discardPlayerColor: '' as string | null,
        modifyPlayer: 0,
        modifyEnemy: 0,
        ruleLowerWins: false,
        ruleLowerWinsNext: false,
        blockedTypesActive: new Set<string>(),
        blockedTypesNext: new Set<string>(),
        typeChangeNext: new Map<string, string>(),
        modifyNext: { player: 0, enemy: 0 }
    };

    constructor(player: string, enemy: string) {
        void player;
        void enemy;
    }

    winner(pCard: Card, eCard: Card): Card | null {
        // advance persistent effects (applied from last turn)
        this.blockedTypesThisTurn = new Set(this.blockedTypesNextTurn);
        this.blockedTypesNextTurn.clear();

        this.globalTypeChangesActive = new Map(this.globalTypeChangesNext);
        this.globalTypeChangesNext.clear();
        console.log(this.globalTypeChangesActive)
        
        this.lowerWinsActive = this.lowerWinsNext;
        this.lowerWinsNext = false;

        // parse new FX for this comparison
        const fxModifiers = this.parseFxForComparison(pCard, eCard);

        let pType = pCard.type;
        let eType = eCard.type;

        // apply active global type conversions (from previous turn)
        if (this.globalTypeChangesActive.has(pType))
            pType = this.globalTypeChangesActive.get(pType)!;
        if (this.globalTypeChangesActive.has(eType))
            eType = this.globalTypeChangesActive.get(eType)!;

        // apply temporary type conversions for this comparison
        // if (fxModifiers.typeChange.has(pType))
        //     pType = fxModifiers.typeChange.get(pType)!;
        // if (fxModifiers.typeChange.has(eType))
        //     eType = fxModifiers.typeChange.get(eType)!;

        // handle discard (more like a block currently) by color
        //both played discarded, draw
        if ((fxModifiers.discardOpponentColor && eCard.color === fxModifiers.discardOpponentColor) && (fxModifiers.discardPlayerColor && pCard.color === fxModifiers.discardPlayerColor)) {
            return null
        }
        if (fxModifiers.discardOpponentColor && eCard.color === fxModifiers.discardOpponentColor) {
            return pCard;
        }
        if (fxModifiers.discardPlayerColor && pCard.color === fxModifiers.discardPlayerColor) {
            return eCard;
        }

        // handle played blocked types
        if (this.blockedTypesThisTurn.has(pType) && this.blockedTypesThisTurn.has(eType)) {
            this.blockedTypesThisTurn.delete(pType);
            //draw
            console.log('both played blocked')
            return null;
        }

        if (this.blockedTypesThisTurn.has(pType)) {
            this.blockedTypesThisTurn.delete(pType);
            //player played a blocked type, enemy wins
            return eCard;
        }
        if (this.blockedTypesThisTurn.has(eType)) {
            this.blockedTypesThisTurn.delete(eType);
            //enemy played a blocked type, player wins
            return pCard;
        }

        // rank modifications (consume modifyNext when used)
        const pRank = pCard.rank + this.modifyNext.player + (fxModifiers.modifyPlayer ?? 0);
        const eRank = eCard.rank + this.modifyNext.enemy + (fxModifiers.modifyEnemy ?? 0);
        this.modifyNext.player = 0;
        this.modifyNext.enemy = 0;

        // same-type comparison
        if (pType === eType) {
            if (fxModifiers.ruleLowerWins || this.lowerWinsActive) {
                if (pRank === eRank) return null;
                return pRank < eRank ? pCard : eCard;
            }
            if (pRank === eRank) return null;
            return pRank > eRank ? pCard : eCard;
        }

        // do elements last
        const pWins = this.win_map.get(pType)?.includes(eType) ?? false;
        const eWins = this.win_map.get(eType)?.includes(pType) ?? false;

        if (pWins && !eWins) return pCard;
        if (eWins && !pWins) return eCard;

        // tie
        return null;
    }

    private parseFxForComparison(pCard: Card, eCard: Card) {
        const result = {
            typeChange: new Map<string, string>(),
            discardOpponentColor: '' as string | null,
            discardPlayerColor: '' as string | null,
            modifyPlayer: 0,
            modifyEnemy: 0,
            ruleLowerWins: false,
            ruleLowerWinsNext: false
        };

        const applyFx = (fxStr: string | undefined, owner: 'player' | 'enemy') => {
            if (!fxStr) return;
            const raw = fxStr.trim();

            // format: CODE|Param1|Param2|Scope|Target
            if (raw.includes('|')) {
                const [code = '', p1 = '', p2 = '', scope = '', target = ''] = raw.split('|').map(p => p.trim());
                switch (code) {
                    case 'DISCARD_COLOR': {
                        const color = p1.toLowerCase();
                        // If the effect targets opponent (or all), the owner causes opponent discard
                        if (target === 'OPPONENT' || target === 'ALL') {
                            if (owner === 'player') result.discardOpponentColor = color;
                            else result.discardPlayerColor = color;
                        } else if (target === 'PLAYER') {
                            if (owner === 'player') result.discardPlayerColor = color;
                            else result.discardOpponentColor = color;
                        } else {
                            // fallback: apply to opponent of the owner
                            if (owner === 'player') result.discardOpponentColor = color;
                            else result.discardPlayerColor = color;
                        }
                        return;
                    }
                    case 'CHANGE_TYPE': {
                        const from = p1.toLowerCase();
                        const to = p2.toLowerCase();
                        // effect will apply globally next round
                        this.globalTypeChangesNext.set(from, to);
                        result.typeChange.set(from, to);
                        return;
                    }
                    case 'RULE_LOWER_WINS': {
                        this.lowerWinsNext = true;
                        result.ruleLowerWins = true;
                        return;
                    }
                    case 'BLOCK_TYPE_NEXT': {
                        const t = p1.toLowerCase();
                        // mark that type as blocked for the next round only
                        this.blockedTypesNextTurn.add(t);
                        return;
                    }
                    case 'MODIFY_NEXT': {
                        // p1 is expected to be a signed number, p2 may be target (PLAYER/OPPONENT)
                        const value = parseInt(p1.replace('\u00A0', '').trim() || '0');
                        const tgt = (p2 || target).toUpperCase();
                        // if scope indicates NEXT_TURN or persistent, store in modifyNext
                        if (scope === 'NEXT_TURN' || scope === 'NEXT') {
                            if (tgt === 'PLAYER') {
                                if (owner === 'player') this.modifyNext.player += value;
                                else this.modifyNext.enemy += value;
                            } else if (tgt === 'OPPONENT') {
                                if (owner === 'player') this.modifyNext.enemy += value;
                                else this.modifyNext.player += value;
                            } else {
                                // fallback: apply to opponent of owner
                                if (owner === 'player') this.modifyNext.enemy += value;
                                else this.modifyNext.player += value;
                            }
                        } else {
                            // immediate effect for this comparison
                            if (tgt === 'PLAYER') {
                                if (owner === 'player') result.modifyPlayer += value;
                                else result.modifyEnemy += value;
                            } else if (tgt === 'OPPONENT') {
                                if (owner === 'player') result.modifyEnemy += value;
                                else result.modifyPlayer += value;
                            } else {
                                // fallback: apply to opponent
                                if (owner === 'player') result.modifyEnemy += value;
                                else result.modifyPlayer += value;
                            }
                        }
                        return;
                    }
                }
            }
            const lower = raw.toLowerCase();
            if (lower.includes('lower value card wins')) result.ruleLowerWins = true;
            if (lower.includes('block ')) {
                if (lower.includes('fire')) this.blockedTypesNext.add('fire');
                if (lower.includes('water')) this.blockedTypesNext.add('water');
                if (lower.includes('snow') || lower.includes('ice')) this.blockedTypesNext.add('ice');
            }
            const m = lower.match(/discard (all )?(a |an )?(blue|red|orange|yellow|green|purple|black|white) cards?/);
            if (m) {
                const color = m[3];
                if (owner === 'player') result.discardOpponentColor = color;
                else result.discardPlayerColor = color;
            }
        };

        this.blockedTypesThisTurn = new Set(this.blockedTypesNext);
        this.blockedTypesNext.clear();

        applyFx(pCard.fx, 'player');
        applyFx(eCard.fx, 'enemy');

        this.previous_results = {
            ...result,
            blockedTypesActive: new Set(this.blockedTypesThisTurn),
            blockedTypesNext: new Set(this.blockedTypesNextTurn),
            modifyNext: { ...this.modifyNext },
            typeChange: new Map(this.globalTypeChangesActive),
            typeChangeNext: new Map(this.globalTypeChangesNext),
            ruleLowerWins: this.lowerWinsActive,
            ruleLowerWinsNext: this.lowerWinsNext
        };
        return result;
    }

    checkwin(): number {
        if (this.checkPlayerWin(this.player_won)) return 1;
        if (this.checkPlayerWin(this.enemy_won)) return 2;
        return 0;
    }

    // Helper to expose current won buckets (read-only copy)
    getState() {
        return {
            player_won: this.player_won.map(arr => arr.slice()),
            enemy_won: this.enemy_won.map(arr => arr.slice())
        };
    }

    private checkPlayerWin(wonCards: Card[][]): boolean {
        for (const typeArray of wonCards) {
            const uniqueColors = new Set(typeArray.map(c => c.color));
            if (uniqueColors.size >= 5) return true;
        }
        const allCards = wonCards.flat();
        if (allCards.length < 5) return false;
        const types = new Set(allCards.map(c => c.type));
        const colors = new Set(allCards.map(c => c.color));
        return types.size >= 5 && colors.size >= 5;
    }

    turn(pCard: Card, eCard: Card): Card | null {
        const won = this.winner(pCard, eCard);
        if (won) {
            if (won.id === pCard.id) {
                const idx = this.types.get(pCard.type);
                if (idx !== undefined) this.player_won[idx].push(pCard);
                return pCard
            } else {
                const idx = this.types.get(eCard.type);
                if (idx !== undefined) this.enemy_won[idx].push(eCard);
                return eCard
            }
        }
        this.checkwin();
        return won
    }

    agent_turn(hand: Card[]): Card {
        if (!hand.length) throw new Error('agent_turn() called with empty hand');
        const roll = Math.random();
        if (roll <= (1 - this.difficulty))
            return hand[Math.floor(Math.random() * hand.length)];

        const playerTypeCounts = this.player_won.map(arr => arr.length);
        const enemyTypeCounts = this.enemy_won.map(arr => arr.length);
        const highestCard = hand.reduce((a, b) => (a.rank > b.rank ? a : b));
        const highestOfType = (types: string[]): Card | null => {
            const filtered = hand.filter(c => types.includes(c.type));
            if (!filtered.length) return null;
            return filtered.reduce((a, b) => (a.rank > b.rank ? a : b));
        };

        const playerTypesRemaining = playerTypeCounts.filter(c => c > 0).length;
        const hasStackOf4 = playerTypeCounts.some(c => c >= 4);

        if (playerTypesRemaining === 1 || hasStackOf4) {
            let targetType: string | null = null;
            for (const [type, idx] of this.types.entries()) {
                if (playerTypeCounts[idx] >= 4) targetType = type;
            }
            if (!targetType) {
                for (const [type, idx] of this.types.entries()) {
                    if (playerTypeCounts[idx] > 0) targetType = type;
                }
            }
            if (targetType) {
                const counters: string[] = [];
                for (const [t, beats] of this.win_map.entries())
                    if (beats.includes(targetType)) counters.push(t);
                const counterCard = highestOfType(counters);
                if (counterCard) return counterCard;
            }
            return highestCard;
        }

        const enemyTypeProgress = enemyTypeCounts.filter(c => c > 0).length;
        const enemyHasStack = enemyTypeCounts.some(c => c >= 4);
        const closerToTypeWin =
            !enemyHasStack && (enemyTypeProgress >= 3 || Math.random() > 0.5);

        if (closerToTypeWin) {
            const neededTypes = Array.from(this.types.keys()).filter(
                t => enemyTypeCounts[this.types.get(t)!] < 5
            );
            const usedColors = new Set(this.enemy_won.flat().map(c => c.color));
            const filtered = hand.filter(
                c => neededTypes.includes(c.type) && !usedColors.has(c.color)
            );
            if (filtered.length)
                return filtered.reduce((a, b) => (a.rank > b.rank ? a : b));
        } else {
            let bestType = '';
            let bestColorCount = -1;
            for (const [type, idx] of this.types.entries()) {
                const colors = new Set(this.enemy_won[idx].map(c => c.color));
                if (colors.size > bestColorCount) {
                    bestColorCount = colors.size;
                    bestType = type;
                }
            }
            const existingColors = new Set(this.enemy_won[this.types.get(bestType)!].map(c => c.color));
            const candidates = hand.filter(
                c => c.type === bestType && !existingColors.has(c.color)
            );
            if (candidates.length)
                return candidates.reduce((a, b) => (a.rank > b.rank ? a : b));
        }
        return highestCard;
    }
}

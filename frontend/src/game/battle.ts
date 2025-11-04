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

export class Battle {
    private player_won: Card[][];
    private enemy_won: Card[][];
    private types: Map<string, number>;
    private win_map: Map<string, [string, string]>;
    private difficulty: number;
    // Persistent FX state (affects next turns)
    private blockedTypesNext: Set<string> = new Set();
    private modifyNext: { player: number; enemy: number } = { player: 0, enemy: 0 };

    constructor(player: string, enemy: string) {
        void player;
        void enemy;
        this.player_won = [[], [], [], [], []];
        this.enemy_won = [[], [], [], [], []];

        this.difficulty = 1.0; //1 is most optimal, 0 is always random

        // types indexes in win arrays
        this.types = new Map<string, number>();
        this.types.set("water", 0);
        this.types.set("ice", 1);
        this.types.set("fire", 2);
        this.types.set("air", 3);
        this.types.set("earth", 4);

        // map of key beats either in list
        this.win_map = new Map<string, [string, string]>();
        this.win_map.set("water", ["air", "fire"]);
        this.win_map.set("ice", ["water", "earth"]);
        this.win_map.set("fire", ["ice", "air"]);
        this.win_map.set("air", ["earth", "ice"]);
        this.win_map.set("earth", ["water", "fire"]);
    }

    winner(pCard: Card, eCard: Card): Card | null {
        // FX parsing returns immediate modifiers for this comparison and may set persistent next-turn effects
        const fxModifiers = this.parseFxForComparison(pCard, eCard);

        // Determine effective types for this comparison (allow temporary type changes)
        const pType = fxModifiers.typeChange.get(pCard.type) ?? pCard.type;
        const eType = fxModifiers.typeChange.get(eCard.type) ?? eCard.type;

        // Check if a card is discarded by color effect
        if (fxModifiers.discardOpponentColor && eCard.color === fxModifiers.discardOpponentColor) {
            return pCard;
        }
        if (fxModifiers.discardPlayerColor && pCard.color === fxModifiers.discardPlayerColor) {
            return eCard;
        }

        // Check blocked types applying from previous FX
        if (this.blockedTypesNext.has(pType)) {
            this.blockedTypesNext.delete(pType);
            return eCard;
        }
        if (this.blockedTypesNext.has(eType)) {
            this.blockedTypesNext.delete(eType);
            return pCard;
        }

        // Apply persistent modifyNext to this comparison (then consume)
        const pRank = pCard.rank + this.modifyNext.player + (fxModifiers.modifyPlayer ?? 0);
        const eRank = eCard.rank + this.modifyNext.enemy + (fxModifiers.modifyEnemy ?? 0);
        this.modifyNext.player = 0;
        this.modifyNext.enemy = 0;

        // If both types equal, apply rank-based resolution (possibly with lower-wins rule)
        if (pType === eType) {
            if (fxModifiers.ruleLowerWins) {
                if (pRank === eRank) return null;
                return pRank < eRank ? pCard : eCard;
            }
            if (pRank === eRank) return null;
            return pRank > eRank ? pCard : eCard;
        }

        // Otherwise use elemental advantage map (respecting temporary type changes)
        const pWins = this.win_map.get(pType)?.includes(eType) ?? false;
        if (pWins) return pCard;
        const eWins = this.win_map.get(eType)?.includes(pType) ?? false;
        if (eWins) return eCard;

        return null;
    }
    // Parse FX strings on both cards and return immediate modifiers for this comparison.
    private parseFxForComparison(pCard: Card, eCard: Card) {
        // Result object with defaults
        const result = {
            typeChange: new Map<string, string>(), // temporary mapping for this comparison
            discardOpponentColor: '' as string | null,
            discardPlayerColor: '' as string | null,
            modifyPlayer: 0,
            modifyEnemy: 0,
            ruleLowerWins: false
        };

        const applyFx = (fxStr: string | undefined, owner: 'player' | 'enemy') => {
            if (!fxStr) return;
            const raw = fxStr.trim();

            // Structured format: CODE|Param1|Param2|Scope|Target
            if (raw.includes('|')) {
                const parts = raw.split('|').map(p => p.trim());
                const code = parts[0] || '';
                const p1 = parts[1] || '';
                const p2 = parts[2] || '';
                const scope = parts[3] || '';
                const target = parts[4] || '';

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
                        // For the current implementation we apply type change for this comparison
                        result.typeChange.set(from, to);
                        return;
                    }
                    case 'RULE_LOWER_WINS': {
                        result.ruleLowerWins = true;
                        return;
                    }
                    case 'BLOCK_TYPE_NEXT': {
                        const t = p1.toLowerCase();
                        // persist a blocked type for the next turn(s)
                        this.blockedTypesNext.add(t);
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
                                else result.modifyPlayer += value;
                            } else if (tgt === 'OPPONENT') {
                                if (owner === 'player') result.modifyEnemy += value;
                                else result.modifyEnemy += value;
                            } else {
                                // fallback: apply to opponent
                                if (owner === 'player') result.modifyEnemy += value;
                                else result.modifyPlayer += value;
                            }
                        }
                        return;
                    }
                    default:
                        // unknown structured code: fallthrough to heuristics below
                        break;
                }
            }

            // Fallback: legacy free-text heuristics to preserve backward compatibility
            const lower = raw.toLowerCase();
            if (lower.includes('become') && lower.includes('water') && lower.includes('fire')) {
                result.typeChange.set('water', 'fire');
                return;
            }
            if (lower.includes('snow becomes water') || lower.includes('snow becomes water (for this round)')) {
                result.typeChange.set('snow', 'water');
                result.typeChange.set('ice', 'water');
                return;
            }
            if (lower.includes('lower value card wins') || lower.includes('lower value card wins this round')) {
                result.ruleLowerWins = true;
                return;
            }
            if (lower.includes('block fire cards next turn') || lower.includes('block water cards next turn') || lower.includes('block snow cards next turn')) {
                if (lower.includes('fire')) this.blockedTypesNext.add('fire');
                if (lower.includes('water')) this.blockedTypesNext.add('water');
                if (lower.includes('snow') || lower.includes('ice')) this.blockedTypesNext.add('ice');
                return;
            }
            if (lower.includes('next played card -2') || lower.includes('next played card 2')) {
                if (owner === 'player') this.modifyNext.enemy += -2;
                else this.modifyNext.player += -2;
                return;
            }
            if (lower.includes('next played card +2')) {
                if (owner === 'player') this.modifyNext.player += 2;
                else this.modifyNext.enemy += 2;
                return;
            }
            const m = lower.match(/discard (all )?(a |an )?(blue|red|orange|yellow|green|purple|black|white) cards?/);
            if (m) {
                const color = m[3];
                if (owner === 'player') result.discardOpponentColor = color;
                else result.discardPlayerColor = color;
                return;
            }
        };

        applyFx(pCard.fx, 'player');
        applyFx(eCard.fx, 'enemy');

        // After parsing, incorporate modifyNext persistent deltas into immediate modifiers
        if (this.modifyNext.player !== 0) {
            result.modifyPlayer += this.modifyNext.player;
            this.modifyNext.player = 0;
        }
        if (this.modifyNext.enemy !== 0) {
            result.modifyEnemy += this.modifyNext.enemy;
            this.modifyNext.enemy = 0;
        }

        return result;
    }

    checkwin(): number {
        // 0 is no winner, 1 is player, 2 is enemy
        
        // Check player's win conditions
        if (this.checkPlayerWin(this.player_won)) {
            return 1;
        }
        
        // Check enemy's win conditions
        if (this.checkPlayerWin(this.enemy_won)) {
            return 2;
        }
        
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
        // Check for five cards of one type with different colors
        for (const typeArray of wonCards) {
            if (typeArray.length >= 5) {
                const colorCounts = new Map<string, Card[]>();
                for (const card of typeArray) {
                    if (!colorCounts.has(card.color)) {
                        colorCounts.set(card.color, []);
                    }
                    colorCounts.get(card.color)?.push(card);
                }
                if (colorCounts.size === 5) {
                    return true;
                }
            }
        }

        // Check for five cards of different types with different colors
        const allCards = wonCards.flat();
        if (allCards.length >= 5) {
            const seen = new Set<string>();
            const differentTypesAndColors: Card[] = [];

            for (const card of allCards) {
                const key = `${card.type}-${card.color}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    differentTypesAndColors.push(card);
                    
                    const uniqueTypes = new Set(differentTypesAndColors.map(c => c.type));
                    const uniqueColors = new Set(differentTypesAndColors.map(c => c.color));
                    
                    if (uniqueTypes.size === 5 && uniqueColors.size === 5) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    turn(pCard: Card, eCard: Card): void {
        const won = this.winner(pCard, eCard);
        if (won !== null) {
            if (won.id === pCard.id) {
                // player won round
                const typeIndex = this.types.get(pCard.type);
                if (typeIndex !== undefined) {
                    this.player_won[typeIndex].push(pCard);
                    // player wins; card placed into player_won
                }
            } else {
                const typeIndex = this.types.get(eCard.type);
                if (typeIndex !== undefined) {
                    this.enemy_won[typeIndex].push(eCard);
                    // enemy wins; card placed into enemy_won
                }
            }
        } else {
            // tie or fx - no cards awarded
        }

        // checkwin is invoked to update internal status; tests can call checkwin() and use getState()
        this.checkwin();
    }

agent_turn(hand: Card[]): Card {
    // random or optimal (1 highest, 0 always random)
    const roll = Math.random();
    if (roll <= (1 - this.difficulty)) {
        // play random card
        return hand[Math.floor(Math.random() * hand.length)];
    }

    // assess player and enemy state
    const playerState = this.player_won.map(arr => arr.slice());
    const enemyState = this.enemy_won.map(arr => arr.slice());

    const playerTypeCounts = playerState.map(arr => arr.length);
    const enemyTypeCounts = enemyState.map(arr => arr.length);

    const highestCard = hand.reduce((a, b) => (a.rank > b.rank ? a : b));

    // highest-level card of any of given types
    const highestOfType = (types: string[]): Card | null => {
        const filtered = hand.filter(c => types.includes(c.type));
        if (filtered.length === 0) return null;
        return filtered.reduce((a, b) => (a.rank > b.rank ? a : b));
    };

    // check if player has one type remaining or stack of 4 of same type
    const playerTypesRemaining = playerTypeCounts.filter(c => c > 0).length;
    const hasStackOf4 = playerTypeCounts.some(c => c >= 4);

    if (playerTypesRemaining === 1 || hasStackOf4) {
        // identify which type player is close to winning with
        let targetType: string | null = null;
        for (const [type, idx] of this.types.entries()) {
            if (playerTypeCounts[idx] >= 4) {
                targetType = type;
                break;
            }
        }
        if (!targetType) {
            // fallback: the one remaining type
            for (const [type, idx] of this.types.entries()) {
                if (playerTypeCounts[idx] > 0) {
                    targetType = type;
                    break;
                }
            }
        }

        if (targetType) {
            // get which types beat this type using win_map (reverse lookup)
            const counters: string[] = [];
            for (const [t, beats] of this.win_map.entries()) {
                if (beats.includes(targetType)) counters.push(t);
            }

            // play highest counter-type card if available
            const counterCard = highestOfType(counters);
            if (counterCard) return counterCard;
        }

        // If no counter found, play highest level card
        return highestCard;
    }

    // step 4: If player has >1 type remaining
    // determine if bot is closer to multi-type or stacked-type win
    const enemyTypeProgress = enemyTypeCounts.filter(c => c > 0).length;
    const enemyHasStack = enemyTypeCounts.some(c => c >= 4);

    let closerToTypeWin = false;
    if (enemyHasStack) closerToTypeWin = false;
    else if (enemyTypeProgress >= 3) closerToTypeWin = true;
    else closerToTypeWin = Math.random() > 0.5; // tie-breaker

    if (closerToTypeWin) {
        //play highest level card of a needed type and color (new color)
        const neededTypes = Array.from(this.types.keys()).filter(
            t => enemyTypeCounts[this.types.get(t)!] < 5
        );
        const usedColors = new Set(enemyState.flat().map(c => c.color));
        const filtered = hand.filter(
            c => neededTypes.includes(c.type) && !usedColors.has(c.color)
        );
        if (filtered.length > 0)
            return filtered.reduce((a, b) => (a.rank > b.rank ? a : b));
    } else {
        // closer to stacked win
        // Find type with most unique colors so far
        let bestType = '';
        let bestColorCount = -1;
        for (const [type, idx] of this.types.entries()) {
            const colors = new Set(enemyState[idx].map(c => c.color));
            if (colors.size > bestColorCount) {
                bestColorCount = colors.size;
                bestType = type;
            }
        }

        // play highest level card of that type with a new color if possible
        const existingColors = new Set(enemyState[this.types.get(bestType)!].map(c => c.color));
        const candidates = hand.filter(
            c => c.type === bestType && !existingColors.has(c.color)
        );
        if (candidates.length > 0)
            return candidates.reduce((a, b) => (a.rank > b.rank ? a : b));
    }

    // fallback: play highest rank card
    return highestCard;
}
}

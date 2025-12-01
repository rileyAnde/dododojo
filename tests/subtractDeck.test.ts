import { Card } from "../frontend/src/game/battle";

export function subtractDecks(all: Card[], active: Card[]) {
  // build counts of active ids
    const counts = new Map<number, number>();
    for (const c of active) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);

  // produce remaining inventory by consuming counts
    const result: Card[] = [];
    for (const c of all) {
        const cnt = counts.get(c.id) ?? 0;
        if (cnt > 0) {
        counts.set(c.id, cnt - 1); // consume one instance
        } else {
        result.push(c);
        }
    }
    return result;
}


describe("subtractDecks", () => {
  test("removes matching cards by id, respecting duplicates", () => {
    const all = [
      new Card(1, "A", 1, "red", ""),
      new Card(2, "B", 2, "blue", ""),
      new Card(2, "B", 2, "blue", ""),
      new Card(3, "C", 3, "green", ""),
      new Card(4, "D", 4, "yellow", "")
    ];

    const active = [
      new Card(2, "B", 2, "blue", ""),
      new Card(3, "C", 3, "green", ""),
    ];

    const result = subtractDecks(all, active);

    // Expected result: one 2 removed and the 3 removed
    expect(result.map(c => c.id)).toEqual([1, 2, 4]);
  });

  test("removes multiple duplicates correctly", () => {
    const all = [
      new Card(5, "X", 10, "red", ""),
      new Card(5, "X", 10, "red", ""),
      new Card(5, "X", 10, "red", "")
    ];

    const active = [
      new Card(5, "X", 10, "red", ""),
      new Card(5, "X", 10, "red", "")
    ];

    const result = subtractDecks(all, active);

    expect(result.map(c => c.id)).toEqual([5]); // only 1 left
  });

  test("returns all if active is empty", () => {
    const all = [
      new Card(1, "A", 1, "red", "")
    ];

    const active: Card[] = [];

    const result = subtractDecks(all, active);

    expect(result.map(c => c.id)).toEqual([1]);
  });

  test("returns empty if active covers all", () => {
    const all = [
      new Card(7, "Z", 3, "purple", "")
    ];

    const active = [
      new Card(7, "Z", 3, "purple", "")
    ];

    expect(subtractDecks(all, active)).toEqual([]);
  });

  test("only matches by id, not by other fields", () => {
    const all = [
      new Card(10, "A", 1, "red", "fx1")
    ];

    const active = [
      // same id but different props
      new Card(10, "DIFF", 999, "blue", "otherfx")
    ];

    const result = subtractDecks(all, active);

    expect(result).toEqual([]); // should still remove it because ID matches
  });
});

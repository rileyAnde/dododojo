import xml.etree.ElementTree as ET
from typing import List
import csv
import os

# Global configuration variables
MIN_LEVEL = 1
MAX_LEVEL = 12

# List of possible card types
CARD_TYPES = [
    "fire",
    "water",
    "earth",
    "air",
    "ice"
]

# List of possible card colors
CARD_COLORS = [
    "blue",
    "red",
    "green",
    "yellow",
    "purple",
    "white",
    "black"
]

def create_card_element(card_id: int, card_type: str, level: int, color: str, fx: str = '') -> ET.Element:
    """Create a single card element with the given attributes."""
    card = ET.Element("card")
    card.set("id", str(card_id))
    
    # Add child elements
    type_elem = ET.SubElement(card, "type")
    type_elem.text = card_type
    
    level_elem = ET.SubElement(card, "level")
    level_elem.text = str(level)
    
    color_elem = ET.SubElement(card, "color")
    color_elem.text = color
    
    fx_elem = ET.SubElement(card, "fx")
    fx_elem.text = fx
    
    return card

def load_power_cards_from_csv(csv_path: str) -> List[dict]:
    """Load structured power card rows from CSV and return list of dicts."""
    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    return rows


def generate_cards_xml(power_cards_csv: str = None) -> ET.Element:
    """Generate the full cards XML structure with all possible combinations."""
    # Create root element
    root = ET.Element("cards")
    
    # Generate all possible combinations
    card_id = 0
    for card_type in CARD_TYPES:
        for level in range(MIN_LEVEL, MAX_LEVEL + 1):
            for color in CARD_COLORS:
                card = create_card_element(
                    card_id=card_id,
                    card_type=card_type,
                    level=level,
                    color=color,
                    fx=''
                )
                root.append(card)
                card_id += 1
    # Append structured power cards from CSV if provided
    if power_cards_csv and os.path.exists(power_cards_csv):
        power_rows = load_power_cards_from_csv(power_cards_csv)
        for row in power_rows:
            # Build structured fx string: CODE|Param1|Param2|Scope|Target
            code = (row.get('EffectCode') or '').strip()
            p1 = (row.get('Param1') or '').strip()
            p2 = (row.get('Param2') or '').strip()
            scope = (row.get('Scope') or '').strip()
            target = (row.get('Target') or '').strip()
            fx_value = f"{code}|{p1}|{p2}|{scope}|{target}"

            # Use Element values: Element -> type, Value -> level (if numeric), default color black for power cards
            ctype = (row.get('Element') or 'fire').strip()
            try:
                clevel = int((row.get('Value') or '1').strip())
            except ValueError:
                clevel = 1
            color = 'black'

            card = create_card_element(card_id=card_id, card_type=ctype, level=clevel, color=color, fx=fx_value)
            root.append(card)
            card_id += 1

    return root

def save_cards_to_file(filename: str):
    """Generate cards and save to an XML file."""
    # Generate cards and include power cards from parsed CSV
    power_csv = os.path.join(os.path.dirname(__file__), 'power_cards_parsed.csv')
    cards = generate_cards_xml(power_cards_csv=power_csv)
    tree = ET.ElementTree(cards)
    
    # Use indentation for pretty printing
    ET.indent(tree, space="    ")
    
    # Calculate total number of cards
    total_cards = len(CARD_TYPES) * (MAX_LEVEL - MIN_LEVEL + 1) * len(CARD_COLORS)
    
    tree.write(filename, encoding="utf-8", xml_declaration=True)
    print(f"Generated {total_cards} cards in {filename}")

if __name__ == "__main__":
    output_file = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'cards.xml')
    save_cards_to_file(output_file)
    print("Done!")

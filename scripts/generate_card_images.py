from PIL import Image, ImageDraw, ImageFont, ImageOps
import xml.etree.ElementTree as ET
import os
import math

BASE = os.path.join(os.path.dirname(__file__), '..', 'textures', 'base_dojo_card.png')
SYMBOLS_DIR = os.path.join(os.path.dirname(__file__), '..', 'textures', 'elementsymbols')
CARDS_XML = os.path.join(os.path.dirname(__file__), '..', 'resources', 'cards.xml')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'cards')

os.makedirs(OUT_DIR, exist_ok=True)


def load_cards(xml_path):
    """Parse cards.xml and return a list of card dicts with keys: id, name, type, color, level"""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    cards = []
    for ce in root.findall('.//card'):
        def get(tag):
            node = ce.find(tag)
            if node is not None and node.text:
                return node.text.strip()
            return None

        cid = get('id') or ce.get('id')
        name = get('name') or ''
        ctype = (get('type') or get('element') or 'fire').lower()
        color = (get('color') or 'red').lower()
        level_text = get('level') or '0'
        try:
            level = int(level_text)
        except Exception:
            level = 0
        cards.append({'id': cid, 'name': name, 'type': ctype, 'color': color, 'level': level})
    return cards


def find_template_regions(img):
    """Return (mask_blue, mask_red, mask_green) where masks are L-mode images (255 where region exists)."""
    rgb = img.convert('RGB')
    w, h = rgb.size
    px = rgb.load()
    mask_blue = Image.new('L', (w, h), 0)
    mask_red = Image.new('L', (w, h), 0)
    mask_green = Image.new('L', (w, h), 0)
    mb = mask_blue.load()
    mr = mask_red.load()
    mg = mask_green.load()

    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            # simple heuristics to detect filled color regions
            if b > r * 1.2 and b > g * 1.2 and b > 90:
                mb[x, y] = 255
            elif r > g * 1.2 and r > b * 1.2 and r > 80:
                mr[x, y] = 255
            elif g > r * 1.2 and g > b * 1.2 and g > 70:
                mg[x, y] = 255

    return mask_blue, mask_red, mask_green


def darker(color, factor=0.7):
    return tuple(max(0, int(c * factor)) for c in color)


def parse_color_name(name):
    name = (name or '').lower()
    mapping = {
        'blue': (30, 120, 200),
        'red': (200, 40, 40),
        'green': (40, 160, 80),
        'yellow': (240, 200, 40),
        'purple': (160, 80, 200),
        'white': (240, 240, 240),
        'black': (20, 20, 20),
        'orange': (240, 120, 40)
    }
    return mapping.get(name, (120, 120, 120))


def generate_image_for_card(card, base_img, masks, symbols_cache, font_path):
    mask_blue, mask_red, mask_green = masks
    w, h = base_img.size
    out = base_img.copy().convert('RGBA')

    # Make blue region transparent
    transparent = Image.new('RGBA', out.size, (0, 0, 0, 0))
    out = Image.composite(transparent, out, mask_blue)

    # Recolor red region to card color
    color_rgb = parse_color_name(card.get('color', 'red'))
    overlay = Image.new('RGBA', out.size, color_rgb + (255,))
    out = Image.composite(overlay, out, mask_red)

    # Darker fill for green region
    darker_rgb = darker(color_rgb, 0.55)
    overlay_green = Image.new('RGBA', out.size, darker_rgb + (255,))
    out = Image.composite(overlay_green, out, mask_green)

    draw = ImageDraw.Draw(out)

    # Draw level number in the top-right corner of the green region bbox
    bbox = mask_green.getbbox()
    text = str(card.get('level', 0))
    if bbox:
        gx0, gy0, gx1, gy1 = bbox
        area_w = gx1 - gx0
        area_h = gy1 - gy0
        # Target font size: ~25% of overall card width
        target_size = max(8, int(w * 0.25))
        size = target_size
        font_used = None
        # try decreasing sizes until it fits within the green area
        while size >= 8:
            try:
                if font_path:
                    f = ImageFont.truetype(font_path, size)
                else:
                    try:
                        f = ImageFont.truetype('DejaVuSans.ttf', size)
                    except Exception:
                        f = ImageFont.load_default()
            except Exception:
                f = ImageFont.load_default()

            # measure text size
            try:
                bbox_text = draw.textbbox((0, 0), text, font=f)
                tw = bbox_text[2] - bbox_text[0]
                th = bbox_text[3] - bbox_text[1]
            except Exception:
                try:
                    tw, th = f.getsize(text)
                except Exception:
                    tw, th = (0, 0)

            if tw > 0 and th > 0 and tw <= area_w * 0.9 and th <= area_h * 0.8:
                font_used = f
                break
            size -= 2

        if font_used is None:
            font_used = ImageFont.load_default()
            try:
                bbox_text = draw.textbbox((0, 0), text, font=font_used)
                tw = bbox_text[2] - bbox_text[0]
                th = bbox_text[3] - bbox_text[1]
            except Exception:
                tw, th = font_used.getsize(text)

        # choose contrasting text color
        lum = (darker_rgb[0] * 0.299 + darker_rgb[1] * 0.587 + darker_rgb[2] * 0.114)
        text_fill = (255, 255, 255, 255) if lum < 140 else (0, 0, 0, 255)
        margin_x = max(6, int(area_w * 0.05))
        margin_y = max(4, int(area_h * 0.05))
        tx = gx1 - tw - margin_x
        ty = gy0 + margin_y
        # draw with stroke when available
        try:
            draw.text((tx, ty), text, font=font_used, fill=text_fill, stroke_width=max(1, int(size * 0.08)), stroke_fill=(0, 0, 0, 180))
        except TypeError:
            # fallback outline
            ox = 1
            oy = 1
            draw.text((tx - ox, ty), text, font=font_used, fill=(0, 0, 0, 180))
            draw.text((tx + ox, ty), text, font=font_used, fill=(0, 0, 0, 180))
            draw.text((tx, ty - oy), text, font=font_used, fill=(0, 0, 0, 180))
            draw.text((tx, ty + oy), text, font=font_used, fill=(0, 0, 0, 180))
            draw.text((tx, ty), text, font=font_used, fill=text_fill)

    # Paste element symbol centered over card
    sym_path = os.path.join(SYMBOLS_DIR, f"{card.get('type', 'fire')}.png")
    if os.path.exists(sym_path):
        sym = symbols_cache.get(card.get('type'))
        if sym is None:
            s = Image.open(sym_path).convert('RGBA')
            # make near-white pixels transparent
            # spx = s.load()
            # sw0, sh0 = s.size
            # for yy in range(sh0):
            #     for xx in range(sw0):
            #         r, g, b, a = spx[xx, yy]
            #         if a > 0 and r > 240 and g > 240 and b > 240:
            #             spx[xx, yy] = (0, 0, 0, 0)
            sym = s
            symbols_cache[card.get('type')] = sym

        # resize symbol to 70% of card width (keeps earlier larger-symbol preference)
        sw = int(w * 0.80)
        sh = int(sw * sym.height / max(1, sym.width))
        symr = sym.resize((sw, sh), Image.LANCZOS)
        out.paste(symr, ((w - sw) // 2, (h - sh) // 2), symr)

    return out


def main():
    cards = load_cards(CARDS_XML)
    base = Image.open(BASE).convert('RGBA')
    masks = find_template_regions(base)
    symbols_cache = {}

    # try loading an easy TTF font from system or fallback
    font_path = None
    try:
        ImageFont.truetype('arial.ttf', 36)
        font_path = 'arial.ttf'
    except Exception:
        font_path = None

    for card in cards:
        img = generate_image_for_card(card, base, masks, symbols_cache, font_path)
        out_path = os.path.join(OUT_DIR, f"{card['id']}.png")
        try:
            img.save(out_path)
            print('Wrote', out_path)
        except Exception as e:
            print('Failed to save', out_path, '->', e)
if __name__ == '__main__':
    main()

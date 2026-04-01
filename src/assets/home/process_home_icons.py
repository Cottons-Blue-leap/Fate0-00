"""
Home FortuneCard Icon Processor
- Center-crop to square
- Apply theme-colored overlay (west=purple, east=red)
- Add vignette + subtle glow
- Output: 480x480 PNG (retina-ready for ~200px display)
"""
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter
import math
import os

OUTPUT_SIZE = 480
CORNER_RADIUS = 32  # rounded corners

def center_crop_square(img):
    """Crop to largest centered square."""
    w, h = img.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    return img.crop((left, top, left + s, top + s))

def apply_tone(img, overlay_color, brightness=0.55, saturation=0.45, contrast=1.3, overlay_alpha=0.55):
    """Apply tone adjustments + color overlay."""
    # Brightness
    img = ImageEnhance.Brightness(img).enhance(brightness)
    # Saturation
    img = ImageEnhance.Color(img).enhance(saturation)
    # Contrast
    img = ImageEnhance.Contrast(img).enhance(contrast)

    # Color overlay
    overlay = Image.new('RGBA', img.size, overlay_color)
    img_rgba = img.convert('RGBA')
    # Blend
    blended = Image.blend(img_rgba, overlay, overlay_alpha)
    return blended

def add_vignette(img, strength=0.7):
    """Add radial vignette."""
    w, h = img.size
    vignette = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(vignette)

    cx, cy = w // 2, h // 2
    max_r = math.sqrt(cx**2 + cy**2)

    for r in range(int(max_r), 0, -1):
        # Intensity increases from center to edge
        t = r / max_r
        alpha = int(255 * (1 - strength * t * t))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=alpha)

    img_rgba = img.convert('RGBA')
    # Apply vignette as alpha mask on a black layer
    black = Image.new('RGBA', (w, h), (0, 0, 0, 255))
    vignette_inv = Image.eval(vignette, lambda x: 255 - x)
    black.putalpha(vignette_inv)
    img_rgba = Image.alpha_composite(img_rgba, black)
    return img_rgba

def add_border_glow(img, color, width=6):
    """Add subtle colored border."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for i in range(width):
        alpha = int(80 * (1 - i / width))
        c = color[:3] + (alpha,)
        draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=c)
    return img

def round_corners(img, radius):
    """Apply rounded corners with transparency."""
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, img.size[0], img.size[1]], radius=radius, fill=255)
    img_rgba = img.convert('RGBA')
    img_rgba.putalpha(mask)
    return img_rgba

def process_icon(input_path, output_path, overlay_color, **kwargs):
    """Full processing pipeline."""
    print(f"  Loading {input_path}...")
    img = Image.open(input_path).convert('RGB')

    # Center crop to square
    img = center_crop_square(img)
    print(f"  Cropped to {img.size[0]}x{img.size[1]}")

    # Resize to output
    img = img.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.LANCZOS)

    # Apply tone
    img = apply_tone(img, overlay_color, **kwargs)

    # Vignette
    img = add_vignette(img, strength=0.6)

    # Border glow
    img = add_border_glow(img, overlay_color, width=4)

    # Round corners
    img = round_corners(img, CORNER_RADIUS)

    # Save
    img.save(output_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  → {output_path} ({size_kb:.0f}KB)")


# Theme colors (RGBA)
PURPLE = (90, 30, 120, 180)   # west theme — purple
RED = (120, 30, 20, 180)      # east theme — deep red


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    configs = [
        {
            'name': 'tarot',
            'input': '../tarot/rws-original/RWS_Tarot_18_Moon.jpg',
            'output': 'tarot.png',
            'color': PURPLE,
            'brightness': 0.50,
            'saturation': 0.40,
            'contrast': 1.35,
            'overlay_alpha': 0.50,
        },
        {
            'name': 'horoscope',
            'input': 'horoscope_original.jpg',
            'output': 'horoscope.png',
            'color': PURPLE,
            'brightness': 0.50,
            'saturation': 0.40,
            'contrast': 1.35,
            'overlay_alpha': 0.50,
        },
        {
            'name': 'saju',
            'input': 'saju_original.jpg',
            'output': 'saju.png',
            'color': RED,
            'brightness': 0.45,
            'saturation': 0.35,
            'contrast': 1.40,
            'overlay_alpha': 0.50,
        },
        {
            'name': 'omikuji',
            'input': 'omikuji_original.jpg',
            'output': 'omikuji.png',
            'color': RED,
            'brightness': 0.50,
            'saturation': 0.45,
            'contrast': 1.30,
            'overlay_alpha': 0.45,
        },
    ]

    for cfg in configs:
        name = cfg.pop('name')
        input_path = cfg.pop('input')
        output_path = cfg.pop('output')
        color = cfg.pop('color')
        print(f"\nProcessing {name}...")
        process_icon(input_path, output_path, color, **cfg)

    print("\n✓ All 4 home icons processed!")


if __name__ == '__main__':
    main()

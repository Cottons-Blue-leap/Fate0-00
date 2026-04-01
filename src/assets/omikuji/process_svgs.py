"""
Omikuji SVG Tone Processor
- Embeds an SVG feColorMatrix filter into each Noto Emoji SVG
- Shifts colors toward warm red/gold shrine tones
- Output: processed SVGs ready for app use
"""
import re
import os

# Color matrix presets for different icon categories
# Matrix format: R_from_R, R_from_G, R_from_B, R_from_A, R_offset (repeat for G, B, A rows)
FILTERS = {
    # Warm shrine red - for general icons
    'shrine': """
        0.75 0.25 0.10 0 0.05
        0.10 0.45 0.05 0 0.00
        0.05 0.05 0.35 0 0.02
        0    0    0    1 0
    """,
    # Already red - just deepen/enrich
    'red_enhance': """
        0.85 0.10 0.05 0 0.03
        0.08 0.50 0.05 0 0.00
        0.03 0.03 0.45 0 0.02
        0    0    0    1 0
    """,
    # Gold/warm for spiritual items
    'gold_warm': """
        0.70 0.25 0.10 0 0.08
        0.15 0.55 0.10 0 0.03
        0.05 0.05 0.30 0 0.00
        0    0    0    1 0
    """,
    # Water/purification - keep cool but add warmth
    'water_warm': """
        0.50 0.15 0.20 0 0.05
        0.10 0.45 0.20 0 0.02
        0.15 0.15 0.60 0 0.05
        0    0    0    1 0
    """,
}

# Map each icon to its filter preset
ICON_FILTERS = {
    'torii':    'red_enhance',   # already red, just deepen
    'tanabata': 'shrine',        # green→warm red shift
    'palms_up': 'gold_warm',     # hands→golden warm
    'droplet':  'water_warm',    # blue→warm purple
    'clap':     'gold_warm',     # hands→golden warm
    'pray':     'gold_warm',     # prayer→golden warm
    'purse':    'shrine',        # pink→warm red
    'tree':     'shrine',        # green→warm red
    'bulb':     'gold_warm',     # yellow→richer gold
}

def process_svg(input_path, output_path, filter_name):
    """Add color matrix filter to SVG."""
    with open(input_path, 'r', encoding='utf-8') as f:
        svg = f.read()

    matrix = FILTERS[filter_name]

    # Create the filter definition
    filter_def = f'''<defs>
    <filter id="omikuji-tone" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="{matrix.strip()}"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.9" intercept="0.02"/>
        <feFuncG type="linear" slope="0.85" intercept="0.01"/>
        <feFuncB type="linear" slope="0.8" intercept="0.01"/>
      </feComponentTransfer>
    </filter>
  </defs>'''

    # Find the opening <svg ...> tag end
    svg_tag_match = re.search(r'(<svg[^>]*>)', svg, re.DOTALL)
    if not svg_tag_match:
        print(f"  ERROR: No <svg> tag found in {input_path}")
        return

    svg_open_end = svg_tag_match.end()

    # Find closing </svg>
    svg_close = svg.rfind('</svg>')
    if svg_close < 0:
        print(f"  ERROR: No </svg> found in {input_path}")
        return

    # Extract inner content (between <svg> and </svg>)
    inner = svg[svg_open_end:svg_close]

    # Rebuild SVG with filter
    processed = (
        svg[:svg_open_end] + '\n'
        + '  ' + filter_def + '\n'
        + '  <g filter="url(#omikuji-tone)">\n'
        + inner
        + '\n  </g>\n'
        + svg[svg_close:]
    )

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(processed)

    size = os.path.getsize(output_path)
    print(f"  OK → {output_path} ({size} bytes, filter: {filter_name})")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    for icon_name, filter_name in ICON_FILTERS.items():
        input_path = os.path.join(script_dir, f'{icon_name}_original.svg')
        output_path = os.path.join(script_dir, f'{icon_name}.svg')

        if not os.path.exists(input_path):
            print(f"SKIP: {input_path} not found")
            continue

        print(f"Processing {icon_name}...")
        process_svg(input_path, output_path, filter_name)

    print("\nDone! All SVGs processed.")


if __name__ == '__main__':
    main()

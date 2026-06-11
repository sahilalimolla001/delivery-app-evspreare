from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)


def font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def blue_gradient(size):
    image = Image.new("RGB", (size, size), "#075dff")
    pixels = image.load()
    for y in range(size):
        for x in range(size):
            t = (x * 0.35 + y * 0.65) / size
            r = int(2 + 9 * (1 - t))
            g = int(71 + 35 * (1 - t))
            b = int(235 + 20 * (1 - t))
            pixels[x, y] = (r, g, b)
    return image


def draw_gear(draw, center, outer, inner, fill):
    cx, cy = center
    points = []
    for i in range(24):
        angle = -math.pi / 2 + i * math.pi / 12
        radius = outer if i % 2 == 0 else outer * 0.78
        points.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    draw.polygon(points, fill=fill)
    draw.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill="#075dff")


def draw_brand_icon(size=1024):
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon = blue_gradient(size).convert("RGBA")
    mask = rounded_mask(size, int(size * 0.22))
    base.alpha_composite(Image.composite(icon, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    title_font = font(int(size * 0.155), bold=True)
    subtitle_font = font(int(size * 0.034), bold=True)

    title = "evspeare"
    title_box = shadow_draw.textbbox((0, 0), title, font=title_font)
    title_width = title_box[2] - title_box[0]
    title_x = (size - title_width) / 2 - size * 0.015
    title_y = size * 0.445

    shadow_draw.text((title_x + size * 0.012, title_y + size * 0.018), title, fill=(0, 0, 0, 95), font=title_font)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size * 0.012))
    base.alpha_composite(shadow)

    draw = ImageDraw.Draw(base)
    draw.text((title_x, title_y), title, fill="white", font=title_font)

    gear_center = (int(title_x + title_width + size * 0.055), int(title_y + size * 0.045))
    draw_gear(draw, gear_center, int(size * 0.04), int(size * 0.019), "white")

    subtitle = "DELIVERY PARTNER"
    subtitle_box = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_box[2] - subtitle_box[0]
    subtitle_x = (size - subtitle_width) / 2
    subtitle_y = size * 0.608
    line_y = subtitle_y + size * 0.022
    gap = size * 0.03
    draw.line((subtitle_x - size * 0.11, line_y, subtitle_x - gap, line_y), fill="white", width=max(2, size // 350))
    draw.line((subtitle_x + subtitle_width + gap, line_y, subtitle_x + subtitle_width + size * 0.11, line_y), fill="white", width=max(2, size // 350))
    draw.text((subtitle_x, subtitle_y), subtitle, fill="white", font=subtitle_font)
    return base


def save_resized(image, name, size):
    image.resize((size, size), Image.Resampling.LANCZOS).save(ASSETS / name)


icon = draw_brand_icon(1024)
icon.save(ASSETS / "icon.png")
icon.save(ASSETS / "adaptive-icon.png")
save_resized(icon, "favicon.png", 64)

splash = Image.new("RGBA", (2048, 2048), "#075dff")
logo = icon.resize((920, 920), Image.Resampling.LANCZOS)
splash.alpha_composite(logo, ((2048 - 920) // 2, (2048 - 920) // 2))
splash.save(ASSETS / "splash.png")

print("Generated icon.png, adaptive-icon.png, favicon.png, splash.png")

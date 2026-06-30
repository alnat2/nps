from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageStat

root = Path(__file__).resolve().parents[1]
figma_path = root / "__tests__/figma_skills_desktop_1440x488.png"
full_path = root / "__tests__/skills_desktop_fullpage.png"
local_path = root / "__tests__/skills_desktop_local_crop.png"
overlay_path = root / "__tests__/skills_desktop_overlay.png"
diff_path = root / "__tests__/skills_desktop_diff.png"
metrics_path = root / "__tests__/skills_desktop_diff_metrics.txt"

figma = Image.open(figma_path).convert("RGBA")
full = Image.open(full_path).convert("RGBA")
local = full.crop((0, 2709, 1440, 3197))
local.save(local_path)

Image.blend(figma, local, 0.5).save(overlay_path)

diff = ImageChops.difference(figma, local)
ImageEnhance.Contrast(diff).enhance(4).save(diff_path)

diff_rgb = diff.convert("RGB")
stat = ImageStat.Stat(diff_rgb)
mean = sum(stat.mean) / 3
pixels = (
    diff_rgb.get_flattened_data()
    if hasattr(diff_rgb, "get_flattened_data")
    else diff_rgb.getdata()
)
changed = sum(1 for pixel in pixels if pixel != (0, 0, 0))
total = figma.size[0] * figma.size[1]
metrics_path.write_text(
    f"mean_rgb_diff={mean:.2f}\n"
    f"changed_pixels={changed}\n"
    f"total_pixels={total}\n"
    f"changed_percent={changed / total * 100:.2f}\n"
    f"extrema={diff_rgb.getextrema()}\n",
    encoding="utf-8",
)

print(metrics_path.read_text(encoding="utf-8"))

from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageStat

root = Path(__file__).resolve().parents[1]
figma_path = root / "__tests__/figma_cases_desktop_1440x642.png"
full_path = root / "__tests__/cases_desktop_fullpage.png"
local_path = root / "__tests__/cases_desktop_local_crop.png"
overlay_path = root / "__tests__/cases_desktop_overlay.png"
diff_path = root / "__tests__/cases_desktop_diff.png"
metrics_path = root / "__tests__/cases_desktop_diff_metrics.txt"

figma = Image.open(figma_path).convert("RGBA")
full = Image.open(full_path).convert("RGBA")
local = full.crop((0, 690, 1440, 1332))
local.save(local_path)

overlay = Image.blend(figma, local, 0.5)
overlay.save(overlay_path)

diff = ImageChops.difference(figma, local)
diff_enhanced = ImageEnhance.Contrast(diff).enhance(4)
diff_enhanced.save(diff_path)

stat = ImageStat.Stat(diff.convert("RGB"))
mean = sum(stat.mean) / 3
extrema = diff.convert("RGB").getextrema()
changed = 0
total = figma.size[0] * figma.size[1]
diff_rgb = diff.convert("RGB")
pixels = (
    diff_rgb.get_flattened_data()
    if hasattr(diff_rgb, "get_flattened_data")
    else diff_rgb.getdata()
)
for pixel in pixels:
    if pixel != (0, 0, 0):
        changed += 1

metrics_path.write_text(
    f"mean_rgb_diff={mean:.2f}\n"
    f"changed_pixels={changed}\n"
    f"total_pixels={total}\n"
    f"changed_percent={changed / total * 100:.2f}\n"
    f"extrema={extrema}\n",
    encoding="utf-8",
)

print(metrics_path.read_text(encoding="utf-8"))

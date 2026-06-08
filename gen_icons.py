import os, shutil
from PIL import Image, ImageDraw

# Pakai logo_apk.png (foto 1 - dengan tulisan Finance Tracker) untuk icon APK
src = 'public/logo_apk.png'
if not os.path.exists(src):
    src = 'public/logo_clean.png'
if not os.path.exists(src):
    print("Logo not found, skipping icon generation")
    exit(0)

img = Image.open(src).convert('RGBA')

# Background hitam 1024x1024, logo di-fit di tengah
bg_size = 1024
bg = Image.new('RGBA', (bg_size, bg_size), (15, 17, 23, 255))

# Fit logo ke dalam bg dengan padding
padding = 100
logo_size = bg_size - padding * 2
logo = img.resize((logo_size, logo_size), Image.LANCZOS)
bg.paste(logo, (padding, padding), logo)

sizes = {
    'mipmap-mdpi':    48,
    'mipmap-hdpi':    72,
    'mipmap-xhdpi':   96,
    'mipmap-xxhdpi':  144,
    'mipmap-xxxhdpi': 192,
}

base = 'android/app/src/main/res'
for folder, size in sizes.items():
    path = os.path.join(base, folder)
    os.makedirs(path, exist_ok=True)
    out = bg.resize((size, size), Image.LANCZOS).convert('RGB')
    out.save(os.path.join(path, 'ic_launcher.png'))
    out.save(os.path.join(path, 'ic_launcher_round.png'))
    print(f"Generated {folder}: {size}x{size}")

# Hapus adaptive icon — ini yang selalu override icon kita
adaptive_path = os.path.join(base, 'mipmap-anydpi-v26')
if os.path.exists(adaptive_path):
    shutil.rmtree(adaptive_path)
    print("Removed mipmap-anydpi-v26")

print("Icon generation complete!")

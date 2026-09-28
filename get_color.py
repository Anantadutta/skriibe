import sys
from PIL import Image

try:
    img = Image.open(sys.argv[1])
    rgb = img.getpixel((10, 10))
    print('#{:02x}{:02x}{:02x}'.format(*rgb[:3]))
except Exception as e:
    print(e)

from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Get max luminance
        r, g, b, a = item
        max_val = max(r, g, b)
        
        # Set alpha to max luminance
        # and un-premultiply colors
        if max_val > 0:
            new_r = int(r * 255 / max_val)
            new_g = int(g * 255 / max_val)
            new_b = int(b * 255 / max_val)
            new_data.append((new_r, new_g, new_b, max_val))
        else:
            new_data.append((0, 0, 0, 0))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

process_logo("frontend/public/logo.png", "frontend/public/logo.png")
print("Logo processed!")

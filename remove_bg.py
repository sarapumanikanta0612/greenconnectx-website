import os
from PIL import Image

# Source and destination image paths
src_path = r"C:\Users\manik\.gemini\antigravity\brain\f53f05aa-11b3-41f3-9a60-f100ce83ce71\greenconnect_logo_new_1781178074869.png"
dest_path = r"C:\Users\manik\.gemini\antigravity\scratch\greenconnect-landing\public\logo.png"

try:
    img = Image.open(src_path).convert("RGBA")
    data = img.getdata()
    
    # Identify background color from top-left corner
    bg_r, bg_g, bg_b, _ = data[0]
    print(f"Detecting background color at (0,0): RGB({bg_r}, {bg_g}, {bg_b})")

    new_data = []
    threshold = 45 # Color distance threshold for keying
    
    for item in data:
        r, g, b, a = item
        # Calculate color difference distance
        distance = ((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)**0.5
        if distance < threshold:
            new_data.append((0, 0, 0, 0)) # Make pixel transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Save output
    img.save(dest_path, "PNG")
    print(f"Success: Saved transparent logo to {dest_path}")
except Exception as e:
    print(f"Error processing image: {e}")

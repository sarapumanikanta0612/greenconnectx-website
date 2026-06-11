import os

# Project root directory
project_dir = r"C:\Users\manik\.gemini\antigravity\scratch\greenconnect-landing"

files_to_update = [
    "public/index.html",
    "public/app.js",
    "server.js",
    "db.js",
    ".env",
    "package.json"
]

print("Fixing double X brand naming anomalies...")

for file_rel in files_to_update:
    full_path = os.path.join(project_dir, file_rel)
    if os.path.exists(full_path):
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace double X instances
            updated_content = content.replace("GreenConnectXX", "GreenConnectX")
            updated_content = updated_content.replace("greenconnectxx", "greenconnectx")
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
                
            print("Fixed: " + file_rel)
        except Exception as e:
            print("ERROR - Could not fix " + file_rel + ": " + str(e))
    else:
        print("WARNING - File not found: " + file_rel)

print("Double X check completed.")

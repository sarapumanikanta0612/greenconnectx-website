import re
import os
import sys

def check_js_brackets(file_path):
    print(f"Checking JS brackets: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strip comments first
    # Single line comments
    content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    # Multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Strip strings (single quote, double quote, backtick)
    # Be careful with escaped quotes, e.g. \' or \"
    content = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", content)
    content = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', content)
    # Simple regex for backticks (ignores template expressions for this check, but template expressions have brackets that we DO want to parse)
    # Instead of removing template literals completely, let's just strip non-bracket parts inside template literals, or just parse character by character.
    
    # Let's do character by character parsing for JS to handle strings and comments correctly
    stack = []
    brackets = {')': '(', '}': '{', ']': '['}
    
    in_string = None  # None, or ', ", `
    escaped = False
    in_single_line_comment = False
    in_multi_line_comment = False
    
    i = 0
    line_num = 1
    char_idx = 0
    n = len(content)
    
    while i < n:
        char = content[i]
        
        # Track line numbers
        if char == '\n':
            line_num += 1
            char_idx = 0
            in_single_line_comment = False
        else:
            char_idx += 1
            
        if in_single_line_comment:
            i += 1
            continue
            
        if in_multi_line_comment:
            if char == '*' and i + 1 < n and content[i+1] == '/':
                in_multi_line_comment = False
                i += 2
                char_idx += 1
                continue
            i += 1
            continue
            
        if in_string:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == in_string:
                in_string = None
            i += 1
            continue
            
        # Check comments
        if char == '/' and i + 1 < n and content[i+1] == '/':
            in_single_line_comment = True
            i += 2
            char_idx += 1
            continue
        if char == '/' and i + 1 < n and content[i+1] == '*':
            in_multi_line_comment = True
            i += 2
            char_idx += 1
            continue
            
        # Check strings
        if char in ("'", '"', '`'):
            in_string = char
            i += 1
            continue
            
        # Brackets
        if char in brackets.values():
            stack.append((char, line_num, char_idx))
        elif char in brackets.keys():
            if not stack:
                print(f"Error: Unmatched closing bracket '{char}' at line {line_num}, col {char_idx}")
                return False
            top_char, top_line, top_col = stack.pop()
            if brackets[char] != top_char:
                print(f"Error: Mismatched bracket '{char}' at line {line_num}, col {char_idx} (expected closing for '{top_char}' from line {top_line}, col {top_col})")
                return False
        
        i += 1
        
    if stack:
        top_char, top_line, top_col = stack[-1]
        print(f"Error: Unclosed bracket '{top_char}' from line {top_line}, col {top_col}")
        return False
    print("JS brackets check passed.")
    return True

def check_html_tags(file_path):
    print(f"Checking HTML tags: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Strip comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    
    # Find all tags
    tags = re.findall(r'<(/?[a-zA-Z0-9\-]+)(?:\s+[^>]*?)?>', content)
    stack = []
    self_closing = {'img', 'input', 'meta', 'link', 'br', 'hr', 'source', 'col', 'base', 'embed', 'wbr', 'path', 'svg', 'circle', 'line', 'defs', 'linearGradient', 'stop'}
    
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in self_closing:
            continue
        if tag_lower.startswith('?'):
            # XML declarations, etc.
            continue
        if tag_lower.startswith('/'):
            # Closing tag
            tag_name = tag_lower[1:]
            if tag_name in self_closing:
                continue
            if not stack:
                print(f"Error: Unmatched closing HTML tag </{tag_name}>")
                return False
            top_tag = stack.pop()
            if top_tag != tag_name:
                print(f"Error: Mismatched HTML tag </{tag_name}> (expected </{top_tag}>)")
                return False
        else:
            # Opening tag
            stack.append(tag_lower)
            
    if stack:
        print(f"Error: Unclosed HTML tags: {stack}")
        return False
    
    print("HTML tags check passed.")
    return True

def check_css(file_path):
    print(f"Checking CSS braces: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check simple curly braces matching
    stack = []
    lines = content.splitlines()
    for line_num, line in enumerate(lines, 1):
        for char_idx, char in enumerate(line, 1):
            if char == '{':
                stack.append(('{', line_num, char_idx))
            elif char == '}':
                if not stack:
                    print(f"Error: Unmatched closing brace '}}' at line {line_num}, col {char_idx}")
                    return False
                stack.pop()
    if stack:
        top_char, top_line, top_col = stack[-1]
        print(f"Error: Unclosed brace '{top_char}' from line {top_line}, col {top_col}")
        return False
    print("CSS braces check passed.")
    return True

def main():
    public_dir = 'public'
    app_js = os.path.join(public_dir, 'app.js')
    index_html = os.path.join(public_dir, 'index.html')
    styles_css = os.path.join(public_dir, 'styles.css')
    
    success = True
    if os.path.exists(app_js):
        success = success and check_js_brackets(app_js)
    else:
        print(f"Warning: {app_js} not found.")
        
    if os.path.exists(index_html):
        success = success and check_html_tags(index_html)
    else:
        print(f"Warning: {index_html} not found.")
        
    if os.path.exists(styles_css):
        success = success and check_css(styles_css)
    else:
        print(f"Warning: {styles_css} not found.")
        
    if success:
        print("\nAll syntactical checks passed successfully!")
        sys.exit(0)
    else:
        print("\nSome checks failed. See errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()

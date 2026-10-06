import os
import re

directory = r'c:\Users\dutta\Downloads\skriibe-main\skriibe-main\frontend\src'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'io(' in content or 'socket.io-client' in content:
                if 'socket.js' in filepath:
                    continue
                
                # Calculate relative path to utils/socket
                rel_dir = os.path.relpath(root, directory)
                if rel_dir == '.':
                    import_path = './utils/socket'
                else:
                    depth = len(rel_dir.split(os.sep))
                    import_path = '../' * depth + 'utils/socket'

                new_content = re.sub(
                    r'import\s*\{\s*io\s*\}\s*from\s*[\'"]socket\.io-client[\'"];?',
                    f"import {{ createSocket }} from '{import_path}';",
                    content
                )

                # Remove socketUrl declarations
                new_content = re.sub(r'const\s+socketUrl\s*=\s*(?:import\.meta\.env[^;]+|apiUrl\.replace[^;]+);\s*', '', new_content)
                new_content = re.sub(r'const\s+socketUrl\s*=\s*import\.meta\.env[^?]+\?[^:]+:\s*[^;]+;\s*', '', new_content)

                # Special cases
                new_content = re.sub(r'const\s+apiUrl\s*=\s*import\.meta\.env[^;]+;\s*const\s+newSocket\s*=\s*io\(apiUrl', 'const newSocket = createSocket(', new_content)
                
                # Replace remaining io( ... )
                def repl(match):
                    args = match.group(1).strip()
                    if args.startswith('socketUrl') or args.startswith('apiUrl'):
                        rest = args[len('socketUrl'):].strip()
                        if rest.startswith(','):
                            return f'createSocket({rest[1:].strip()})'
                        return 'createSocket()'
                    elif args.startswith("'http://localhost:5000'") or args.startswith('"http://localhost:5000"'):
                        rest = args[23:].strip()
                        if rest.startswith(','):
                            return f'createSocket({rest[1:].strip()})'
                        return 'createSocket()'
                    return f'createSocket({args})'

                new_content = re.sub(r'io\(([^)]*)\)', repl, new_content)

                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {filepath}')

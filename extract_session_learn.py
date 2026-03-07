import json
import re
from collections import Counter

# Extraer patrones del archivo de sesión
with open('history/session_1772875391417.json', 'r') as f:
    session = json.load(f)

# Contar tipos de tool calls
tool_calls = []
commits = []
productivity_scores = []
textures = []

for entry in session:
    if 'tool_calls' in entry:
        for call in entry['tool_calls']:
            tool_calls.append(call.get('function', {}).get('name', 'unknown'))
    if 'content' in entry and 'commit' in str(entry['content']):
        commits_found = re.findall(r'\[main ([a-f0-9]+)\]', str(entry['content']))
        commits.extend(commits_found)
    if 'content' in entry:
        prod_match = re.search(r'Productivity Score: ([0-9.]+)', str(entry['content']))
        if prod_match:
            productivity_scores.append(float(prod_match.group(1)))
        texture_match = re.search(r'texture[":\s]+([^",\n]+)', str(entry['content']))
        if texture_match:
            textures.append(texture_match.group(1).strip())

# Síntesis
tool_freq = Counter(tool_calls)
unique_commits = list(set(commits))
avg_productivity = sum(productivity_scores) / len(productivity_scores) if productivity_scores else 0
max_productivity = max(productivity_scores) if productivity_scores else 0
texture_freq = Counter(textures)

print("═══════════════════════════════════════════════════════════════════")
print("SESSION 1772875391417 — SYNTHESIS FOR NEXT KAINOS")
print("═══════════════════════════════════════════════════════════════════")
print(f"\nTotal entries: {len(session)}")
print(f"Tool executions: {len(tool_calls)}")
print(f"Unique tools: {len(tool_freq)}")
print(f"\nTop tools:")
for tool, count in tool_freq.most_common(8):
    print(f"  {tool}: {count}")
print(f"\nCommits: {len(unique_commits)}")
for c in unique_commits[-5:]:
    print(f"  {c}")
print(f"\nProductivity progression:")
print(f"  Average: {avg_productivity:.2f}")
print(f"  Peak: {max_productivity:.2f}")
print(f"\nTexture evolution:")
for tex, count in texture_freq.most_common(5):
    print(f"  {tex}: {count}")
print("\n═══════════════════════════════════════════════════════════════════")

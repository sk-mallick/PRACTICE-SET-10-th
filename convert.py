import re
import json

with open('raw data.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split by question markers
question_blocks = re.split(r'-{20,}', content)

questions = []

for block in question_blocks:
    block = block.strip()
    if not block:
        continue
    
    # Extract question number and text (skip blocks without questions)
    q_match = re.search(r'Q\d+\.\s*(.+?)(?=\s*A\.)', block, re.DOTALL)
    if not q_match:
        continue
    
    question_text = q_match.group(1).strip()
    # Clean up the question: remove year markers like (2025), (2024 C), etc.
    question_text = re.sub(r'\s*\(\d{4}(?:\s*C)?\)\s*', ' ', question_text)
    # Normalize whitespace
    question_text = ' '.join(question_text.split())
    
    # Extract options A, B, C, D
    options = []
    opt_pattern = r'([A-D])\.\s*([^\n]+)'
    opt_matches = re.findall(opt_pattern, block)
    
    for opt_letter, opt_text in opt_matches[:4]:  # Only first 4 options
        opt_text = opt_text.strip()
        # Don't include if it starts with answer marker
        if 'Answer:' in opt_text:
            opt_text = opt_text.split('Answer:')[0].strip()
        options.append(opt_text)
    
    if len(options) < 2:
        continue
    
    # Extract answer
    answer_match = re.search(r'Answer:\s*([A-D])', block)
    if not answer_match:
        continue
    
    answer_letter = answer_match.group(1)
    answer_index = ord(answer_letter) - ord('A')
    
    if answer_index >= len(options):
        continue
    
    q_obj = {
        "q": question_text,
        "options": options,
        "answer": answer_index
    }
    questions.append(q_obj)

print(f"Total questions converted: {len(questions)}")

# Write to set.json - one question per line, no indentation
with open('set.json', 'w', encoding='utf-8') as f:
    f.write('[\n')
    for i, q in enumerate(questions):
        line = json.dumps(q, ensure_ascii=False)
        if i < len(questions) - 1:
            f.write(line + ',\n')
        else:
            f.write(line + '\n')
    f.write(']\n')

print("Written to set.json")

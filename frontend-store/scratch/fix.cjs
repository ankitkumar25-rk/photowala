const fs = require('fs');
const path = require('path');

const charToByte = new Map();
for (let i = 0; i < 256; i++) {
    charToByte.set(String.fromCharCode(i), i);
}
const cp1252Extras = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
    'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A, '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E,
    '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
    '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C, 'ž': 0x9E, 'Ÿ': 0x9F
};
for (const [char, byte] of Object.entries(cp1252Extras)) {
    charToByte.set(char, byte);
}

function fixMojibake(text) {
    let result = '';
    let i = 0;
    while (i < text.length) {
        let char = text[i];
        let byte1 = charToByte.get(char);
        
        if (byte1 !== undefined && byte1 >= 0xC2 && byte1 <= 0xF4) {
            let seqLen = 0;
            if (byte1 >= 0xC2 && byte1 <= 0xDF) seqLen = 2;
            else if (byte1 >= 0xE0 && byte1 <= 0xEF) seqLen = 3;
            else if (byte1 >= 0xF0 && byte1 <= 0xF4) seqLen = 4;
            
            let possibleSeq = [byte1];
            let valid = true;
            for (let j = 1; j < seqLen; j++) {
                if (i + j >= text.length) { valid = false; break; }
                let nextChar = text[i + j];
                let nextByte = charToByte.get(nextChar);
                if (nextByte === undefined || nextByte < 0x80 || nextByte > 0xBF) {
                    valid = false;
                    break;
                }
                possibleSeq.push(nextByte);
            }
            
            if (valid) {
                let decoded = Buffer.from(possibleSeq).toString('utf8');
                if (!decoded.includes('\uFFFD')) {
                    result += decoded;
                    i += seqLen;
                    continue;
                }
            }
        }
        
        result += char;
        i++;
    }
    return result;
}

function processDirectory(dir) {
    const stat = fs.statSync(dir); if (!stat.isDirectory()) { const file = path.basename(dir); const fullPath = dir; if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.css')) { const originalText = fs.readFileSync(fullPath, 'utf8'); const fixedText = fixMojibake(originalText); if (originalText !== fixedText) { console.log('Fixed:', fullPath); fs.writeFileSync(fullPath, fixedText, 'utf8'); } } return; } const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.css')) {
            const originalText = fs.readFileSync(fullPath, 'utf8');
            const fixedText = fixMojibake(originalText);
            if (originalText !== fixedText) {
                console.log('Fixed:', fullPath);
                fs.writeFileSync(fullPath, fixedText, 'utf8');
            }
        }
    }
}

const targetDir = process.argv[2] || process.cwd();
processDirectory(targetDir);
console.log('Done.');

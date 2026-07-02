import mammoth from 'mammoth';
import fs from 'fs/promises';

async function main() {
    try {
        const result = await mammoth.extractRawText({ path: 'SAFE_AI_Mesh_Full_Project (1).docx' });
        await fs.writeFile('document_theory.txt', result.value);
        console.log('Successfully extracted text to document_theory.txt');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();

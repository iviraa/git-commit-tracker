import axios from 'axios';
import simpleGit from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';


async function getCommitMessage(summary : string, apiKey : string | undefined) : Promise<string>{

    const OPENAI_API_KEY = apiKey;

    if (!OPENAI_API_KEY) {
        console.error('OpenAI API key is not provided.');
    }

    try{ 
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Generate a concise commit message based on this summary of code changes. The commit message should be less than 11 words:\n\n${summary}` },
                ],
                max_tokens: 20,
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }  
        )
        return response.data.choices[0].message.content.trim();
    }
    catch (error){
        console.error('Error while fetching from OpenAI:', error);
        return 'Update changes'; 
    }

}

async function generateReadme(repoPath : string, summary :string) : Promise<string> {

    const readmePath = path.join(repoPath, 'README.md');

    let currentContent = '';
    let bulletNumber = 0;

    if (fs.existsSync(readmePath)) {
        currentContent = await fs.promises.readFile(readmePath, 'utf-8');

        const currentNumber = currentContent.match(/^\d+\.\s+/gm);
        if (currentNumber) {
            bulletNumber = currentNumber.length;
        } 
    } else {
        currentContent = '# Code Changes Summary\n\n';
    }
    const newEntry = `\n\n${bulletNumber + 1}. ${summary.replace(/\n/g, '\n    ')}`;
    const updatedContent = currentContent + newEntry;

    return updatedContent;
}

    

async function commitToRepo(repoPath : string, readmeContent : string , commitMessage : string): Promise<void> {

    const gitClient = simpleGit(repoPath);

    try{
        await gitClient.init();
        const readmePath = path.join(repoPath, 'README.md')
        await fs.promises.writeFile(readmePath, readmeContent, 'utf-8');
        await gitClient.add(readmePath);
        await gitClient.commit(commitMessage);
        //await gitClient.push('origin', 'main');

    } catch (error){
        console.error('Error while committing to repo:', error);
    }
}

export { getCommitMessage, generateReadme, commitToRepo}
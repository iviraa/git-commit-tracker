import axios from 'axios';
import simpleGit from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';


async function getCommitMessage(summary : string ) : Promise<string>{

    try{ 
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Generate a concise commit message based on this summary of code changes:\n\n${summary}` },
                ],
                max_tokens: 20,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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

function  generateReadme(summary :string) : string {
    return `
    # Code Changes Summary
    
    This repository contains the latest code changes made to the project.
    
    ## Summary of Code Changes:
    
    \`\`\`
    ${summary}
    \`\`\`
        `;
    }

async function commitToRepo(repoPath : string, readmeContent : string , commitMessage : string){

    const gitClient = simpleGit(repoPath);

    try{
        await gitClient.init();
        const readmePath = path.join(repoPath, 'README.md')
        await fs.promises.writeFile(readmePath, readmeContent, 'utf-8');
        await gitClient.add(readmePath);
        await gitClient.commit(commitMessage);
        await gitClient.push('origin', 'main');

    } catch (error){
        console.error('Error while committing to repo:', error);
    }
}

export default { getCommitMessage, generateReadme, commitToRepo };
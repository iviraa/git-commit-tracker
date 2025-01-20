import * as vscode from 'vscode';
import getSummary from './summarizer';
import getCodeChanges  from './changes';
import { getCommitMessage, generateReadme, commitToRepo } from './autocommit';


// export function activate(context: vscode.ExtensionContext) {

// 	console.log('Extension "git-commit-tracker" is now active!');

//     const commitInterval = setInterval(async () => {
        
//         const codeChanges = await getCodeChanges();

//         const summary = await getSummary(codeChanges);

//         const readmeContent = generateReadme(summary);

//         const commitMessage = await getCommitMessage(summary);

//         const repoPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

//         await commitToRepo(repoPath, readmeContent, commitMessage);

//     }, 1000 );

	
// 	context.subscriptions.push({
//         dispose: () => {
//             clearInterval(commitInterval);
//         }
//     });
// }

// export function deactivate() {
//     console.log('Extension "git-commit-tracker" is now inactive!');
// }

export async function activate(context: vscode.ExtensionContext) {
    console.log('Extension "git-commit-tracker" is now active!');

    const secretStorage = context.secrets;


    let apiKey = await secretStorage.get('openaiApiKey');

    if (!apiKey) {
       
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            placeHolder: 'sk-xxxxxxxxxxxxxxxxxxxx',
            ignoreFocusOut: true,  
        });

        if (apiKey) {
            // Store the API key securely
            await secretStorage.store('openaiApiKey', apiKey);
            vscode.window.showInformationMessage('API Key saved successfully!');
        } else {
            vscode.window.showErrorMessage('API Key was not provided. Some features may not work.');
        }
    } else {
        vscode.window.showInformationMessage('API Key loaded securely.');
    }


    const summarizeChangesCommand = vscode.commands.registerCommand(
        'git-commit-tracker.summarizeChanges', async () => {
            // This will trigger when the user runs the "Summarize Changes" command
            const codeChanges = await getCodeChanges();
            const summary = await getSummary(codeChanges, apiKey);
            const readmeContent = generateReadme(summary);
            const commitMessage = await getCommitMessage(summary, apiKey);
            const repoPath = vscode.workspace.workspaceFolders![0].uri.fsPath;

            console.log('Code Changes:', codeChanges);
            console.log('Summary:', summary);
            console.log('Readme Content:', readmeContent);
            console.log('Commit Message:', commitMessage);
            console.log(repoPath);

            await commitToRepo(repoPath, readmeContent, commitMessage);
            vscode.window.showInformationMessage('Changes summarized and committed!');
        }
    );

    context.subscriptions.push(summarizeChangesCommand);
}

export function deactivate() {
    console.log('Extension "git-commit-tracker" is now inactive!');
}
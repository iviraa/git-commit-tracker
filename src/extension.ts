import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';
import getSummary from './summarizer';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "git-commit-tracker" is now active!');

	const disposable = vscode.commands.registerCommand('git-commit-tracker.summarizeChanges', async () => {
	
		const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

		const workspacePath = workspaceFolders[0].uri.fsPath;
        const git: SimpleGit = simpleGit(workspacePath);

        try {
            const diff = await git.diff();

            if (!diff) {
                vscode.window.showInformationMessage('No changes found since the last commit.');
                return;
            }

            const summary = await getSummary(diff);

            vscode.window.showInformationMessage(`Code Changes Summary: ${summary}`);
        } catch (error : any) {
            vscode.window.showErrorMessage(`Error reading Git changes: ${error.message}`);
        }
    
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}

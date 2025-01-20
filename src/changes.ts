import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from "simple-git";

async function getCodeChanges(): Promise<string> {

    const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return '';
        }

    const workspacePath = workspaceFolders[0].uri.fsPath;

    const git: SimpleGit= simpleGit(workspacePath);

    try {
        const codeChanges = await git.diff();

        if (!codeChanges) {
            console.log('No changes found since the last commit.');
            return 'No changes found.';
        }

        console.log('Code Changes:', codeChanges);
        return codeChanges;
    } catch (error) {
        console.error('Error reading Git changes:', error);
        return 'Error retrieving code changes.';
    }
}

export default getCodeChanges;



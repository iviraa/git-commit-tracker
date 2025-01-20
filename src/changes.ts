import simpleGit from "simple-git";

async function getCodeChanges(): Promise <string> {
    const git = simpleGit();

    try{
        
        const codeChanges = await git.diff();

        if (!codeChanges) {
            console.log('No changes found since the last commit.');
            return '';
        }

        return codeChanges;
        
    } catch (error) {
        console.error('Error reading Git changes:', error);
        return '';
    }
    
}


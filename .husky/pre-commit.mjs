import { exec } from "node:child_process";

const run = (cmd) => new Promise((resolve, reject) => exec(
    cmd,
    (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
    }
));

try {
    // Get the list of staged changes
    const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
    const modifiedFiles = changeset.split('\n').filter(Boolean);

    // Identify files in the commons folder
    const commonsChanges = modifiedFiles.filter(file => file.startsWith('commons/'));
    const otherChanges = modifiedFiles.filter(file => !file.startsWith('commons/'));

    // changes include both commons and other files
    if (commonsChanges.length > 0 && otherChanges.length > 0) {
        console.error("Error: Changes in both 'commons/' and other folders are not allowed in the same commit");
        process.exit(1);  // Exit with error
    }

    // Original functionality: Check if there are any partial model files staged (_*.json)
    const modifiedPartials = modifiedFiles.filter(file => file.match(/(^|\/)_.*.json/));
    if (modifiedPartials.length > 0) {
        const output = await run('npm run build:json --silent');
        console.log(output);
        await run('git add .');
    }
} catch (error) {
    console.error(`Error during pre-commit hook: ${error.message}`);
    process.exit(1);
}
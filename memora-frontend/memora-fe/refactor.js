const fs = require('fs');
const path = './src/components/ui/Card.tsx';
let code = fs.readFileSync(path, 'utf8');

// Find the string splitting logic (lines 287-303)
const splitLogicRegex = /\/\/ Split text into initial 2-line head[\s\S]*?const isLongText = Boolean\(tailText\);/m;
const splitLogicMatch = code.match(splitLogicRegex);
if (!splitLogicMatch) { console.log('split logic not found'); process.exit(1); }
const splitLogic = splitLogicMatch[0];

// Find the Note Editor UI block (lines 356-508)
// It starts with {/* 3. Description Note & Editor Section
// and ends with </div> right before ); })()}
const editorStartRegex = /\{\/\* 3\. Description Note & Editor Section[\s\S]*?<\/\s*div\>\s*\)\s*:\s*\([\s\S]*?<\/\s*div\>\s*\)\}\s*<\/\s*div\>\s*<\/\s*div\>/m;
const editorMatch = code.match(editorStartRegex);
if (!editorMatch) { console.log('editor block not found'); process.exit(1); }
const editorBlock = editorMatch[0];

// Create the renderNoteEditor function
const renderNoteEditorCode = `    const renderNoteEditor = () => {
        ${splitLogic}

        return (
            ${editorBlock}
        );
    };`;

// Inject the function before the main return statement
code = code.replace(/    return \(\s*<>/, renderNoteEditorCode + '\n\n    return (\n        <>');

// Remove the extracted blocks from the youtube section and replace with {renderNoteEditor()}
code = code.replace(splitLogic, '');
code = code.replace(editorBlock, '{renderNoteEditor()}');

// Modify the isArticle section
const articleStart = code.indexOf('{isArticle && (\n                    <a');
if (articleStart === -1) { console.log('article section not found'); process.exit(1); }

// Find the closing </a> for the article
const articleEndStr = '</a>\n                )}';
const articleEnd = code.indexOf(articleEndStr, articleStart);
if (articleEnd === -1) { console.log('article end not found'); process.exit(1); }

// Replace the article wrapper
const articlePart = code.substring(articleStart, articleEnd + '</a>'.length);
const newArticlePart = articlePart.replace(
    '{isArticle && (\n                    <a',
    '{isArticle && (\n                    <div className="flex flex-col gap-3 h-full">\n                    <a'
) + '\n                    {renderNoteEditor()}\n                    </div>';
code = code.substring(0, articleStart) + newArticlePart + code.substring(articleEnd + '</a>'.length);

fs.writeFileSync(path, code);
console.log('Successfully refactored Card.tsx');

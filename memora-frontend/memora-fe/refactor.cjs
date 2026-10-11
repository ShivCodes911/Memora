const fs = require('fs');
const path = './src/components/ui/Card.tsx';
let code = fs.readFileSync(path, 'utf8');

const logicStart = code.indexOf('                    // Split text into initial');
const logicEnd = code.indexOf('                    const isLongText = Boolean(tailText);') + '                    const isLongText = Boolean(tailText);'.length;
const splitLogic = code.substring(logicStart, logicEnd);

const editorStart = code.indexOf('                        {/* 3. Description Note & Editor Section');
let editorEnd = code.indexOf('                        </div>\r\n                    </div>\r\n                    );\r\n                })()}');
if (editorEnd === -1) {
    editorEnd = code.indexOf('                        </div>\n                    </div>\n                    );\n                })()}');
}
const editorBlock = code.substring(editorStart, editorEnd + '                        </div>'.length);

const renderNoteEditorCode = `    const renderNoteEditor = () => {
${splitLogic}

        return (
${editorBlock}
        );
    };`;

code = code.replace('    return (\r\n        <>', renderNoteEditorCode + '\n\n    return (\n        <>');
code = code.replace('    return (\n        <>', renderNoteEditorCode + '\n\n    return (\n        <>');

code = code.replace(splitLogic, '');
code = code.replace(editorBlock, '                        {renderNoteEditor()}');

const articleStart = code.indexOf('{isArticle && (');
let articleEndStr = '</a>\r\n                )}';
let articleEnd = code.indexOf(articleEndStr, articleStart);
if (articleEnd === -1) {
    articleEndStr = '</a>\n                )}';
    articleEnd = code.indexOf(articleEndStr, articleStart);
}

const articlePart = code.substring(articleStart, articleEnd + articleEndStr.length);
let newArticlePart = articlePart.replace('{isArticle && (\r\n                    <a', '{isArticle && (\n                    <div className="flex flex-col gap-3 h-full w-full">\n                    <a');
newArticlePart = newArticlePart.replace('{isArticle && (\n                    <a', '{isArticle && (\n                    <div className="flex flex-col gap-3 h-full w-full">\n                    <a');
newArticlePart = newArticlePart.replace('</a>\r\n                )}', '</a>\n                    {renderNoteEditor()}\n                    </div>\n                )}');
newArticlePart = newArticlePart.replace('</a>\n                )}', '</a>\n                    {renderNoteEditor()}\n                    </div>\n                )}');

code = code.substring(0, articleStart) + newArticlePart + code.substring(articleEnd + articleEndStr.length);
code = code.replace(/Write a note about this video\.\.\./g, 'Write a personal note...');

fs.writeFileSync(path, code);

import * as vscode from 'vscode';

// Базовые цвета
const COLORS = [
    "rgba(255, 180, 255, 0.25)",  // Нежный розово-фиолетовый (soft pink-violet)
    "rgba(220, 140, 255, 0.25)",  // Лавандовый (lavender)
    "rgba(185, 100, 255, 0.25)",  // Светло-фиолетовый
    "rgba(150, 60, 255, 0.25)",   // Чистый фиолетовый
    "rgba(120, 50, 230, 0.25)",   // Глубокий фиолетовый
    "rgba(95, 40, 200, 0.25)",    // Темный пурпурный
    "rgba(70, 30, 170, 0.25)",    // Холодный индиго
];

export function activate(context: vscode.ExtensionContext) {
    console.log("Horizontal Rainbow Activated!");

    let timeShift = 0;
    let decorations: vscode.TextEditorDecorationType[] = [];

    function createDecorations() {
        decorations.forEach(d => d.dispose());
        decorations = [];

        for (let i = 0; i < COLORS.length; i++) {
            decorations.push(
                vscode.window.createTextEditorDecorationType({
                    backgroundColor: COLORS[i],
                    border: `1px solid ${COLORS[i]}`,
                    borderWidth: "0 0 0 2px"
                })
            );
        }
    }

    function updateRainbow() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;
        const lines = doc.getText().split("\n");

        const ranges: vscode.Range[][] = COLORS.map(() => []);

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];

            const m = line.match(/^[ ]+/);
            if (!m) continue;

            const indent = m[0].length;
            const tabCount = Math.floor(indent / 4);

            for (let tab = 0; tab < tabCount; tab++) {
                const startCol = tab * 4;
                const endCol = startCol + 4;

                const colorIndex = (tab + timeShift) % COLORS.length;

                ranges[colorIndex].push(
                    new vscode.Range(
                        new vscode.Position(lineIndex, startCol),
                        new vscode.Position(lineIndex, endCol)
                    )
                );
            }
        }

        ranges.forEach((r, i) => {
            editor.setDecorations(decorations[i], r);
        });
    }

    // Анимация
    const interval = setInterval(() => {
        timeShift = (timeShift + 1) % COLORS.length;
        createDecorations();
        updateRainbow();
    }, 1000);

    context.subscriptions.push(
        { dispose: () => clearInterval(interval) },
        vscode.window.onDidChangeActiveTextEditor(() => updateRainbow()),
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === vscode.window.activeTextEditor?.document)
                updateRainbow();
        })
    );

    createDecorations();
    updateRainbow();
}

export function deactivate() {}

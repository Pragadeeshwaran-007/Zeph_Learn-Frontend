import Editor from "@monaco-editor/react";
import { LANGUAGES, getLanguage } from "@/utils/languageMap";

export function CodeEditor({
  value,
  onChange,
  languageId,
  onLanguageChange,
}: {
  value: string;
  onChange: (v: string) => void;
  languageId: number;
  onLanguageChange: (id: number) => void;
}) {
  const lang = getLanguage(languageId);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">CODE</span>
        <select
          value={languageId}
          onChange={(e) => onLanguageChange(Number(e.target.value))}
          className="rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          theme="vs-dark"
          language={lang.monaco}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}

export const LANGUAGES = [
  { id: 54, name: "C++", monaco: "cpp", boilerplate: `#include <iostream>\nusing namespace std;\nint main() {\n    // your code\n    return 0;\n}\n` },
  { id: 62, name: "Java", monaco: "java", boilerplate: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        // your code\n    }\n}\n` },
  { id: 71, name: "Python", monaco: "python", boilerplate: `# your code\n` },
  { id: 63, name: "JavaScript", monaco: "javascript", boilerplate: `// your code\n` },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const getLanguage = (id: number) => LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];

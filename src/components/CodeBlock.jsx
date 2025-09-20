import { useEffect } from "react";
import hljs from "highlight.js";

const CodeBlock = ({ code, language }) => {
  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  return (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-left text-sm font-mono w-full whitespace-pre-wrap shadow-lg">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

export default CodeBlock;

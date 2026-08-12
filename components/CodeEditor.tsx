import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  disabled?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
  return (
    <div className="flex flex-col h-full min-h-[300px] bg-gray-900 rounded-lg overflow-hidden border border-gray-700 font-mono text-sm shadow-xl">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <span className="text-gray-400 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          script.py
        </span>
        <span className="text-xs text-gray-500">Python 3.10 (Simulé)</span>
      </div>
      <div className="relative flex-1">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-full p-4 bg-[#1e1e1e] text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-mono"
          spellCheck={false}
          style={{ tabSize: 4 }}
        />
      </div>
    </div>
  );
};

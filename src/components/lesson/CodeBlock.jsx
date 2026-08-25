import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useContext } from 'react';
import { DarkModeContext } from '../../context/DarkModeContext';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CodeBlock({ children, language = 'bash', showLineNumbers = false }) {
  const { isDarkMode } = useContext(DarkModeContext);
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Copy code"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Copy size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? vscDarkPlus : vs}
        showLineNumbers={showLineNumbers}
        customStyle={{
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

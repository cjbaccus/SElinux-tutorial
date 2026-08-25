import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, RotateCcw } from 'lucide-react';
import { executeCommand } from '../../data/commandDatabase';

export function TerminalSimulator({
  prompt = '[root@selinux ~]#',
  initialOutput = '',
  expectedCommands = [],
  onCommandExecuted,
  onValidationComplete,
}) {
  const [history, setHistory] = useState(
    initialOutput ? [{ type: 'output', content: initialOutput }] : []
  );
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRoot, setIsRoot] = useState(true);
  const [executedCommands, setExecutedCommands] = useState([]);

  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();

    if (!currentInput.trim()) return;

    // Add command to history display
    setHistory((prev) => [
      ...prev,
      { type: 'command', content: currentInput, prompt },
    ]);

    // Execute command
    const result = executeCommand(currentInput, { isRoot });

    // Handle clear command
    if (result.output === 'CLEAR') {
      setHistory([]);
      setCurrentInput('');
      return;
    }

    // Add output to history
    if (result.output) {
      setHistory((prev) => [
        ...prev,
        { type: 'output', content: result.output, error: result.error },
      ]);
    }

    // Track executed commands for validation
    const newExecutedCommands = [...executedCommands, currentInput];
    setExecutedCommands(newExecutedCommands);

    // Notify parent
    if (onCommandExecuted) {
      onCommandExecuted(currentInput, result);
    }

    // Check if all expected commands have been executed
    if (expectedCommands.length > 0 && onValidationComplete) {
      const allExecuted = expectedCommands.every((cmd) =>
        newExecutedCommands.includes(cmd)
      );
      if (allExecuted) {
        onValidationComplete(true);
      }
    }

    // Update command history for arrow key navigation
    setCommandHistory((prev) => [...prev, currentInput]);
    setHistoryIndex(-1);
    setCurrentInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1
          ? historyIndex + 1
          : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  const handleReset = () => {
    setHistory(initialOutput ? [{ type: 'output', content: initialOutput }] : []);
    setCurrentInput('');
    setExecutedCommands([]);
  };

  return (
    <div className="my-6 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={16} className="text-green-400" />
          <span className="text-sm text-gray-300 font-mono">Terminal Simulator</span>
        </div>
        <button
          onClick={handleReset}
          className="text-gray-400 hover:text-gray-300 transition-colors"
          title="Reset terminal"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="code-terminal h-96 overflow-y-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* History */}
        {history.map((entry, index) => (
          <div key={index} className="mb-1">
            {entry.type === 'command' && (
              <div className="flex items-start">
                <span className="text-green-400 mr-2">{entry.prompt}</span>
                <span className="text-white">{entry.content}</span>
              </div>
            )}
            {entry.type === 'output' && (
              <pre className={`whitespace-pre-wrap ${entry.error ? 'text-red-400' : 'text-gray-300'}`}>
                {entry.content}
              </pre>
            )}
          </div>
        ))}

        {/* Current Input Line */}
        <form onSubmit={handleCommand} className="flex items-start">
          <span className="text-green-400 mr-2">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      {/* Expected Commands Hint */}
      {expectedCommands.length > 0 && (
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Expected: {expectedCommands.filter(cmd => !executedCommands.includes(cmd)).length} command(s) remaining
          </div>
        </div>
      )}
    </div>
  );
}

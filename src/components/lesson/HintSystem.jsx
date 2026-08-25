import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../common/Button';

export function HintSystem({ hints = [] }) {
  const [revealedHints, setRevealedHints] = useState([]);
  const [expanded, setExpanded] = useState(false);

  if (!hints || hints.length === 0) {
    return null;
  }

  const revealNextHint = () => {
    if (revealedHints.length < hints.length) {
      setRevealedHints([...revealedHints, hints[revealedHints.length]]);
      setExpanded(true);
    }
  };

  const allRevealed = revealedHints.length === hints.length;

  return (
    <div className="my-6 bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Need a Hint?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {revealedHints.length} of {hints.length} hints revealed
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="text-gray-600 dark:text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-600 dark:text-gray-400" size={20} />
        )}
      </button>

      {/* Hints */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-4 space-y-3">
              {revealedHints.map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 flex-1">
                      {hint}
                    </p>
                  </div>
                </motion.div>
              ))}

              {!allRevealed && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={revealNextHint}
                  className="w-full"
                >
                  Reveal Next Hint ({revealedHints.length + 1}/{hints.length})
                </Button>
              )}

              {allRevealed && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
                  All hints revealed. You've got this!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

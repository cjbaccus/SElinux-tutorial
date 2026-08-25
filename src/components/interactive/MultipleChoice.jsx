import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '../common/Button';

export function MultipleChoice({
  question,
  options,
  correctAnswer,
  explanation,
  onCorrect,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct && onCorrect) {
      onCorrect();
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
  };

  return (
    <div className="my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {question}
      </h3>

      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === correctAnswer;
          const showCorrect = showResult && isCorrectOption;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <motion.button
              key={index}
              onClick={() => !showResult && setSelectedAnswer(index)}
              disabled={showResult}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected && !showResult
                  ? 'border-selinux-500 bg-selinux-50 dark:bg-selinux-900/20'
                  : 'border-gray-200 dark:border-gray-700'
                }
                ${showCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : ''
                }
                ${showIncorrect
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : ''
                }
                ${!showResult ? 'hover:border-selinux-400 cursor-pointer' : 'cursor-not-allowed'}
              `}
              whileHover={!showResult ? { scale: 1.01 } : {}}
              whileTap={!showResult ? { scale: 0.99 } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{option}</span>
                {showCorrect && (
                  <Check className="text-green-500 flex-shrink-0 ml-2" size={20} />
                )}
                {showIncorrect && (
                  <X className="text-red-500 flex-shrink-0 ml-2" size={20} />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`
              p-4 rounded-lg mb-4
              ${isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              {isCorrect ? (
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
              ) : (
                <X className="text-red-500 flex-shrink-0 mt-1" size={20} />
              )}
              <div>
                <p className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {explanation && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {explanation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {showResult ? (
          <Button onClick={handleReset} variant="secondary" size="sm">
            Try Again
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            size="sm"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
}

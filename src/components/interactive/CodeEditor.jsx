import { useState } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Check, X, Eye } from 'lucide-react';
import { Button } from '../common/Button';
import { useContext } from 'react';
import { DarkModeContext } from '../../context/DarkModeContext';

export function CodeEditorWidget({
  title,
  description,
  initialCode = '',
  language = 'shell',
  expectedOutput,
  validator,
  hint,
  onSuccess,
}) {
  const { isDarkMode } = useContext(DarkModeContext);
  const [code, setCode] = useState(initialCode);
  const [showValidation, setShowValidation] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleValidate = () => {
    if (validator) {
      const result = validator(code);
      setIsValid(result.valid);
      setValidationMessage(result.message || '');
      setShowValidation(true);

      if (result.valid && onSuccess) {
        onSuccess();
      }
    } else if (expectedOutput) {
      const trimmedCode = code.trim();
      const trimmedExpected = expectedOutput.trim();
      const valid = trimmedCode === trimmedExpected;

      setIsValid(valid);
      setValidationMessage(
        valid ? 'Perfect! Your code is correct.' : 'Not quite right. Check your code and try again.'
      );
      setShowValidation(true);

      if (valid && onSuccess) {
        onSuccess();
      }
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setShowValidation(false);
    setShowHint(false);
  };

  return (
    <div className="my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Editor */}
      <div className="p-6">
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <CodeEditor
            value={code}
            language={language}
            placeholder="Type your code here..."
            onChange={(e) => setCode(e.target.value)}
            padding={15}
            style={{
              fontSize: 14,
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
              minHeight: '200px',
            }}
          />
        </div>

        {/* Validation Result */}
        {showValidation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              mt-4 p-4 rounded-lg border-2
              ${isValid
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              {isValid ? (
                <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
              ) : (
                <X className="text-red-500 flex-shrink-0 mt-1" size={20} />
              )}
              <p className={`text-sm ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {validationMessage}
              </p>
            </div>
          </motion.div>
        )}

        {/* Hint */}
        {showHint && hint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Hint:</strong> {hint}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <div className="space-x-2">
            {hint && !showHint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
              >
                <Eye size={16} className="mr-2" />
                Show Hint
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleValidate}>
              Validate Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

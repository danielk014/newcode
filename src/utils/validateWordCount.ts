export const validateWordCount = (text: string) => {
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = 30000;
  
  return {
    isValid: wordCount <= maxWords,
    wordCount,
    errorMessage: wordCount > maxWords ? `${wordCount} words exceeds maximum of ${maxWords}` : ''
  };
};
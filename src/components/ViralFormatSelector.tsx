
import React from 'react';

interface ViralFormatSelectorProps {
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  userInput?: string;
  setUserInput?: React.Dispatch<React.SetStateAction<string>>;
}

export const ViralFormatSelector: React.FC<ViralFormatSelectorProps> = ({
  selectedFormat,
  onFormatSelect,
  onNext,
  onBack,
  userInput,
  setUserInput
}) => {
  // Auto-select the default format without showing UI
  React.useEffect(() => {
    if (!selectedFormat) {
      onFormatSelect('Copy Reference Script Format');
    }
  }, [selectedFormat, onFormatSelect]);

  // Automatically proceed to next step when format is selected
  React.useEffect(() => {
    if (selectedFormat && onNext) {
      onNext();
    }
  }, [selectedFormat, onNext]);

  // Return null to hide the component entirely
  return null;
};

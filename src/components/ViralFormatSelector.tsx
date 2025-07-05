
import React from 'react';

interface ViralFormatSelectorProps {
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
}

export const ViralFormatSelector: React.FC<ViralFormatSelectorProps> = ({
  selectedFormat,
  onFormatSelect
}) => {
  // Auto-select the default format without showing UI
  React.useEffect(() => {
    if (!selectedFormat) {
      onFormatSelect('Copy Reference Script Format');
    }
  }, [selectedFormat, onFormatSelect]);

  // Return null to hide the component entirely
  return null;
};

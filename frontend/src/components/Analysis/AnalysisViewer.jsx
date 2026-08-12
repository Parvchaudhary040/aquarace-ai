import React, { useRef } from 'react';
import ImageUploader from '../ImageUploader';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function AnalysisViewer({ onAnalyze, isLoading }) {
  const containerRef = useRef();
  useScrollAnimation(containerRef, 'scaleUp');

  return (
    <div ref={containerRef} className="w-full relative">
      <ImageUploader onAnalyze={onAnalyze} isLoading={isLoading} />
    </div>
  );
}

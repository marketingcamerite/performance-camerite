
import React from 'react';
import type { Segment } from '../types';

interface SegmentTabsProps {
  segments: Segment[];
  activeSegment: Segment;
  onSegmentChange: (segment: Segment) => void;
}

const SegmentTabs: React.FC<SegmentTabsProps> = ({ segments, activeSegment, onSegmentChange }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 border-b border-slate-800">
        {segments.map((segment) => (
          <button
            key={segment}
            onClick={() => onSegmentChange(segment)}
            className={`px-4 py-3 font-medium text-sm transition-colors duration-200
              ${activeSegment === segment
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            {segment}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentTabs;

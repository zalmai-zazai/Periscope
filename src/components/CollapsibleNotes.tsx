"use client";

import { useState } from "react";

interface CollapsibleNotesProps {
  notes: string;
  maxLength?: number;
}

export function CollapsibleNotes({
  notes,
  maxLength = 150,
}: CollapsibleNotesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (notes.length <= maxLength) {
    return <p className="text-sm text-gray-600 dark:text-gray-300">{notes}</p>;
  }

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {isExpanded ? notes : `${notes.slice(0, maxLength)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      </p>
    </div>
  );
}

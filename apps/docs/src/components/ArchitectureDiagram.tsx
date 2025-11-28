import { useState } from 'react';
import PatternIcon, { type PatternType } from './PatternIcon';

export type DiagramLevel = 'minimal' | 'boundaries' | 'folders' | 'detailed';

interface Boundary {
  name: string;
  pattern: string;
  description: string;
  layer: number;
  color: string;
  folder?: string;
  files?: string[];
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface ArchitectureDiagramProps {
  pattern: PatternType;
  boundaries: Boundary[];
  connections: Connection[];
  defaultLevel?: DiagramLevel;
}

const LEVEL_DESCRIPTIONS = {
  minimal: 'Pattern Icon',
  boundaries: 'Boundaries & Flow',
  folders: 'Folder Structure',
  detailed: 'Complete Structure',
};

export default function ArchitectureDiagram({
  pattern,
  boundaries,
  connections,
  defaultLevel = 'minimal',
}: ArchitectureDiagramProps) {
  const [level, setLevel] = useState<DiagramLevel>(defaultLevel);

  const renderMinimal = () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <PatternIcon pattern={pattern} size={300} />
    </div>
  );

  const renderBoundaries = () => {
    const sortedBoundaries = [...boundaries].sort((a, b) => a.layer - b.layer);

    return (
      <div className="flex flex-col items-center justify-center gap-8 p-8 min-h-[400px]">
        <svg width="100%" height="400" viewBox="0 0 800 400">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#7cb89d" />
            </marker>
          </defs>

          {/* Render boundaries as nodes */}
          {sortedBoundaries.map((boundary, index) => {
            const y = 80 + index * 80;
            const x = 400;

            return (
              <g key={boundary.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <rect
                  x={x - 120}
                  y={y - 30}
                  width="240"
                  height="60"
                  rx="8"
                  fill={boundary.color}
                  stroke="#666"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="600"
                  fill="#333"
                >
                  {boundary.name}
                </text>
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#555"
                >
                  {boundary.description}
                </text>
              </g>
            );
          })}

          {/* Render connections */}
          {connections.map((conn, index) => {
            const fromIndex = sortedBoundaries.findIndex((b) => b.name === conn.from);
            const toIndex = sortedBoundaries.findIndex((b) => b.name === conn.to);

            if (fromIndex === -1 || toIndex === -1) return null;

            const y1 = 80 + fromIndex * 80 + 30;
            const y2 = 80 + toIndex * 80 - 30;
            const x = 400;

            return (
              <line
                key={`${conn.from}-${conn.to}-${index}`}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                className="connection-arrow"
                style={{ animationDelay: `${(index + sortedBoundaries.length) * 0.1}s` }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderFolders = () => {
    // Group boundaries by folder
    const folderGroups = boundaries.reduce(
      (acc, boundary) => {
        const folder = boundary.folder || 'root';
        if (!acc[folder]) acc[folder] = [];
        acc[folder].push(boundary);
        return acc;
      },
      {} as Record<string, Boundary[]>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {Object.entries(folderGroups).map(([folder, bounds], folderIndex) => (
          <div
            key={folder}
            className="boundary-folder-card animate-fade-in-up"
            style={{ animationDelay: `${folderIndex * 0.1}s` }}
          >
            <div className="folder-header">
              <span className="folder-icon">📁</span>
              <h3 className="folder-name">{folder}/</h3>
            </div>
            <div className="folder-contents">
              {bounds.map((boundary) => (
                <div
                  key={boundary.name}
                  className="boundary-node"
                  style={{ borderLeft: `4px solid ${boundary.color}` }}
                >
                  <div className="boundary-node-label">{boundary.name}</div>
                  <div className="boundary-node-desc">{boundary.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailed = () => {
    const sortedBoundaries = [...boundaries].sort((a, b) => a.layer - b.layer);

    return (
      <div className="detailed-view p-8">
        {sortedBoundaries.map((boundary, index) => (
          <div
            key={boundary.name}
            className="boundary-detail-card animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="boundary-detail-header" style={{ background: boundary.color }}>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{boundary.name}</h3>
                <p className="text-sm text-gray-600">{boundary.description}</p>
              </div>
              <div className="text-xs bg-white bg-opacity-50 px-3 py-1 rounded-full">
                Layer {boundary.layer}
              </div>
            </div>
            <div className="boundary-detail-content">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">PATTERN</div>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{boundary.pattern}</code>
              </div>
              {boundary.folder && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-1">FOLDER</div>
                  <div className="flex items-center gap-2">
                    <span>📁</span>
                    <span className="text-sm font-mono">{boundary.folder}/</span>
                  </div>
                </div>
              )}
              {boundary.files && boundary.files.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2">EXAMPLE FILES</div>
                  <div className="space-y-1">
                    {boundary.files.map((file) => (
                      <div key={file} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">📄</span>
                        <code className="text-xs bg-gray-50 px-2 py-0.5 rounded">{file}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Show connections from this boundary */}
            {connections.filter((c) => c.from === boundary.name).length > 0 && (
              <div className="boundary-connections">
                <div className="text-xs font-semibold text-gray-500 mb-2">CAN IMPORT FROM</div>
                <div className="flex flex-wrap gap-2">
                  {connections
                    .filter((c) => c.from === boundary.name)
                    .map((conn, i) => (
                      <div
                        key={i}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full"
                      >
                        → {conn.to}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (level) {
      case 'minimal':
        return renderMinimal();
      case 'boundaries':
        return renderBoundaries();
      case 'folders':
        return renderFolders();
      case 'detailed':
        return renderDetailed();
      default:
        return renderMinimal();
    }
  };

  return (
    <div className="arch-diagram-container">
      <div className="arch-diagram-controls">
        {(['minimal', 'boundaries', 'folders', 'detailed'] as DiagramLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`arch-control-btn ${level === lvl ? 'active' : ''}`}
          >
            {LEVEL_DESCRIPTIONS[lvl]}
          </button>
        ))}
      </div>

      <div className="arch-diagram-canvas">{renderContent()}</div>

      <div className="diagram-level-indicator">
        Level: {LEVEL_DESCRIPTIONS[level]}
      </div>
    </div>
  );
}

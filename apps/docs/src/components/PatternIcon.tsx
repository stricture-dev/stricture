import React from 'react';

export type PatternType = 'hexagonal' | 'clean' | 'layered' | 'modular' | 'nextjs' | 'nestjs';

interface PatternIconProps {
  pattern: PatternType;
  size?: number;
  className?: string;
}

/**
 * Geometric pattern representations inspired by Monument Valley
 * - Hexagonal: A hexagon shape
 * - Clean: Concentric circles
 * - Layered: Stacked rectangles
 * - Modular: Grid of squares
 */
export default function PatternIcon({ pattern, size = 200, className = '' }: PatternIconProps) {
  const renderPattern = () => {
    switch (pattern) {
      case 'hexagonal':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`pattern-icon ${className}`}
          >
            <defs>
              <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#c5a8d9', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#9575cd', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Main hexagon */}
            <polygon
              points="100,20 170,60 170,140 100,180 30,140 30,60"
              fill="url(#hexGrad)"
              stroke="#8e24aa"
              strokeWidth="3"
              className="geo-shape animate-float"
            />
            {/* Inner hexagon */}
            <polygon
              points="100,50 145,75 145,125 100,150 55,125 55,75"
              fill="rgba(255,255,255,0.3)"
              stroke="#8e24aa"
              strokeWidth="2"
            />
            {/* Center dot */}
            <circle cx="100" cy="100" r="8" fill="#8e24aa" />
          </svg>
        );

      case 'clean':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`pattern-icon ${className}`}
          >
            <defs>
              <linearGradient id="cleanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a7d8c9', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#80cbc4', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Concentric circles */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="url(#cleanGrad)"
              stroke="#2e7d32"
              strokeWidth="3"
              className="geo-shape animate-float"
              style={{ animationDelay: '0s' }}
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="rgba(255,255,255,0.3)"
              stroke="#2e7d32"
              strokeWidth="2"
              style={{ animationDelay: '0.1s' }}
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="rgba(255,255,255,0.3)"
              stroke="#2e7d32"
              strokeWidth="2"
              style={{ animationDelay: '0.2s' }}
            />
            <circle
              cx="100"
              cy="100"
              r="20"
              fill="rgba(255,255,255,0.3)"
              stroke="#2e7d32"
              strokeWidth="2"
              style={{ animationDelay: '0.3s' }}
            />
            {/* Center dot */}
            <circle cx="100" cy="100" r="8" fill="#2e7d32" />
          </svg>
        );

      case 'layered':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`pattern-icon ${className}`}
          >
            <defs>
              <linearGradient id="layerGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ff9e80', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff7043', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="layerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ffab91', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff8a65', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="layerGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ffb8a5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff9e80', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Layered rectangles */}
            <rect
              x="20"
              y="140"
              width="160"
              height="40"
              rx="4"
              fill="url(#layerGrad1)"
              stroke="#e64a19"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0s' }}
            />
            <rect
              x="30"
              y="100"
              width="140"
              height="35"
              rx="4"
              fill="url(#layerGrad2)"
              stroke="#e64a19"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.1s' }}
            />
            <rect
              x="40"
              y="65"
              width="120"
              height="30"
              rx="4"
              fill="url(#layerGrad3)"
              stroke="#e64a19"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.2s' }}
            />
            <rect
              x="50"
              y="35"
              width="100"
              height="25"
              rx="4"
              fill="rgba(255, 255, 255, 0.4)"
              stroke="#e64a19"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.3s' }}
            />
          </svg>
        );

      case 'modular':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`pattern-icon ${className}`}
          >
            <defs>
              <linearGradient id="modGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#b3d9ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#64b5f6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Grid of modules */}
            <rect
              x="30"
              y="30"
              width="60"
              height="60"
              rx="6"
              fill="url(#modGrad)"
              stroke="#1976d2"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0s' }}
            />
            <rect
              x="110"
              y="30"
              width="60"
              height="60"
              rx="6"
              fill="rgba(179, 217, 255, 0.7)"
              stroke="#1976d2"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.1s' }}
            />
            <rect
              x="30"
              y="110"
              width="60"
              height="60"
              rx="6"
              fill="rgba(179, 217, 255, 0.7)"
              stroke="#1976d2"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.2s' }}
            />
            <rect
              x="110"
              y="110"
              width="60"
              height="60"
              rx="6"
              fill="rgba(179, 217, 255, 0.5)"
              stroke="#1976d2"
              strokeWidth="2"
              className="geo-shape"
              style={{ animationDelay: '0.3s' }}
            />
            {/* Connecting lines */}
            <line
              x1="90"
              y1="60"
              x2="110"
              y2="60"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <line
              x1="60"
              y1="90"
              x2="60"
              y2="110"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4"
            />
            <line
              x1="140"
              y1="90"
              x2="140"
              y2="110"
              stroke="#1976d2"
              strokeWidth="2"
              strokeDasharray="4"
            />
          </svg>
        );

      case 'nextjs':
      case 'nestjs':
        // For framework-specific patterns, use a simplified version of the modular pattern
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={`pattern-icon ${className}`}
          >
            <defs>
              <linearGradient id="fwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#b3d9ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#64b5f6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect
              x="50"
              y="50"
              width="100"
              height="100"
              rx="8"
              fill="url(#fwGrad)"
              stroke="#1976d2"
              strokeWidth="3"
              className="geo-shape animate-float"
            />
            <circle cx="100" cy="100" r="30" fill="rgba(255,255,255,0.3)" />
            <circle cx="100" cy="100" r="15" fill="rgba(255,255,255,0.5)" />
          </svg>
        );

      default:
        return null;
    }
  };

  return <div className="pattern-icon-wrapper">{renderPattern()}</div>;
}

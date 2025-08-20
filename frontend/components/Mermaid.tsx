import React, { useEffect, useRef } from "react";
import { useMermaid } from "@/hooks/use-mermaid";
import { validateMermaidSyntax, MERMAID_EXAMPLES, getMermaidErrorMessage } from "@/lib/mermaid-utils";

export interface MermaidProps {
  text: string;
  className?: string;
  height?: string;
  theme?: 'dark' | 'base' | 'default' | 'forest' | 'neutral';
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export const Mermaid: React.FC<MermaidProps> = ({ 
  text, 
  className = "", 
  height = "auto",
  theme = "dark",
  onError,
  onSuccess
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderDiagram, isLoading, error, svgContent, reset } = useMermaid({ 
    theme, 
    height, 
    className 
  });

  // Render diagram when text changes
  useEffect(() => {
    if (text && text.trim()) {
      renderDiagram(text);
    } else {
      reset();
    }
  }, [text, renderDiagram, reset]);

  // Handle errors and success
  useEffect(() => {
    if (error && onError) {
      onError(error);
    } else if (svgContent && onSuccess) {
      onSuccess();
    }
  }, [error, svgContent, onError, onSuccess]);

  // Apply SVG content to container when it changes
  useEffect(() => {
    if (containerRef.current && svgContent) {
      // Clear previous content
      containerRef.current.innerHTML = "";
      
      // Create temporary div to process SVG
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = svgContent;
      const svgElement = tempDiv.querySelector("svg");
      
      if (svgElement) {
        // Apply responsive styling
        svgElement.style.width = "100%";
        svgElement.style.height = height;
        svgElement.style.maxWidth = "100%";
        svgElement.style.overflow = "visible";
        
        // Ensure text elements are properly styled
        const textElements = svgElement.querySelectorAll("text");
        textElements.forEach((text) => {
          const textElement = text as SVGTextElement;
          textElement.style.fontFamily = "Inter, sans-serif";
          textElement.style.fontSize = "14px";
          textElement.style.fill = "currentColor";
        });
      }
      
      containerRef.current.innerHTML = tempDiv.innerHTML;
    }
  }, [svgContent, height]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
          <p className="text-sm text-stone-400">Rendering security diagram...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const validation = validateMermaidSyntax(text);
    const helpfulMessage = getMermaidErrorMessage(error);
    
    return (
      <div className={`bg-stone-800 border border-stone-600 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Failed to render diagram</p>
            <p className="text-sm text-stone-400">{helpfulMessage}</p>
          </div>
        </div>
        
        {/* Show the original Mermaid text for debugging */}
        <div className="mt-4 p-3 bg-stone-700 rounded border border-stone-600">
          <p className="text-xs text-stone-300 font-mono break-all">
            <strong>Mermaid Code:</strong><br />
            {text}
          </p>
        </div>
        
        {/* Show validation suggestions if available */}
        {validation.suggestions && validation.suggestions.length > 0 && (
          <div className="mt-4 p-3 bg-stone-700 rounded border border-stone-600">
            <p className="text-xs text-stone-300 mb-2">
              <strong>Suggestions:</strong>
            </p>
            <ul className="text-xs text-stone-400 space-y-1 list-disc list-inside">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            {validation.fixedText && (
              <div className="mt-2 p-2 bg-stone-600 rounded">
                <p className="text-xs text-stone-300 mb-1">
                  <strong>Try this instead:</strong>
                </p>
                <code className="text-xs text-yellow-300 font-mono break-all">
                  {validation.fixedText}
                </code>
              </div>
            )}
          </div>
        )}
        
        {/* Common Mermaid syntax examples */}
        <div className="mt-4 p-3 bg-stone-700 rounded border border-stone-600">
          <p className="text-xs text-stone-300 mb-2">
            <strong>Common Mermaid Syntax Examples:</strong>
          </p>
          <div className="text-xs text-stone-400 space-y-2">
            <details className="cursor-pointer">
              <summary className="hover:text-stone-300">Flowchart</summary>
              <pre className="mt-1 p-2 bg-stone-600 rounded text-yellow-300 font-mono text-xs overflow-x-auto">
                {MERMAID_EXAMPLES.flowchart}
              </pre>
            </details>
            <details className="cursor-pointer">
              <summary className="hover:text-stone-300">Sequence Diagram</summary>
              <pre className="mt-1 p-2 bg-stone-600 rounded text-yellow-300 font-mono text-xs overflow-x-auto">
                {MERMAID_EXAMPLES.sequence}
              </pre>
            </details>
          </div>
        </div>
        
        <button 
          onClick={() => renderDiagram(text)}
          className="mt-3 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-stone-900 text-sm rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Success state
  return (
    <div 
      ref={containerRef}
      className={`bg-stone-800 border border-stone-600 rounded-lg p-4 overflow-auto ${className}`}
      style={{ minHeight: "200px" }}
    />
  );
};

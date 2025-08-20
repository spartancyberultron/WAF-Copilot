import { useState, useCallback, useRef, useEffect } from 'react';
import mermaid from 'mermaid';

interface UseMermaidOptions {
  theme?: 'dark' | 'base' | 'default' | 'forest' | 'neutral';
  height?: string;
  className?: string;
}

interface UseMermaidReturn {
  renderDiagram: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  svgContent: string;
  reset: () => void;
}

export function useMermaid(options: UseMermaidOptions = {}): UseMermaidReturn {
  const { theme = 'dark', height = 'auto', className = '' } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const renderIdRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Initialize Mermaid once
  const initializeMermaid = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      await mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme,
        logLevel: 1,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 50,
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
          mirrorActors: true,
          bottomMarginAdj: 1,
          rightAngles: false,
          showSequenceNumbers: false,
          actorFontSize: 14,
          actorFontFamily: 'Inter, sans-serif',
          noteFontSize: 14,
          noteFontFamily: 'Inter, sans-serif',
          messageFontSize: 16,
          messageFontFamily: 'Inter, sans-serif',
          wrap: true,
          wrapPadding: 10,
          labelBoxWidth: 50,
          labelBoxHeight: 20,
        },
        gantt: {
          useMaxWidth: true,
          leftPadding: 75,
          rightPadding: 75,
          topPadding: 50,
          titleTopMargin: 25,
          barHeight: 20,
          barGap: 4,
          gridLineStartPadding: 35,
          fontSize: 11,
          numberSectionStyles: 4,
          axisFormat: '%Y-%m-%d',
          topAxis: false,
        },
        themeVariables: {
          darkMode: theme === 'dark',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          primaryColor: '#fbbf24',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#f59e0b',
          secondaryColor: '#374151',
          secondaryTextColor: '#f9fafb',
          secondaryBorderColor: '#4b5563',
          tertiaryColor: '#1f2937',
          tertiaryTextColor: '#f9fafb',
          tertiaryBorderColor: '#374151',
          noteBkgColor: '#fbbf24',
          noteTextColor: '#1f2937',
          noteBorderColor: '#f59e0b',
          errorBkgColor: '#ef4444',
          errorTextColor: '#ffffff',
          errorBorderColor: '#dc2626',
          successBkgColor: '#10b981',
          successTextColor: '#ffffff',
          successBorderColor: '#059669',
          warningBkgColor: '#f59e0b',
          warningTextColor: '#1f2937',
          warningBorderColor: '#d97706',
          infoBkgColor: '#3b82f6',
          infoTextColor: '#ffffff',
          infoBorderColor: '#2563eb',
          nodeSpacing: 50,
          rankSpacing: 50,
          messageFontSize: 16,
          messageFontFamily: 'Inter, sans-serif',
          messageFontWeight: 400,
          messageMargin: 10,
          primaryBorderRadius: 8,
          secondaryBorderRadius: 8,
          tertiaryBorderRadius: 8,
          noteBorderRadius: 8,
          errorBorderRadius: 8,
          successBorderRadius: 8,
          warningBorderRadius: 8,
          infoBorderRadius: 8,
        },
      });
      isInitializedRef.current = true;
    } catch (err) {
      console.error('Failed to initialize Mermaid:', err);
      throw new Error('Failed to initialize diagram renderer');
    }
  }, [theme]);

  // Generate unique ID for each diagram
  const generateId = useCallback(() => {
    return `mermaid-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Render diagram with proper cleanup and error handling
  const renderDiagram = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      setError(null);
      setSvgContent('');
      return;
    }

    // Generate new unique ID for this render
    const newId = generateId();
    renderIdRef.current = newId;

    try {
      // Initialize Mermaid if not already done
      await initializeMermaid();

      setIsLoading(true);
      setError(null);

      // Clean and validate the Mermaid text
      let cleanText = text.trim();
      
      // Common Mermaid syntax fixes
      if (!cleanText.startsWith('graph') && 
          !cleanText.startsWith('flowchart') && 
          !cleanText.startsWith('sequenceDiagram') && 
          !cleanText.startsWith('classDiagram') && 
          !cleanText.startsWith('stateDiagram') && 
          !cleanText.startsWith('erDiagram') && 
          !cleanText.startsWith('journey') && 
          !cleanText.startsWith('gantt') && 
          !cleanText.startsWith('pie') && 
          !cleanText.startsWith('quadrantChart') && 
          !cleanText.startsWith('requirement') && 
          !cleanText.startsWith('gitgraph') && 
          !cleanText.startsWith('C4Context') && 
          !cleanText.startsWith('mindmap')) {
        // Try to auto-detect and fix common issues
        if (cleanText.includes('-->') || cleanText.includes('---') || cleanText.includes('==>')) {
          cleanText = `flowchart TD\n${cleanText}`;
        } else if (cleanText.includes('participant') || cleanText.includes('->')) {
          cleanText = `sequenceDiagram\n${cleanText}`;
        } else {
          cleanText = `flowchart TD\n${cleanText}`;
        }
      }

      console.log('Attempting to render Mermaid diagram:', cleanText);

      // Validate Mermaid syntax
      try {
        await mermaid.parse(cleanText);
      } catch (parseError) {
        console.error('Mermaid parse error:', parseError);
        console.error('Original text:', text);
        console.error('Cleaned text:', cleanText);
        throw new Error(`Invalid Mermaid syntax: ${parseError}. Please check your diagram syntax.`);
      }

      // Render the diagram
      const { svg } = await mermaid.render(newId, cleanText);

      // Check if this is still the current render request
      if (renderIdRef.current === newId) {
        setSvgContent(svg);
      }
    } catch (err) {
      console.error('Error rendering Mermaid diagram:', err);
      if (renderIdRef.current === newId) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    } finally {
      if (renderIdRef.current === newId) {
        setIsLoading(false);
      }
    }
  }, [initializeMermaid, generateId]);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setSvgContent('');
    setIsLoading(false);
    renderIdRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      renderIdRef.current = '';
    };
  }, []);

  return {
    renderDiagram,
    isLoading,
    error,
    svgContent,
    reset,
  };
}

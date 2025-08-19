import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

export interface MermaidProps {
  text: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ text }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "base",
      logLevel: 5,
      themeVariables: {
        fontFamily: 'Inter',
        lineColor: 'white',
        primaryColor: '#1f2937',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#374151',
        secondaryColor: '#111827',
        secondaryTextColor: '#ffffff',
        secondaryBorderColor: '#374151',
        tertiaryColor: '#1f2937',
        tertiaryTextColor: '#ffffff',
        tertiaryBorderColor: '#374151',
        noteBkgColor: '#1f2937',
        noteTextColor: '#ffffff',
        noteBorderColor: '#374151',
        errorBkgColor: '#dc2626',
        errorTextColor: '#ffffff',
        errorBorderColor: '#ef4444',
        successBkgColor: '#059669',
        successTextColor: '#ffffff',
        successBorderColor: '#10b981',
        warningBkgColor: '#d97706',
        warningTextColor: '#ffffff',
        warningBorderColor: '#f59e0b',
        infoBkgColor: '#2563eb',
        infoTextColor: '#ffffff',
        infoBorderColor: '#3b82f6',
        // Add padding and text wrapping settings
        nodeSpacing: 50,
        rankSpacing: 50,
        messageFontSize: 16,
        messageFontFamily: 'Inter',
        messageFontWeight: 400,
        messageMargin: 10,
        // Ensure text doesn't get cut off
        primaryBorderRadius: 8,
        secondaryBorderRadius: 8,
        tertiaryBorderRadius: 8,
        noteBorderRadius: 8,
        errorBorderRadius: 8,
        successBorderRadius: 8,
        warningBorderRadius: 8,
        infoBorderRadius: 8,
      }
    });
  }, []);

  const renderMermaid = async (text: string) => {
    const { svg } = await mermaid.render('mermaid-diagram', text)
    return svg
  }

  useEffect(() => {
    if (ref.current && text && text.trim() !== "") {
      setIsLoading(true);
      ref.current.innerHTML = '';
      renderMermaid(text).then((svg) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
          // Add CSS to ensure text wrapping and proper sizing
          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.overflow = 'visible';
            // Ensure text elements wrap properly
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach((text) => {
              (text as SVGTextElement).style.wordWrap = 'break-word';
              (text as SVGTextElement).style.whiteSpace = 'normal';
            });
          }
        }
        setIsLoading(false);
      }).catch((error) => {
        console.error('Error rendering mermaid diagram:', error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [text]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600"></div>
          <p className="text-sm text-muted-foreground">Rendering diagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      key="preview" 
      ref={ref} 
      className="bg-stone-800 p-2 rounded-lg mt-2 overflow-visible" 
      style={{
        minHeight: '200px',
        width: '100%'
      }}
    />
  );
};

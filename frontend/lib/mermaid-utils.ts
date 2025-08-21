/**
 * Utility functions for working with Mermaid diagrams
 */

export interface MermaidValidationResult {
  isValid: boolean;
  error?: string;
  fixedText?: string;
  suggestions?: string[];
}

/**
 * Validates and attempts to fix common Mermaid syntax issues
 */
export function validateMermaidSyntax(text: string): MermaidValidationResult {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: 'Empty or missing Mermaid text',
      suggestions: ['Provide valid Mermaid diagram syntax']
    };
  }

  const cleanText = text.trim();
  
  // Check if it already starts with a valid diagram type
  const validStarters = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 
    'quadrantChart', 'requirement', 'gitgraph', 'C4Context', 'mindmap'
  ];

  const hasValidStarter = validStarters.some(starter => 
    cleanText.startsWith(starter)
  );

  if (hasValidStarter) {
    return { isValid: true, fixedText: cleanText };
  }

  // Try to auto-detect and fix common issues
  let fixedText = cleanText;
  let suggestions: string[] = [];

  if (cleanText.includes('-->') || cleanText.includes('---') || cleanText.includes('==>')) {
    fixedText = `flowchart TD\n${cleanText}`;
    suggestions.push('Added flowchart TD declaration for arrow-based diagram');
  } else if (cleanText.includes('participant') || cleanText.includes('->')) {
    fixedText = `sequenceDiagram\n${cleanText}`;
    suggestions.push('Added sequenceDiagram declaration for sequence-based diagram');
  } else if (cleanText.includes('class') || cleanText.includes('+') || cleanText.includes('-')) {
    fixedText = `classDiagram\n${cleanText}`;
    suggestions.push('Added classDiagram declaration for class-based diagram');
  } else {
    // Default to flowchart if we can't determine the type
    fixedText = `flowchart TD\n${cleanText}`;
    suggestions.push('Added flowchart TD declaration as default diagram type');
  }

  return {
    isValid: false,
    error: 'Missing diagram type declaration',
    fixedText,
    suggestions
  };
}

/**
 * Common Mermaid syntax examples for different diagram types
 */
export const MERMAID_EXAMPLES = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D`,
  
  sequence: `sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System->>User: Response`,
  
  class: `classDiagram
    class Animal {
      +name: string
      +age: int
      +makeSound()
    }`,
  
  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Idle: Complete`
};

/**
 * Gets a helpful error message for common Mermaid issues
 */
export function getMermaidErrorMessage(error: string): string {
  if (error.includes('syntax')) {
    return 'Check your diagram syntax. Make sure to start with a diagram type (e.g., flowchart TD, sequenceDiagram)';
  }
  if (error.includes('parse')) {
    return 'Unable to parse the diagram. Verify all nodes and connections are properly formatted.';
  }
  if (error.includes('render')) {
    return 'Failed to render the diagram. This might be due to invalid syntax or unsupported features.';
  }
  return 'An unexpected error occurred while rendering the diagram.';
}

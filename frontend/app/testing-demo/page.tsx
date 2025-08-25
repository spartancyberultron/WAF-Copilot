"use client";

import { TestingCodeGenerator } from '@/components/testing-code-generator';

export default function TestingDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">CVE Testing Code Generator</h1>
          <p className="text-lg text-muted-foreground">
            Generate Python testing code for CVE analysis and educational purposes. 
            This tool helps security engineers understand and test vulnerabilities in a controlled environment.
          </p>
        </div>
        
        <TestingCodeGenerator />
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <div className="space-y-3 text-sm">
            <p>1. <strong>Enter CVE Details:</strong> Provide the CVE ID, description, and severity level</p>
            <p>2. <strong>Generate Code:</strong> Click the generate button to create Python testing code</p>
            <p>3. <strong>Copy or Download:</strong> Use the generated code for educational testing</p>
            <p className="text-amber-600">
              ⚠️ <strong>Important:</strong> This code is for educational purposes only. 
              Always test in isolated environments and never use against production systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

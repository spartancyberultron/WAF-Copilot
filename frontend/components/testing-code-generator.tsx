"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Code, Download, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface TestingCodeResponse {
  success: boolean;
  python_code?: string;
  error?: string;
}

export function TestingCodeGenerator() {
  const { token } = useAuth();
  const [cveId, setCveId] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TestingCodeResponse | null>(null);

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  const generateTestingCode = async () => {
    if (!cveId || !description || !severity) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const response = await fetch('/api/generate-testing-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cve_id: cveId,
          description: description,
          severity: severity,
        }),
      });

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: 'Failed to generate testing code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (response?.python_code) {
      try {
        await navigator.clipboard.writeText(response.python_code);
        alert('Code copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const downloadCode = () => {
    if (response?.python_code) {
      const blob = new Blob([response.python_code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cveId}_testing_code.py`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Generate CVE Testing Code
          </CardTitle>
          <CardDescription>
            Generate Python testing code for CVE analysis and educational purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cve-id">CVE ID</Label>
              <Input
                id="cve-id"
                placeholder="e.g., CVE-2024-12345"
                value={cveId}
                onChange={(e) => setCveId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      <Badge variant={level === 'Critical' ? 'destructive' : level === 'High' ? 'default' : 'secondary'}>
                        {level}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">CVE Description</Label>
            <Textarea
              id="description"
              placeholder="Enter the CVE description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={generateTestingCode} 
            disabled={isLoading || !cveId || !description || !severity}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Generate Testing Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Code</span>
              {response.success && response.python_code && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✅ Testing code generated successfully for {cveId}
                  </p>
                </div>
                {response.python_code && (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{response.python_code}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ❌ Error: {response.error || 'Failed to generate testing code'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing API connection...');
    
    try {
      // Test basic connection
      const response = await api.get('/users/admin/stats');
      setResult(`✅ API Connection Success!\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ API Connection Failed!\nError: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await api.post('/users/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      setResult(`✅ Login Success!\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Login Failed!\nError: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Debug Tool</CardTitle>
        <CardDescription>
          Test API connection and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={testConnection} disabled={loading}>
            Test API Stats
          </Button>
          <Button onClick={testLogin} disabled={loading}>
            Test Login
          </Button>
        </div>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
          <p><strong>Current Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem('adminToken') ? 'Present' : 'None' : 'SSR'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

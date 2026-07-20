import React, { useState, useEffect } from 'react';
import { defaultTestCases, allPossibleSuggestions } from '../constants/testing';
import { TestCase, TestResult } from '../types/testing';
import { useWebsiteAudit } from '../hooks/useWebsiteAudit';
import { Play, Download, Upload, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const TestingMatrix: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    const saved = localStorage.getItem('testing_matrix_cases');
    return saved ? JSON.parse(saved) : defaultTestCases;
  });
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const { runAudit } = useWebsiteAudit();

  useEffect(() => {
    localStorage.setItem('testing_matrix_cases', JSON.stringify(testCases));
  }, [testCases]);

  const addTestCase = () => {
    const newCase: TestCase = {
      id: Date.now().toString(),
      websiteUrl: '',
      formData: {
        stage: 'Initial research',
        platforms: [],
        protocols: [],
        aiChannels: [],
        goal: ''
      },
      expectedSuggestions: []
    };
    setTestCases([...testCases, newCase]);
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
    const newResults = { ...testResults };
    delete newResults[id];
    setTestResults(newResults);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, ...updates } : tc));
  };

  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    try {
      const results = await runAudit(testCase.websiteUrl, testCase.formData);
      if (!results) throw new Error('Audit failed to return results');

      const actualSuggestions: string[] = [];
      results.readinessSignals.forEach(s => actualSuggestions.push(s.suggestion));
      results.nextSteps?.forEach(ns => ns.items.forEach(item => actualSuggestions.push(item.label)));
      results.aiVectors.forEach(v => actualSuggestions.push(v.suggestion));

      const missing = testCase.expectedSuggestions.filter(expected => 
        !actualSuggestions.some(actual => actual.toLowerCase().includes(expected.toLowerCase()))
      );

      return {
        testCaseId: testCase.id,
        status: missing.length === 0 ? 'pass' : 'fail',
        actualSuggestions,
        missingSuggestions: missing,
        unexpectedSuggestions: [], // Could be calculated if needed
        auditResults: results
      };
    } catch (err) {
      return {
        testCaseId: testCase.id,
        status: 'error',
        actualSuggestions: [],
        missingSuggestions: testCase.expectedSuggestions,
        unexpectedSuggestions: [],
        error: err instanceof Error ? err.message : String(err)
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const newResults: Record<string, TestResult> = {};
    for (const tc of testCases) {
      if (!tc.websiteUrl) continue;
      const result = await runSingleTest(tc);
      newResults[tc.id] = result;
      setTestResults(prev => ({ ...prev, [tc.id]: result }));
    }
    setIsRunning(false);
  };

  const exportMatrix = () => {
    const dataStr = JSON.stringify(testCases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'testing-matrix.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importMatrix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setTestCases(imported);
      } catch (err) {
        alert('Failed to import: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-syf-navy">Testing Matrix</h1>
          <p className="text-gray-600">Manage and run audit test cases across different websites.</p>
        </div>
        <div className="flex gap-4">
          <input
            type="file"
            id="import-input"
            className="hidden"
            accept=".json"
            onChange={importMatrix}
          />
          <button onClick={() => document.getElementById('import-input')?.click()} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-white transition">
            <Upload size={18} /> Import
          </button>
          <button onClick={exportMatrix} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-white transition">
            <Download size={18} /> Export
          </button>
          <button 
            onClick={runAllTests} 
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2 bg-syf-navy text-white rounded hover:bg-opacity-90 transition ${isRunning ? 'opacity-50' : ''}`}
          >
            <Play size={18} /> {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Website URL</th>
                <th className="p-4 font-semibold">Answers (Form Data)</th>
                {allPossibleSuggestions.map(s => (
                  <th key={s} className="p-4 font-semibold text-xs whitespace-nowrap min-w-[150px]">{s}</th>
                ))}
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => {
                const result = testResults[tc.id];
                return (
                  <tr key={tc.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      {result?.status === 'pass' && <CheckCircle className="text-green-500" size={24} />}
                      {result?.status === 'fail' && <XCircle className="text-red-500" size={24} />}
                      {result?.status === 'error' && <AlertCircle className="text-yellow-500" size={24} title={result.error} />}
                      {!result && <div className="w-6 h-6 border-2 border-dashed rounded-full border-gray-300" />}
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={tc.websiteUrl} 
                        onChange={(e) => updateTestCase(tc.id, { websiteUrl: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="https://example.com"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] space-y-1 max-w-[200px]">
                        <div><span className="font-bold">Stage:</span> {tc.formData.stage}</div>
                        <div><span className="font-bold">Platform:</span> {tc.formData.platforms?.join(', ')}</div>
                        <div><span className="font-bold">Protocols:</span> {tc.formData.protocols?.join(', ')}</div>
                        <div><span className="font-bold">Channels:</span> {tc.formData.aiChannels?.join(', ')}</div>
                        <div><span className="font-bold">Goal:</span> {tc.formData.goal}</div>
                      </div>
                    </td>
                    {allPossibleSuggestions.map(suggestion => {
                      const isExpected = tc.expectedSuggestions.includes(suggestion);
                      const isActual = result?.actualSuggestions.some(s => s.toLowerCase().includes(suggestion.toLowerCase()));
                      
                      return (
                        <td 
                          key={suggestion} 
                          className={`p-4 text-center cursor-pointer select-none ${isExpected ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            const newExpected = isExpected 
                              ? tc.expectedSuggestions.filter(s => s !== suggestion)
                              : [...tc.expectedSuggestions, suggestion];
                            updateTestCase(tc.id, { expectedSuggestions: newExpected });
                          }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isExpected ? 'bg-syf-navy border-syf-navy text-white' : 'border-gray-300'}`}>
                              {isExpected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            {result && (
                              <div className={`text-[10px] font-bold ${isActual ? 'text-green-600' : 'text-red-600'}`}>
                                {isActual ? 'TRIGGERED' : 'MISSING'}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-4 text-right">
                      <button onClick={() => removeTestCase(tc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50">
          <button onClick={addTestCase} className="flex items-center gap-2 text-syf-navy font-semibold hover:underline">
            <Plus size={18} /> Add Test Case
          </button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">Summary Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-sm text-green-700 font-semibold">Passed</div>
              <div className="text-2xl font-bold text-green-800">
                {Object.values(testResults).filter(r => r.status === 'pass').length}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-sm text-red-700 font-semibold">Failed</div>
              <div className="text-2xl font-bold text-red-800">
                {Object.values(testResults).filter(r => r.status === 'fail').length}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-sm text-yellow-700 font-semibold">Errors</div>
              <div className="text-2xl font-bold text-yellow-800">
                {Object.values(testResults).filter(r => r.status === 'error').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

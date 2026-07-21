import React, { useState, useEffect } from 'react';
import { defaultTestGroups, journeyStages, aiChannels, goals } from '../constants/testing';
import { commercePlatforms, protocols } from '../constants';
import { TestCase, TestResult, BulkTestResults, TestGroup } from '../types/testing';
import { useWebsiteAudit } from '../hooks/useWebsiteAudit';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Play, Download, Upload, Plus, Trash2, CheckCircle, AlertCircle, Eye, FileJson, Copy, FileText } from 'lucide-react';

export const TestingMatrix: React.FC = () => {
  const [testGroups, setTestGroups] = useState<TestGroup[]>(() => {
    const saved = localStorage.getItem('testing_matrix_groups');
    return saved ? JSON.parse(saved) : defaultTestGroups;
  });
  const [activeGroupId, setActiveGroupId] = useState<string>(testGroups[0]?.id || '');
  
  const activeGroup = testGroups.find(g => g.id === activeGroupId) || testGroups[0];
  const testCases = activeGroup?.testCases || [];
  const testResults = activeGroup?.results || {};

  const setTestCases = (newCases: TestCase[]) => {
    setTestGroups(groups => groups.map(g => 
      g.id === activeGroupId ? { ...g, testCases: newCases } : g
    ));
  };

  const setTestResults = (newResults: Record<string, TestResult> | ((prev: Record<string, TestResult>) => Record<string, TestResult>)) => {
    setTestGroups(groups => groups.map(g => {
      if (g.id === activeGroupId) {
        const results = typeof newResults === 'function' ? newResults(g.results || {}) : newResults;
        return { ...g, results };
      }
      return g;
    }));
  };

  const [isRunning, setIsRunning] = useState(false);
  const [showJson, setShowJson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'results'>('matrix');
  const { runAudit } = useWebsiteAudit();

  useEffect(() => {
    localStorage.setItem('testing_matrix_groups', JSON.stringify(testGroups));
  }, [testGroups]);

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

  const addTestGroup = () => {
    const newGroup: TestGroup = {
      id: Date.now().toString(),
      name: 'New Report',
      testCases: [],
      results: {}
    };
    setTestGroups([...testGroups, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  const copyTestGroup = () => {
    const groupToCopy = testGroups.find(g => g.id === activeGroupId) || testGroups[0];
    if (!groupToCopy) return;

    const newGroup: TestGroup = {
      ...groupToCopy,
      id: Date.now().toString(),
      name: `${groupToCopy.name} (Copy)`
    };
    setTestGroups([...testGroups, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  const removeTestGroup = (id: string) => {
    if (testGroups.length <= 1) {
      alert("Cannot remove the last report.");
      return;
    }
    const newGroups = testGroups.filter(g => g.id !== id);
    setTestGroups(newGroups);
    if (activeGroupId === id) {
      setActiveGroupId(newGroups[0].id);
    }
  };

  const runSingleTest = async (testCase: TestCase, onProgress?: (p: number) => void): Promise<TestResult> => {
    try {
      if (onProgress) onProgress(10);
      
      // We'll wrap the runAudit call to get progress updates if possible, 
      // but runAudit uses its own internal state. 
      // For the matrix, we'll simulate progress if needed or just wait for completion.
      
      const results = await runAudit(testCase.websiteUrl, testCase.formData);
      if (onProgress) onProgress(80);
      
      if (!results) throw new Error('Audit failed to return results');

      const actualSuggestions: string[] = [];
      results.readinessSignals.forEach(s => actualSuggestions.push(s.suggestion));
      results.nextSteps?.forEach(ns => ns.items.forEach(item => actualSuggestions.push(item.label)));
      results.aiVectors.forEach(v => actualSuggestions.push(v.suggestion));

      const confidenceScores: Record<string, string> = {};
      results.technologies.forEach(t => {
        confidenceScores[t.name] = t.confidenceLevel || t.confidence;
      });

      if (onProgress) onProgress(100);

      return {
        testCaseId: testCase.id,
        websiteUrl: testCase.websiteUrl,
        formData: testCase.formData,
        status: 'completed',
        progress: 100,
        actualSuggestions,
        missingSuggestions: [],
        unexpectedSuggestions: [],
        auditResults: results,
        assessmentResults: {
          overallScore: results.overallScore,
          tier: results.tier,
          agenticStatus: results.agenticStatus.summary
        },
        confidenceScores
      };
    } catch (err) {
      if (onProgress) onProgress(100);
      return {
        testCaseId: testCase.id,
        websiteUrl: testCase.websiteUrl,
        formData: testCase.formData,
        status: 'error',
        progress: 100,
        actualSuggestions: [],
        missingSuggestions: testCase.expectedSuggestions,
        unexpectedSuggestions: [],
        error: err instanceof Error ? err.message : String(err)
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    // Initialize results as pending/running
    const initialResults: Record<string, TestResult> = { ...testResults };
    testCases.forEach(tc => {
      if (tc.websiteUrl) {
        initialResults[tc.id] = {
          testCaseId: tc.id,
          websiteUrl: tc.websiteUrl,
          formData: tc.formData,
          status: 'pending',
          progress: 0,
          actualSuggestions: [],
          missingSuggestions: [],
          unexpectedSuggestions: []
        };
      }
    });
    setTestResults(initialResults);

    // Use a temporary results object to avoid too many state updates during the loop
    const currentResults = { ...initialResults };

    for (const tc of testCases) {
      if (!tc.websiteUrl) continue;
      
      currentResults[tc.id] = { ...currentResults[tc.id], status: 'running', progress: 10 };
      setTestResults({ ...currentResults });

      const result = await runSingleTest(tc, (p) => {
        currentResults[tc.id] = { ...currentResults[tc.id], progress: p };
        setTestResults({ ...currentResults });
      });
      
      currentResults[tc.id] = result;
      setTestResults({ ...currentResults });
    }
    setIsRunning(false);
  };

  const exportMatrix = () => {
    const dataStr = JSON.stringify(testGroups, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'testing-matrix-groups.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    const results: BulkTestResults = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testCases.length,
        completed: Object.values(testResults).filter(r => r.status === 'completed').length,
        errors: Object.values(testResults).filter(r => r.status === 'error').length,
      },
      results: Object.values(testResults)
    };
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = activeGroup ? activeGroup.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'audit-results';
    link.download = `${fileName}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };


  const exportPDF = () => {
    try {
      let leaderboardTable: any = null;

      const doc = new jsPDF();
      const fileName = activeGroup ? activeGroup.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'audit-results';
      const timestamp = new Date().toLocaleString();

      // Helper to add a page if currentY exceeds a limit
      const checkPage = (heightNeeded: number) => {
        if (currentY + heightNeeded > 270) {
          doc.addPage();
          currentY = 20;
          return true;
        }
        return false;
      };

      // Header - Black and White
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Agentic Readiness Report', 14, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Group: ${activeGroup?.name || 'Bulk Audit'}`, 14, 30);
      doc.text(`Generated: ${timestamp}`, 140, 30);

      let currentY = 50;
      const pageRefs: { url: string; page: number }[] = [];

      // Summary Section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 14, currentY);
      currentY += 10;

      const summaryData = [
        ['Total Sites Tested', testCases.length.toString()],
        ['Successfully Completed', Object.values(testResults).filter(r => r.status === 'completed').length.toString()],
        ['Errors/Failed', Object.values(testResults).filter(r => r.status === 'error').length.toString()],
        ['Average Score', (Object.values(testResults).reduce((acc, r) => acc + (r.assessmentResults?.overallScore || 0), 0) / (Object.values(testResults).length || 1)).toFixed(1)]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { fontSize: 10, textColor: [0, 0, 0] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Scoring Report Table
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Scoring Leaderboard', 14, currentY);
      currentY += 8;

      const scoringData = Object.values(testResults).map(r => [
        r.websiteUrl || 'N/A',
        r.assessmentResults?.overallScore?.toString() || '--',
        r.assessmentResults?.tier || 'N/A'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Website', 'Overall Score', 'Readiness Tier']],
        body: scoringData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { textColor: [0, 0, 0] },
        columnStyles: {
          1: { halign: 'center', fontStyle: 'bold' },
          2: { halign: 'center' }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            // We'll add links later when we know the page numbers
          }
        }
      });
      leaderboardTable = (doc as any).lastAutoTable;



      // Individual Detailed Results
      Object.values(testResults).forEach((result) => {
        doc.addPage();
        currentY = 20; // Reset Y for new page
        pageRefs.push({ url: result.websiteUrl || "N/A", page: doc.getNumberOfPages() });

        // Result Header Hero - Black and White
        doc.setFillColor(0, 0, 0);
        doc.rect(10, currentY, 190, 50, 'F');

        // Page Navigation Link (Back to TOC)
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text('← Back to Leaderboard', 170, currentY + 5);
        doc.link(170, currentY + 1, 30, 6, { pageNumber: 1 }); // Assuming TOC is on page 1
        
        // Tier Badge - Use a pill/badge look
        if (result.assessmentResults) {
          doc.setFillColor(255, 255, 255); // White background for badge
          doc.setDrawColor(255, 255, 255);
          doc.roundedRect(140, currentY + 10, 50, 10, 2, 2, 'FD');
          doc.setTextColor(0, 0, 0); // Black text on white badge
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(result.assessmentResults.tier, 165, currentY + 16.5, { align: 'center' });
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Readiness Report: ${result.websiteUrl}`, 15, currentY + 12);
        
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255); // White for score on black background
        doc.text(result.assessmentResults?.overallScore?.toString() || '0', 15, currentY + 30);
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text('/ 100 Score', 35, currentY + 30);

        // Strategy & Intent Summary
        if (result.auditResults) {
          doc.setFillColor(255, 255, 255, 0.15); // Slightly lighter for contrast
          doc.roundedRect(15, currentY + 35, 85, 10, 1, 1, 'F');
          doc.roundedRect(105, currentY + 35, 85, 10, 1, 1, 'F');
          
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255); // White labels
          doc.text('OVERALL STRATEGY', 18, currentY + 38);
          doc.text('BUSINESS INTENT', 108, currentY + 38);
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          const strat = doc.splitTextToSize(result.auditResults.platform.strategy, 80);
          const intent = doc.splitTextToSize(result.auditResults.platform.intent, 80);
          doc.text(strat[0] || '', 18, currentY + 42);
          doc.text(intent[0] || '', 108, currentY + 42);
        }

        currentY += 60;

        // Dimension Grid (Platform, Protocols, SEO)
        if (result.auditResults) {
          const dims = [
            { label: 'Platform', val: result.auditResults.platform.weight },
            { label: 'Protocols', val: result.auditResults.protocols.weight },
            { label: 'GEO/SEO', val: result.auditResults.seo.weight }
          ];
          
          dims.forEach((dim, i) => {
            const x = 14 + (i * 64);
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(x, currentY, 60, 25, 2, 2, 'F');
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(dim.label, x + 5, currentY + 7);
            
            doc.setFontSize(12);
            doc.text(`${dim.val}`, x + 5, currentY + 15);
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text('/ 100', x + 15, currentY + 15);
            
            // Bar
            doc.setFillColor(220, 220, 220);
            doc.rect(x + 5, currentY + 18, 50, 2, 'F');
            doc.setFillColor(0, 0, 0); // Black bar for score
            doc.rect(x + 5, currentY + 18, (dim.val / 100) * 50, 2, 'F');
          });
          currentY += 35;
        }

        // Technical Signal Matrix
        if (result.auditResults?.readinessSignals) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Technical Signal Matrix', 14, currentY);
          currentY += 5;

          const signalData = result.auditResults.readinessSignals.map(s => [
            s.status ? 'PASS' : 'FAIL',
            s.label,
            s.rating,
            s.evidence,
            s.suggestion
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Status', 'Signal', 'Rating', 'Evidence', 'Recommended Action']],
            body: signalData,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], fontSize: 8 },
            styles: { fontSize: 7, textColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
              1: { cellWidth: 35 },
              2: { cellWidth: 15 },
              3: { cellWidth: 50 },
              4: { cellWidth: 65 }
            },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 0) {
                if (data.cell.raw === 'PASS') {
                  // data.cell.styles.textColor = secondary as [number, number, number];
                  // Use a pill instead of just colored text? autoTable doesn't support easy pills in didParseCell
                  // But we can keep it black text and maybe add a background
                  data.cell.styles.fillColor = [240, 255, 240]; // Light green background
                } else {
                  data.cell.styles.fillColor = [255, 240, 240]; // Light red background
                }
              }
            }
          });
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // AI Vectors Section
        if (result.auditResults?.aiVectors && result.auditResults.aiVectors.length > 0) {
          checkPage(60);
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Agentic AI Vectors', 14, currentY);
          currentY += 5;

          const vectorData = result.auditResults.aiVectors.map(v => [
            v.label,
            v.rating,
            v.insight,
            v.suggestion
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Vector', 'Rating', 'Insight', 'Strategy']],
            body: vectorData,
            theme: 'striped',
            headStyles: { fillColor: [80, 80, 80] }, // Dark gray for secondary headers
            styles: { fontSize: 8, textColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 30, fontStyle: 'bold' },
              1: { cellWidth: 20 },
              2: { cellWidth: 60 }
            }
          });
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Tech Stack & Payments
        if (result.auditResults) {
          checkPage(40);
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Detected Technologies', 14, currentY);
          
          doc.text('Payment Systems', 105, currentY);
          currentY += 5;

          const techList = result.auditResults.technologies.map(t => t.name).join(', ') || 'None detected';
          const payList = result.auditResults.payments.map(p => p.name).join(', ') || 'None detected';
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const splitTech = doc.splitTextToSize(techList, 85);
          const splitPay = doc.splitTextToSize(payList, 85);
          
          doc.text(splitTech, 14, currentY);
          doc.text(splitPay, 105, currentY);
          currentY += Math.max(splitTech.length, splitPay.length) * 4 + 10;
        }

        // Mismatches
        if (result.auditResults?.mismatches && result.auditResults.mismatches.length > 0) {
          checkPage(40);
          doc.setFontSize(14);
          doc.setTextColor(150, 0, 0); // Keep some red for warnings but ensure contrast
          doc.setFont('helvetica', 'bold');
          doc.text('Survey & Detection Mismatches', 14, currentY);
          currentY += 5;

          const mismatchData = result.auditResults.mismatches.map(m => [
            m.type,
            m.message,
            m.suggestion
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Type', 'Description', 'Action']],
            body: mismatchData,
            theme: 'grid',
            headStyles: { fillColor: [150, 0, 0] },
            styles: { fontSize: 8, textColor: [0, 0, 0] }
          });
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Bots / Visibility
        if (result.auditResults?.bots && result.auditResults.bots.length > 0) {
          checkPage(40);
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('LLM & Agent Visibility', 14, currentY);
          currentY += 8;

          const bots = result.auditResults.bots;
          const cardWidth = 30;
          const cardHeight = 15;
          const gap = 5;

          bots.forEach((bot, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 14 + (col * (cardWidth + gap));
            const y = currentY + (row * (cardHeight + gap));

            if (bot.status) {
              doc.setFillColor(240, 240, 240); // Light gray
              doc.setDrawColor(0, 0, 0); // Black border for detected
            } else {
              doc.setFillColor(255, 255, 255);
              doc.setDrawColor(200, 200, 200);
            }
            doc.roundedRect(x, y, cardWidth, cardHeight, 1, 1, 'FD');
            
            doc.setFontSize(6);
            doc.setTextColor(bot.status ? 0 : 150);
            doc.setFont('helvetica', bot.status ? 'bold' : 'normal');
            doc.text(bot.status ? 'DETECTED' : 'MISSING', x + cardWidth/2, y + 5, { align: 'center' });
            
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(bot.label, x + cardWidth/2, y + 10, { align: 'center' });
          });
          currentY += (Math.ceil(bots.length / 5) * (cardHeight + gap)) + 15;
        }

        // Next Steps
        if (result.auditResults) {
          checkPage(40);
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('Next Steps & Agentic Evolution', 14, currentY);
          currentY += 8;
          
          if (result.auditResults.nextSteps && result.auditResults.nextSteps.length > 0) {
            result.auditResults.nextSteps.forEach((section: any) => {
              if (checkPage(15)) currentY += 5;
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'bold');
              doc.text(section.title, 14, currentY);
              currentY += 5;
              
              section.items.forEach((item: any) => {
                if (checkPage(12)) currentY += 5;
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(200, 200, 200);
                
                // Use grayscale for priorities or icons
                if (item.priority === 'high') {
                  doc.setFillColor(240, 240, 240);
                  doc.setDrawColor(0, 0, 0);
                }
                
                doc.rect(14, currentY, 180, 10, 'FD');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'bold');
                
                // Add a small priority marker
                let priorityText = '';
                if (item.priority === 'high') priorityText = '[HIGH] ';
                
                doc.text(priorityText + item.label, 16, currentY + 4);
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50);
                const desc = doc.splitTextToSize(item.description, 175);
                doc.text(desc[0], 16, currentY + 8);
                currentY += 12;
              });
              currentY += 5;
            });
          } else {
            // Static Roadmap Fallback
            const fallbackRoadmap = [
              { title: '1. Short-Term Implementation (0-3 Months)', items: [
                { label: 'Priority: Protocol Adoption', description: 'Implement UCP and ACP machine-readable layers.' },
                { label: 'AI Visibility Optimization', description: 'Update robots.txt and host /ai-config.json.' }
              ]},
              { title: '2. Mid-Term Strategy: Agentic Vectors (3-9 Months)', items: [
                { label: 'Semantic & Vector Search', description: 'Enable conceptual product discovery via vector databases.' },
                { label: 'Dynamic Contextual UI', description: 'Develop Headless+ capabilities for agentic UI reconfiguration.' }
              ]}
            ];

            fallbackRoadmap.forEach(section => {
              if (checkPage(30)) currentY += 5;
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'bold');
              doc.text(section.title, 14, currentY);
              currentY += 5;
              
              section.items.forEach(item => {
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(200, 200, 200);
                doc.rect(14, currentY, 180, 10, 'FD');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'bold');
                doc.text(item.label, 16, currentY + 4);
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50);
                doc.text(item.description, 16, currentY + 8);
                currentY += 12;
              });
              currentY += 5;
            });
          }
        }
      });

      // After all pages are generated, go back and add links to the Leaderboard and Footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Add Footer with Page Number
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });

        // If it's the first page, add links to the leaderboard rows
        if (i === 1) {
          // leaderboardTable.body is an array of Row objects
          leaderboardTable.body.forEach((row: any, index: number) => {
            const url = scoringData[index][0];
            const ref = pageRefs.find(p => p.url === url);
            if (ref) {
              const cell = row.cells[0];
              doc.link(cell.x, cell.y, cell.width, cell.height, { pageNumber: ref.page });
              // Visual cue for link (optional - usually just cursor change in PDF viewer)
              doc.setTextColor(0, 0, 255);
              doc.setFontSize(leaderboardTable.styles.fontSize);
              // Redraw text in blue to indicate link? Maybe too messy. 
              // Let's just keep it clean and rely on the cursor.
            }
          });
        }
      }

      doc.save(`${fileName}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF report. Please check the console for details.');
    }
  };

  const importMatrix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          if (imported.length > 0 && 'testCases' in imported[0]) {
            // It's a TestGroup[]
            setTestGroups(imported);
            if (imported.length > 0) setActiveGroupId(imported[0].id);
          } else {
            // It's a TestCase[] - wrap in a group
            const newGroup: TestGroup = {
              id: Date.now().toString(),
              name: 'Imported Report',
              testCases: imported,
              results: {}
            };
            setTestGroups([...testGroups, newGroup]);
            setActiveGroupId(newGroup.id);
          }
        } else if (imported.results && imported.timestamp) {
           // It's probably a results file - we can't easily import this back as test cases without mapping
           alert('This appears to be a results file. Import a testing matrix JSON instead.');
        }
      } catch (err) {
        alert('Failed to import: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const hasAllResults = testCases.length > 0 && testCases.every(tc => {
    const result = testResults[tc.id];
    return result && (result.status === 'completed' || result.status === 'error');
  });

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
          <button onClick={() => document.getElementById('import-input')?.click()} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50 transition">
            <Upload size={18} /> Import Cases
          </button>
          <button onClick={exportMatrix} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-50 transition">
            <Download size={18} /> Export Cases
          </button>
          {!isRunning && hasAllResults && (
            <div className="flex gap-2">
              <button onClick={exportResults} className="flex items-center gap-2 px-4 py-2 border rounded bg-green-50 text-green-700 hover:bg-green-100 transition border-green-200" title="Export as JSON">
                <FileJson size={18} />
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 border rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition border-blue-200" title="Export as PDF Report">
                <FileText size={18} /> PDF Report
              </button>
            </div>
          )}
          <button 
            onClick={runAllTests} 
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2 bg-syf-navy text-white rounded hover:bg-opacity-90 transition ${isRunning ? 'opacity-50' : ''}`}
          >
            <Play size={18} /> {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
          <button onClick={addTestCase} className="flex items-center gap-2 px-4 py-2 bg-syf-navy text-white rounded hover:bg-opacity-90 transition">
            <Plus size={18} /> Add Test Case
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-syf-navy flex items-center gap-2">
            <AlertCircle size={20} className="text-syf-navy" />
            How to use the Testing Matrix
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
          <div>
            <h3 className="font-bold text-syf-navy mb-2">1. Create a Report</h3>
            <p>Reports are independent groups of test cases. Click <strong>"New Blank Report"</strong> to start fresh, or <strong>Duplicate</strong> an existing one. Use the dropdown to switch between reports.</p>
          </div>
          <div>
            <h3 className="font-bold text-syf-navy mb-2">2. Add Test Cases</h3>
            <p>Enter the website URL and fill out the survey details (Stage, Platform, etc.) for each row. Use <strong>"Add Test Case"</strong> to add more websites to your active report.</p>
          </div>
          <div>
            <h3 className="font-bold text-syf-navy mb-2">3. Run & Save</h3>
            <p>Click <strong>"Run All Tests"</strong> to start the automated audit. Once finished, <strong>"Export Cases"</strong> to save your setup or <strong>"Download Results"</strong> for the full JSON report.</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-4 mb-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Report:</span>
            <select 
              value={activeGroupId} 
              onChange={(e) => setActiveGroupId(e.target.value)}
              className="border rounded px-3 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-syf-navy"
            >
              {testGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Report Name"
              className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-syf-navy w-48"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    setTestGroups(groups => groups.map(g => 
                      g.id === activeGroupId ? { ...g, name: target.value.trim() } : g
                    ));
                    target.value = '';
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.querySelector('input[placeholder="Report Name"]') as HTMLInputElement;
                if (input.value.trim()) {
                  setTestGroups(groups => groups.map(g => 
                    g.id === activeGroupId ? { ...g, name: input.value.trim() } : g
                  ));
                  input.value = '';
                }
              }}
              className="p-1 text-syf-navy hover:bg-gray-100 rounded transition"
              title="Rename Report"
            >
              <CheckCircle size={18} />
            </button>
            <button 
              onClick={copyTestGroup}
              className="p-1 text-syf-navy hover:bg-gray-100 rounded transition"
              title="Duplicate Report"
            >
              <Copy size={18} />
            </button>
          </div>
          <button 
            onClick={addTestGroup}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
          >
            <Plus size={14} /> New Blank Report
          </button>
          <button 
            onClick={() => removeTestGroup(activeGroupId)}
            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm"
          >
            <Trash2 size={14} /> Remove Report
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          className={`px-6 py-2 font-semibold ${activeTab === 'matrix' ? 'border-b-2 border-syf-navy text-syf-navy' : 'text-gray-500'}`}
          onClick={() => setActiveTab('matrix')}
        >
          Test Matrix
        </button>
        <button 
          className={`px-6 py-2 font-semibold ${activeTab === 'results' ? 'border-b-2 border-syf-navy text-syf-navy' : 'text-gray-500'}`}
          onClick={() => setActiveTab('results')}
        >
          Bulk Results
        </button>
      </div>

      {activeTab === 'matrix' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1500px]">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 font-semibold w-16">Status</th>
                  <th className="p-4 font-semibold w-64">Website URL</th>
                  <th className="p-4 font-semibold w-48">Journey Stage</th>
                  <th className="p-4 font-semibold w-64">Commerce Platforms</th>
                  <th className="p-4 font-semibold w-64">Protocols</th>
                  <th className="p-4 font-semibold w-64">AI Channels</th>
                  <th className="p-4 font-semibold w-64">Main Goal</th>
                  <th className="p-4 font-semibold text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testCases.map((tc) => {
                  const result = testResults[tc.id];
                  return (
                    <tr key={tc.id} className="border-b hover:bg-gray-50 transition group">
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {result?.status === 'completed' && <CheckCircle className="text-green-500" size={20} title="Audit Completed" />}
                            {result?.status === 'error' && <AlertCircle className="text-yellow-500" size={20} title={result.error} />}
                            {result?.status === 'running' && <div className="w-5 h-5 border-2 border-syf-navy border-t-transparent rounded-full animate-spin" />}
                            {(!result || result.status === 'pending') && <div className="w-5 h-5 border-2 border-dashed rounded-full border-gray-300" />}
                            {result && result.status !== 'pending' && result.status !== 'running' && (
                              <button onClick={() => setShowJson(JSON.stringify(result, null, 2))} className="text-syf-navy hover:text-opacity-80 transition-transform hover:scale-110">
                                <Eye size={16} />
                              </button>
                            )}
                          </div>
                          {result && (result.status === 'running' || (result.progress > 0 && result.progress < 100)) && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div 
                                className="bg-syf-navy h-1.5 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${result.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <input 
                          type="text" 
                          value={tc.websiteUrl} 
                          onChange={(e) => updateTestCase(tc.id, { websiteUrl: e.target.value })}
                          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-syf-navy focus:outline-none transition-shadow"
                          placeholder="https://example.com"
                        />
                      </td>
                      <td className="p-4 align-top">
                        <select 
                          value={tc.formData.stage} 
                          onChange={(e) => updateTestCase(tc.id, { formData: { ...tc.formData, stage: e.target.value } })}
                          className="w-full p-2 border rounded text-sm bg-white focus:ring-2 focus:ring-syf-navy focus:outline-none transition-shadow"
                        >
                          {journeyStages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4 align-top">
                        <div className="max-h-40 overflow-y-auto p-2 border rounded bg-white space-y-1 focus-within:ring-2 focus-within:ring-syf-navy transition-shadow shadow-inner">
                          {commercePlatforms.map(p => (
                            <label key={p} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-0.5 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={tc.formData.platforms?.includes(p)}
                                className="rounded text-syf-navy focus:ring-syf-navy"
                                onChange={(e) => {
                                  const platforms = tc.formData.platforms || [];
                                  const newPlatforms = e.target.checked 
                                    ? [...platforms, p] 
                                    : platforms.filter(item => item !== p);
                                  updateTestCase(tc.id, { formData: { ...tc.formData, platforms: newPlatforms } });
                                }}
                              />
                              {p}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="max-h-40 overflow-y-auto p-2 border rounded bg-white space-y-1 focus-within:ring-2 focus-within:ring-syf-navy transition-shadow shadow-inner">
                          {protocols.map(p => (
                            <label key={p} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-0.5 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={tc.formData.protocols?.includes(p)}
                                className="rounded text-syf-navy focus:ring-syf-navy"
                                onChange={(e) => {
                                  const currentProtocols = tc.formData.protocols || [];
                                  const newProtocols = e.target.checked 
                                    ? [...currentProtocols, p] 
                                    : currentProtocols.filter(item => item !== p);
                                  updateTestCase(tc.id, { formData: { ...tc.formData, protocols: newProtocols } });
                                }}
                              />
                              {p}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="max-h-40 overflow-y-auto p-2 border rounded bg-white space-y-1 focus-within:ring-2 focus-within:ring-syf-navy transition-shadow shadow-inner">
                          {aiChannels.map(c => (
                            <label key={c} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-0.5 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={tc.formData.aiChannels?.includes(c)}
                                className="rounded text-syf-navy focus:ring-syf-navy"
                                onChange={(e) => {
                                  const channels = tc.formData.aiChannels || [];
                                  const newChannels = e.target.checked 
                                    ? [...channels, c] 
                                    : channels.filter(item => item !== c);
                                  updateTestCase(tc.id, { formData: { ...tc.formData, aiChannels: newChannels } });
                                }}
                              />
                              {c}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <select 
                          value={tc.formData.goal} 
                          onChange={(e) => updateTestCase(tc.id, { formData: { ...tc.formData, goal: e.target.value } })}
                          className="w-full p-2 border rounded text-sm bg-white focus:ring-2 focus:ring-syf-navy focus:outline-none transition-shadow"
                        >
                          <option value="">Select a goal...</option>
                          {goals.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-right align-top">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => removeTestCase(tc.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove test case"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 flex gap-4">
            <button onClick={addTestCase} className="flex items-center gap-2 text-syf-navy font-semibold hover:underline">
              <Plus size={18} /> Add Test Case
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-syf-navy">Bulk Assessment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-700 font-semibold">Total Test Cases</div>
                <div className="text-2xl font-bold text-blue-800">{testCases.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm text-green-700 font-semibold">Completed</div>
                <div className="text-2xl font-bold text-green-800">
                  {Object.values(testResults).filter(r => r.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="text-sm text-yellow-700 font-semibold">Errors</div>
                <div className="text-2xl font-bold text-yellow-800">
                  {Object.values(testResults).filter(r => r.status === 'error').length}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4 text-syf-navy">Scoring Report</h3>
              <div className="bg-gray-50 rounded-lg border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-3 font-semibold text-sm">Website</th>
                      <th className="p-3 font-semibold text-sm">Overall Score</th>
                      <th className="p-3 font-semibold text-sm">Readiness Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.values(testResults).map(r => (
                      <tr key={r.testCaseId} className="bg-white">
                        <td className="p-3 text-sm font-medium">{r.websiteUrl}</td>
                        <td className="p-3 text-sm">
                          {r.assessmentResults ? (
                            <span className="font-bold text-syf-navy">{r.assessmentResults.overallScore}</span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {r.assessmentResults ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.assessmentResults.tier.includes('Elite') ? 'bg-green-100 text-green-700' :
                              r.assessmentResults.tier.includes('High') ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {r.assessmentResults.tier}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(testResults).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400 italic">Run tests to generate report</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-semibold">Detailed Results</div>
            <div className="divide-y">
              {Object.values(testResults).map((result) => (
                <div key={result.testCaseId} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-syf-navy">{result.websiteUrl || 'No URL'}</div>
                      <div className="text-xs text-gray-500">ID: {result.testCaseId}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        result.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        result.status === 'error' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.status}
                      </span>
                      <button onClick={() => setShowJson(JSON.stringify(result, null, 2))} className="p-1 hover:bg-gray-200 rounded">
                        <FileJson size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {result.assessmentResults && (
                    <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 rounded border text-sm">
                      <div><span className="text-gray-500">Score:</span> <span className="font-bold">{result.assessmentResults.overallScore}</span></div>
                      <div><span className="text-gray-500">Tier:</span> <span className="font-bold">{result.assessmentResults.tier}</span></div>
                      <div><span className="text-gray-500">Status:</span> <span className="font-bold">{result.assessmentResults.agenticStatus}</span></div>
                    </div>
                  )}

                  {result.actualSuggestions.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Suggestions & Insights</div>
                      <div className="flex flex-wrap gap-2">
                        {result.actualSuggestions.map((s, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.confidenceScores && Object.keys(result.confidenceScores).length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Confidence Scores</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.confidenceScores).map(([name, score]) => (
                          <span key={name} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded border">
                            {name}: <span className="font-bold">{score}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.error && <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{result.error}</div>}
                </div>
              ))}
              {Object.keys(testResults).length === 0 && (
                <div className="p-8 text-center text-gray-400">No results yet. Run tests to see data here.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showJson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold">JSON Preview</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const blob = new Blob([showJson], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'result.json';
                    link.click();
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-syf-navy text-white text-xs rounded hover:bg-opacity-90"
                >
                  <Download size={14} /> Download
                </button>
                <button onClick={() => setShowJson(null)} className="px-3 py-1 border rounded text-xs hover:bg-gray-100">Close</button>
              </div>
            </div>
            <div className="p-4 flex-grow overflow-auto bg-gray-900">
              <pre className="text-green-400 text-xs font-mono">{showJson}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
// Importiamo i componenti usando percorsi relativi (../ e ./)
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { DatabaseSchema } from './components/DatabaseSchema';
import { UserJourney } from './components/UserJourney';
import { APIStrategy } from './components/APIStrategy';
import { LiveDemo } from './components/LiveDemo';
import { FileText, Database, GitBranch, Workflow, Code } from 'lucide-react';

export default function App() {
  // Ho impostato 'demo' così vedi subito la grafica di Figma
  const [activeTab, setActiveTab] = useState('demo');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">ESRS Compliance Platform</h1>
              <p className="text-sm text-slate-600 mt-1">
                Enterprise Architecture & Design Documentation
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
              <span className="font-medium text-blue-900">CSRD Directive</span>
              <span className="text-blue-700">|</span>
              <span className="text-blue-700">ESRS Standards</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Architecture</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database Schema</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">API Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">User Journey</span>
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Live Demo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ArchitectureOverview />
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <DatabaseSchema />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <APIStrategy />
          </TabsContent>

          <TabsContent value="journey" className="mt-6">
            <UserJourney />
          </TabsContent>

          <TabsContent value="demo" className="mt-6">
            <LiveDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

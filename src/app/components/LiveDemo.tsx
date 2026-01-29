import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Upload,
  Download,
  Calculator,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';

export function LiveDemo() {
  const [dmaE1Impact, setDmaE1Impact] = useState('4.5');
  const [dmaE1Financial, setDmaE1Financial] = useState('3.8');
  const [scope1Value, setScope1Value] = useState('12543.67');
  const [employeeCount, setEmployeeCount] = useState('850');

  // Calculate if material (threshold = 3.0)
  const isE1Material = parseFloat(dmaE1Impact) >= 3.0 || parseFloat(dmaE1Financial) >= 3.0;
  
  // Mock data for demonstration
  const mockCompany = {
    name: 'Acme Manufacturing GmbH',
    lei: 'LEI123456789ABCDEFGH',
    nace: '25.11',
    fiscalYearEnd: '2024-12-31',
  };

  const mockMaterialityScores = [
    { standard: 'ESRS-E1', topic: 'Climate Change', impact: 4.5, financial: 3.8, isMaterial: true },
    { standard: 'ESRS-E2', topic: 'Pollution', impact: 2.1, financial: 1.8, isMaterial: false },
    { standard: 'ESRS-E3', topic: 'Water & Marine', impact: 3.2, financial: 2.5, isMaterial: true },
    { standard: 'ESRS-S1', topic: 'Own Workforce', impact: 3.8, financial: 3.1, isMaterial: true },
    { standard: 'ESRS-S2', topic: 'Value Chain Workers', impact: 2.4, financial: 2.0, isMaterial: false },
    { standard: 'ESRS-G1', topic: 'Business Conduct', impact: 3.5, financial: 3.2, isMaterial: true },
  ];

  const mockDataPoints = [
    { 
      code: 'E1-1', 
      label: 'Transition plan for climate change mitigation', 
      type: 'Narrative', 
      status: 'Complete',
      value: 'Our company has committed to achieving net-zero emissions by 2050...'
    },
    { 
      code: 'E1-6', 
      label: 'Gross Scope 1 GHG emissions (tCO2e)', 
      type: 'Numeric', 
      status: 'Complete',
      value: '12,543.67',
      evidence: 2
    },
    { 
      code: 'E1-6', 
      label: 'Gross Scope 2 GHG emissions (tCO2e)', 
      type: 'Numeric', 
      status: 'In Progress',
      value: '—',
      evidence: 0
    },
    { 
      code: 'S1-1', 
      label: 'Policies related to own workforce', 
      type: 'Narrative', 
      status: 'Complete',
      value: 'We maintain comprehensive employment policies covering...'
    },
    { 
      code: 'S1-6', 
      label: 'Total number of employees (FTE)', 
      type: 'Numeric', 
      status: 'Complete',
      value: '850',
      evidence: 1
    },
  ];

  const completionRate = Math.round((mockDataPoints.filter(dp => dp.status === 'Complete').length / mockDataPoints.length) * 100);

  return (
    <div className="space-y-6">
      {/* Demo Introduction */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Interactive Platform Demo
          </CardTitle>
          <CardDescription className="text-green-700">
            Experience the ESRS compliance workflow with live data interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-green-200">
            <p className="text-sm text-slate-700 mb-2">
              <strong>Demo Company:</strong> {mockCompany.name}
            </p>
            <div className="grid md:grid-cols-3 gap-2 text-xs text-slate-600">
              <div><span className="font-medium">LEI:</span> {mockCompany.lei}</div>
              <div><span className="font-medium">NACE Code:</span> {mockCompany.nace} (Metal structures)</div>
              <div><span className="font-medium">FY End:</span> {mockCompany.fiscalYearEnd}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="dma">DMA Matrix</TabsTrigger>
          <TabsTrigger value="collection">Data Collection</TabsTrigger>
          <TabsTrigger value="calculation">Calculations</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Overall Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">{completionRate}%</span>
                  <TrendingUp className="h-5 w-5 text-green-600 mb-1" />
                </div>
                <Progress value={completionRate} className="mt-2" />
                <p className="text-xs text-slate-600 mt-2">
                  {mockDataPoints.filter(dp => dp.status === 'Complete').length} of {mockDataPoints.length} data points complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Material Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {mockMaterialityScores.filter(s => s.isMaterial).length}
                  </span>
                  <span className="text-sm text-slate-600 mb-1">of 6 assessed</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {mockMaterialityScores.map((score, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded ${score.isMaterial ? 'bg-green-500' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">DMA approved on Jan 15, 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Evidence Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">47</span>
                  <span className="text-sm text-slate-600 mb-1">files uploaded</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>PDFs:</span>
                    <span className="font-medium">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Excel:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Data point updated', detail: 'E1-6: Scope 1 GHG emissions', user: 'Sarah Chen', time: '2 hours ago', icon: CheckCircle2, color: 'green' },
                  { action: 'Evidence uploaded', detail: 'Utility bill Q4 2024.pdf', user: 'Michael Torres', time: '5 hours ago', icon: Upload, color: 'blue' },
                  { action: 'Calculation completed', detail: 'Gender pay gap analysis', user: 'System', time: '1 day ago', icon: Calculator, color: 'purple' },
                  { action: 'Review requested', detail: 'S1-1: Workforce policies', user: 'Emma Wilson', time: '2 days ago', icon: AlertCircle, color: 'orange' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                    <activity.icon className={`h-5 w-5 text-${activity.color}-600 shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-600 truncate">{activity.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">{activity.user}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DMA Matrix */}
        <TabsContent value="dma" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Double Materiality Assessment Matrix</CardTitle>
              <CardDescription>Interactive visualization of materiality scores (threshold: 3.0)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-3 font-medium">Standard</th>
                      <th className="text-left p-3 font-medium">Topic</th>
                      <th className="text-center p-3 font-medium">Impact Materiality</th>
                      <th className="text-center p-3 font-medium">Financial Materiality</th>
                      <th className="text-center p-3 font-medium">Material?</th>
                      <th className="text-center p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMaterialityScores.map((score, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {score.standard}
                          </Badge>
                        </td>
                        <td className="p-3">{score.topic}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${score.impact >= 3.0 ? 'bg-green-500' : 'bg-slate-400'}`}
                                style={{ width: `${(score.impact / 5) * 100}%` }}
                              />
                            </div>
                            <span className="font-medium">{score.impact}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${score.financial >= 3.0 ? 'bg-blue-500' : 'bg-slate-400'}`}
                                style={{ width: `${(score.financial / 5) * 100}%` }}
                              />
                            </div>
                            <span className="font-medium">{score.financial}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {score.isMaterial ? (
                            <Badge className="bg-green-600 text-white">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-600">No</Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {score.isMaterial && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-900 text-xs">
                              Report Required
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interactive Example */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-sm text-blue-900 mb-3">Try It: Adjust ESRS-E1 Scores</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Impact Materiality (0-5)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={dmaE1Impact}
                      onChange={(e) => setDmaE1Impact(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Financial Materiality (0-5)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={dmaE1Financial}
                      onChange={(e) => setDmaE1Financial(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm">
                    <strong>Result:</strong> ESRS-E1 is{' '}
                    <span className={isE1Material ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {isE1Material ? 'MATERIAL' : 'NOT MATERIAL'}
                    </span>
                    {' '}(threshold: 3.0)
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {isE1Material 
                      ? 'All E1 disclosure requirements must be reported.' 
                      : 'E1 can be omitted, but justification must be provided in ESRS-2.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection */}
        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Point Collection Interface</CardTitle>
              <CardDescription>Example: ESRS E1-6 (GHG Emissions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Data Point Form */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scope1">Gross Scope 1 GHG emissions (tCO2e)</Label>
                    <Input
                      id="scope1"
                      type="number"
                      value={scope1Value}
                      onChange={(e) => setScope1Value(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Direct emissions from owned/controlled sources</p>
                  </div>

                  <div>
                    <Label htmlFor="period">Reporting Period</Label>
                    <Select defaultValue="2024">
                      <SelectTrigger id="period" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="methodology">Calculation Methodology</Label>
                  <Textarea
                    id="methodology"
                    className="mt-1"
                    rows={3}
                    defaultValue="Calculated using GHG Protocol Corporate Standard. Emission factors from UK DEFRA 2024. Includes natural gas (12,400 m³) and diesel fuel (8,200 liters)."
                  />
                </div>

                {/* Evidence Upload */}
                <div className="border border-dashed border-slate-300 rounded-md p-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">Evidence Documents</p>
                      <p className="text-xs text-slate-500">Upload invoices, meter readings, or calculation sheets</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      { name: 'Natural_Gas_Invoice_Q4_2024.pdf', size: '2.4 MB', uploaded: '2024-01-15' },
                      { name: 'Diesel_Fuel_Receipts_2024.xlsx', size: '1.1 MB', uploaded: '2024-01-14' },
                    ].map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs font-medium text-slate-700">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size} • {file.uploaded}</p>
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save & Submit for Review
                  </Button>
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Points List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Data Points (Sample)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Code</th>
                      <th className="text-left p-2 font-medium">Label</th>
                      <th className="text-center p-2 font-medium">Type</th>
                      <th className="text-center p-2 font-medium">Status</th>
                      <th className="text-center p-2 font-medium">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {mockDataPoints.map((dp, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2">
                          <Badge variant="outline" className="font-mono text-xs">{dp.code}</Badge>
                        </td>
                        <td className="p-2">{dp.label}</td>
                        <td className="p-2 text-center">
                          <Badge variant="secondary" className="text-xs">{dp.type}</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={dp.status === 'Complete' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                            {dp.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {dp.evidence ? (
                            <span className="text-blue-600 font-medium">{dp.evidence} files</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculation Engine */}
        <TabsContent value="calculation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                Calculation Engine Output
              </CardTitle>
              <CardDescription>Automated calculations for ESRS metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GHG Calculation */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                <h4 className="font-medium text-sm text-purple-900 mb-3">GHG Scope 1 Calculation (ESRS E1)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Natural gas consumption:</span>
                    <span className="font-mono">12,400 m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Emission factor (DEFRA 2024):</span>
                    <span className="font-mono">0.18405 kgCO2e/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Diesel fuel:</span>
                    <span className="font-mono">8,200 liters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Emission factor:</span>
                    <span className="font-mono">2.68781 kgCO2e/liter</span>
                  </div>
                  <div className="border-t border-purple-300 pt-2 mt-2 flex justify-between font-bold text-purple-900">
                    <span>Total Scope 1 Emissions:</span>
                    <span className="font-mono">{scope1Value} tCO2e</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-purple-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Calculation verified on 2024-01-15 14:32:18 UTC</span>
                </div>
              </div>

              {/* Gender Pay Gap */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-sm text-blue-900 mb-3">Gender Pay Gap Analysis (ESRS S1-16)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Male employees average salary:</span>
                    <span className="font-mono">€52,800/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Female employees average salary:</span>
                    <span className="font-mono">€48,300/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Formula:</span>
                    <span className="font-mono text-xs">(Male - Female) / Male × 100</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-bold text-blue-900">
                    <span>Unadjusted Pay Gap:</span>
                    <span className="font-mono text-orange-600">8.52%</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Above industry average (6.3%) - requires action plan disclosure</span>
                </div>
              </div>

              {/* Employee Metrics */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-sm text-green-900 mb-3">Employee Composition (ESRS S1-6)</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-2">By Contract Type:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Permanent:</span>
                        <span className="font-mono">{Math.round(parseInt(employeeCount) * 0.82)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temporary:</span>
                        <span className="font-mono">{Math.round(parseInt(employeeCount) * 0.18)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">By Gender:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Male:</span>
                        <span className="font-mono">{Math.round(parseInt(employeeCount) * 0.62)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Female:</span>
                        <span className="font-mono">{Math.round(parseInt(employeeCount) * 0.37)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Non-binary:</span>
                        <span className="font-mono">{Math.round(parseInt(employeeCount) * 0.01)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-600" />
                Report Generation & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* XBRL Export */}
                <div className="border border-indigo-200 rounded-md p-4 bg-indigo-50">
                  <h4 className="font-medium text-sm text-indigo-900 mb-3">XBRL Package (ESEF)</h4>
                  <p className="text-xs text-slate-600 mb-4">
                    Machine-readable format for regulatory submission to ESMA/national authorities
                  </p>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Format:</span>
                      <span className="font-medium">Inline XBRL (.html)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taxonomy:</span>
                      <span className="font-medium">ESEF 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Validation:</span>
                      <Badge className="bg-green-600 text-white text-xs">Passed</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">File size:</span>
                      <span className="font-medium">3.8 MB</span>
                    </div>
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download XBRL ZIP
                  </Button>
                </div>

                {/* PDF Export */}
                <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
                  <h4 className="font-medium text-sm text-blue-900 mb-3">PDF Report (Human-Readable)</h4>
                  <p className="text-xs text-slate-600 mb-4">
                    Formatted sustainability statement for annual report inclusion
                  </p>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Pages:</span>
                      <span className="font-medium">124 pages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Format:</span>
                      <span className="font-medium">PDF/A-3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Includes:</span>
                      <span className="font-medium">Table of contents, charts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">File size:</span>
                      <span className="font-medium">8.2 MB</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                <h4 className="font-medium text-sm text-slate-900 mb-3">Report Preview (Excerpt)</h4>
                <div className="bg-white p-4 rounded border border-slate-200 text-xs leading-relaxed">
                  <h5 className="font-bold text-sm mb-2">ESRS E1: Climate Change</h5>
                  <p className="mb-2"><strong>E1-1: Transition Plan for Climate Change Mitigation</strong></p>
                  <p className="text-slate-700 mb-3">
                    Acme Manufacturing GmbH has committed to achieving net-zero Scope 1 and 2 GHG emissions by 2050, 
                    with an intermediate target of 50% reduction by 2030 (baseline: 2020). Our transition plan includes...
                  </p>
                  <p className="mb-2"><strong>E1-6: Gross GHG Emissions (tCO2e)</strong></p>
                  <table className="w-full border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-200 p-2 text-left">Category</th>
                        <th className="border border-slate-200 p-2 text-right">2024</th>
                        <th className="border border-slate-200 p-2 text-right">2023</th>
                        <th className="border border-slate-200 p-2 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 p-2">Scope 1</td>
                        <td className="border border-slate-200 p-2 text-right font-mono">12,543.67</td>
                        <td className="border border-slate-200 p-2 text-right font-mono">13,201.45</td>
                        <td className="border border-slate-200 p-2 text-right text-green-600">-5.0% ↓</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">Scope 2 (location-based)</td>
                        <td className="border border-slate-200 p-2 text-right font-mono">8,932.12</td>
                        <td className="border border-slate-200 p-2 text-right font-mono">9,456.33</td>
                        <td className="border border-slate-200 p-2 text-right text-green-600">-5.5% ↓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Trail Package */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="font-medium text-sm text-yellow-900 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Audit Trail Package
                </h4>
                <p className="text-xs text-yellow-800 mb-3">
                  Complete audit trail including all evidence documents, calculation logs, and change history
                </p>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-yellow-300">
                    <p className="font-medium">47 Evidence Files</p>
                    <p className="text-slate-600">SHA-256 verified</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-yellow-300">
                    <p className="font-medium">1,847 Audit Log Entries</p>
                    <p className="text-slate-600">Immutable records</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-yellow-300">
                    <p className="font-medium">12 Stakeholder Records</p>
                    <p className="text-slate-600">DMA consultations</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Package (.zip)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Users, FileText, Database, Calculator, Download, Shield } from 'lucide-react';
import { useState } from 'react';

export function UserJourney() {
  const [activePhase, setActivePhase] = useState(0);

  const phases = [
    {
      id: 0,
      title: 'Company Onboarding',
      icon: Users,
      duration: '1-2 days',
      color: 'blue',
      steps: [
        {
          title: 'Account Setup',
          description: 'Admin creates company profile with LEI code, NACE classification, and fiscal year-end',
          actor: 'Admin',
          outputs: ['Company record', 'Tenant configuration'],
        },
        {
          title: 'User Management',
          description: 'Invite team members and assign roles (Data Collectors, Reviewers, Auditors)',
          actor: 'Admin',
          outputs: ['User accounts', 'Role assignments', 'Department mappings'],
        },
        {
          title: 'Integration Setup',
          description: 'Configure ERP/HR connectors and API credentials',
          actor: 'IT Team',
          outputs: ['Active integrations', 'Data mapping rules'],
        },
      ],
    },
    {
      id: 1,
      title: 'Double Materiality Assessment (DMA)',
      icon: FileText,
      duration: '4-6 weeks',
      color: 'purple',
      steps: [
        {
          title: 'Stakeholder Identification',
          description: 'Define stakeholder groups (employees, customers, investors, communities, suppliers)',
          actor: 'ESG Lead',
          outputs: ['Stakeholder map', 'Engagement plan'],
        },
        {
          title: 'Impact & Risk Analysis',
          description: 'Conduct workshops to assess impact materiality (IRO) and financial materiality',
          actor: 'Cross-functional Team',
          outputs: ['Materiality matrix', 'Scoring rationale'],
        },
        {
          title: 'Stakeholder Engagement',
          description: 'Log consultations (surveys, interviews) as evidence of stakeholder input',
          actor: 'ESG Team',
          outputs: ['Engagement records', 'Survey results'],
        },
        {
          title: 'DMA Approval',
          description: 'Board or ESG committee approves final materiality assessment',
          actor: 'Governance',
          outputs: ['Approved DMA', 'Materiality threshold (e.g., score ≥ 3.0)'],
        },
      ],
    },
    {
      id: 2,
      title: 'Disclosure Requirement (DR) Mapping',
      icon: Database,
      duration: '1-2 days (automated)',
      color: 'green',
      steps: [
        {
          title: 'Material Topic Filtering',
          description: 'System automatically identifies material ESRS standards based on DMA scores',
          actor: 'System (Auto)',
          outputs: ['List of applicable standards (e.g., E1, E3, S1, G1)'],
        },
        {
          title: 'DR Assignment',
          description: 'For each material standard, system maps required disclosure requirements',
          actor: 'System (Auto)',
          outputs: ['Full DR list (e.g., E1-1 through E1-9)', 'Data point templates'],
        },
        {
          title: 'Responsibility Assignment',
          description: 'Assign data collection tasks to specific departments/users',
          actor: 'ESG Lead',
          outputs: ['Task assignments', 'Deadlines'],
        },
      ],
    },
    {
      id: 3,
      title: 'Data Collection & Evidence Upload',
      icon: Database,
      duration: '8-12 weeks',
      color: 'orange',
      steps: [
        {
          title: 'Automated Data Ingestion',
          description: 'ERP/HR connectors sync data (energy bills, headcount, emissions)',
          actor: 'System (Auto)',
          outputs: ['Pre-populated data points', 'Draft values'],
        },
        {
          title: 'Manual Data Entry',
          description: 'Data collectors fill in qualitative narratives and missing quantitative values',
          actor: 'Data Collectors',
          outputs: ['Completed data points', 'Narrative disclosures'],
        },
        {
          title: 'Evidence Attachment',
          description: 'Upload supporting documents (invoices, certificates, reports) for audit trail',
          actor: 'Data Collectors',
          outputs: ['Linked evidence documents', 'SHA-256 checksums'],
        },
        {
          title: 'Internal Review',
          description: 'Department heads review submitted data for accuracy',
          actor: 'Reviewers',
          outputs: ['Approval status', 'Revision requests'],
        },
      ],
    },
    {
      id: 4,
      title: 'Calculation Engine Processing',
      icon: Calculator,
      duration: 'Real-time',
      color: 'yellow',
      steps: [
        {
          title: 'GHG Protocol Calculations',
          description: 'Auto-compute Scope 1, 2, 3 emissions using emission factors (ESRS E1)',
          actor: 'Calculation Engine',
          outputs: ['Total tCO2e', 'Intensity metrics (tCO2e/revenue)'],
        },
        {
          title: 'Gender Pay Gap Analysis',
          description: 'Calculate unadjusted pay gap from HR data (ESRS S1-16)',
          actor: 'Calculation Engine',
          outputs: ['Pay gap percentage', 'Breakdown by employee category'],
        },
        {
          title: 'Water Intensity (ESRS E3)',
          description: 'Compute water consumption per unit of output (m³/EUR revenue)',
          actor: 'Calculation Engine',
          outputs: ['Water intensity ratio', 'Baseline comparison'],
        },
        {
          title: 'Validation Checks',
          description: 'Verify data completeness, outlier detection, cross-checks',
          actor: 'System (Auto)',
          outputs: ['Validation report', 'Error/warning flags'],
        },
      ],
    },
    {
      id: 5,
      title: 'Report Generation & Export',
      icon: Download,
      duration: '2-3 days',
      color: 'indigo',
      steps: [
        {
          title: 'Draft Report Preview',
          description: 'Generate human-readable HTML/PDF preview of sustainability statement',
          actor: 'System (Auto)',
          outputs: ['Draft PDF', 'Web preview'],
        },
        {
          title: 'XBRL Tagging',
          description: 'Map data points to ESEF taxonomy elements for machine-readable format',
          actor: 'System (Auto)',
          outputs: ['Inline XBRL file', 'Taxonomy validation results'],
        },
        {
          title: 'Quality Assurance',
          description: 'ESG team reviews final report for completeness and accuracy',
          actor: 'ESG Lead',
          outputs: ['Final approval', 'Sign-off timestamp'],
        },
        {
          title: 'Export & Filing',
          description: 'Download XBRL package for regulatory submission (ESEF/LEI portal)',
          actor: 'Admin',
          outputs: ['XBRL ZIP package', 'Audit trail archive'],
        },
      ],
    },
    {
      id: 6,
      title: 'Auditor Review Mode',
      icon: Shield,
      duration: '4-6 weeks (concurrent)',
      color: 'red',
      steps: [
        {
          title: 'Auditor Access Grant',
          description: 'Provide read-only access to external auditor with audit log visibility',
          actor: 'Admin',
          outputs: ['Auditor account', 'Restricted permissions'],
        },
        {
          title: 'Evidence Verification',
          description: 'Auditor reviews data points and traces to source documents',
          actor: 'External Auditor',
          outputs: ['Verification notes', 'Document requests'],
        },
        {
          title: 'Calculation Audit',
          description: 'Auditor validates calculation formulas and spot-checks results',
          actor: 'External Auditor',
          outputs: ['Calculation sign-off', 'Adjustment requests'],
        },
        {
          title: 'Limited Assurance Opinion',
          description: 'Auditor issues ISAE 3000 assurance report',
          actor: 'External Auditor',
          outputs: ['Assurance report', 'Qualification notes (if any)'],
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-indigo-900">User Journey: Company Onboarding to Auditor Review</CardTitle>
          <CardDescription className="text-indigo-700">
            Complete workflow from registration to regulatory-ready XBRL report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {phases.map((phase, idx) => (
              <div key={phase.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setActivePhase(idx)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    activePhase === idx
                      ? `border-${phase.color}-500 bg-${phase.color}-50`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-full ${activePhase === idx ? `bg-${phase.color}-100` : 'bg-slate-100'}`}>
                    <phase.icon className={`h-5 w-5 ${activePhase === idx ? `text-${phase.color}-600` : 'text-slate-500'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${activePhase === idx ? `text-${phase.color}-900` : 'text-slate-700'}`}>
                      Phase {idx + 1}
                    </p>
                    <p className={`text-xs ${activePhase === idx ? `text-${phase.color}-700` : 'text-slate-500'}`}>
                      {phase.duration}
                    </p>
                  </div>
                </button>
                {idx < phases.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-slate-400 mx-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {(() => {
              const PhaseIcon = phases[activePhase].icon;
              return <PhaseIcon className={`h-6 w-6 text-${phases[activePhase].color}-600`} />;
            })()}
            <div>
              <CardTitle className="text-lg">
                Phase {activePhase + 1}: {phases[activePhase].title}
              </CardTitle>
              <CardDescription>
                Duration: {phases[activePhase].duration}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases[activePhase].steps.map((step, stepIdx) => (
              <div key={stepIdx} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className="shrink-0 mt-1">
                  <CheckCircle2 className={`h-5 w-5 text-${phases[activePhase].color}-500`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {step.actor}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-1">Outputs:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {step.outputs.map((output, outputIdx) => (
                        <li key={outputIdx} className="flex items-center gap-2">
                          <Circle className="h-2 w-2 fill-current" />
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Overall Timeline Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-32 font-medium text-slate-700">Total Duration:</div>
              <div className="text-slate-600">~16-26 weeks (4-6 months) for first year implementation</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-32 font-medium text-slate-700">Critical Path:</div>
              <div className="text-slate-600">DMA (6 weeks) → Data Collection (12 weeks) → Audit (6 weeks)</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-32 font-medium text-slate-700">Automation Gains:</div>
              <div className="text-slate-600">Year 2+: ~60% time reduction via automated data sync and pre-filled templates</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Concurrent Activities</h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-5 list-disc">
              <li>Auditor review can begin while data collection is ongoing (iterative approach)</li>
              <li>Calculation engine processes data in real-time as values are entered</li>
              <li>Stakeholder engagement continues throughout the year (not just during DMA phase)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Actor Roles Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Actor Roles & Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">Admin</h4>
              <p className="text-xs text-slate-600">
                Manages company settings, user accounts, integrations, and final report exports. Full system access.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">ESG Lead</h4>
              <p className="text-xs text-slate-600">
                Oversees materiality assessment, assigns data collection tasks, and provides final sign-off on reports.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">Data Collector</h4>
              <p className="text-xs text-slate-600">
                Department representatives (Finance, HR, Operations) who enter data and upload evidence documents.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">Reviewer</h4>
              <p className="text-xs text-slate-600">
                Mid-level managers who validate data accuracy before final submission. Can approve or request revisions.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">External Auditor</h4>
              <p className="text-xs text-slate-600">
                Third-party assurance provider with read-only access to data, evidence, and audit logs (ISAE 3000).
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <h4 className="font-medium text-sm mb-2">System (Auto)</h4>
              <p className="text-xs text-slate-600">
                Automated processes including ERP sync, calculation engine, XBRL generation, and validation checks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

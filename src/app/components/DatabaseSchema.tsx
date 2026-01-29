import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Database, Table, Key, Link } from 'lucide-react';

export function DatabaseSchema() {
  return (
    <div className="space-y-6">
      {/* Schema Overview */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-xl text-purple-900">Relational Database Model</CardTitle>
          <CardDescription className="text-purple-700">
            PostgreSQL schema designed for ESRS compliance, audit trails, and multi-tenant isolation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-md border border-purple-200">
            <h4 className="font-medium text-sm mb-3 text-purple-900">Schema Organization</h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="bg-purple-50 p-3 rounded border border-purple-100">
                <p className="font-medium text-purple-900 mb-1">Core Schema</p>
                <p className="text-xs text-purple-700">Companies, Users, Tenants</p>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-100">
                <p className="font-medium text-purple-900 mb-1">ESRS Schema</p>
                <p className="text-xs text-purple-700">Standards, Disclosures, Data Points</p>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-100">
                <p className="font-medium text-purple-900 mb-1">Audit Schema</p>
                <p className="text-xs text-purple-700">Logs, Versions, Evidence</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core">Core Entities</TabsTrigger>
          <TabsTrigger value="esrs">ESRS Framework</TabsTrigger>
          <TabsTrigger value="data">Data Collection</TabsTrigger>
          <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
        </TabsList>

        {/* Core Tables */}
        <TabsContent value="core" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-blue-600" />
                companies
              </CardTitle>
              <CardDescription>Multi-tenant company master data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Unique company identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">tenant_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL, INDEXED</Badge></td>
                      <td className="p-2">Tenant isolation key</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">legal_name</td>
                      <td className="p-2">VARCHAR(500)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Official registered company name</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">lei_code</td>
                      <td className="p-2">CHAR(20)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">UNIQUE</Badge></td>
                      <td className="p-2">Legal Entity Identifier (ISO 17442)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">nace_code</td>
                      <td className="p-2">VARCHAR(10)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">EU industry classification (for sector-specific disclosures)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">fiscal_year_end</td>
                      <td className="p-2">DATE</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Reporting period end date</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">csrd_scope</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Listed, Large, SME (determines phasing timeline)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">created_at</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT NOW()</Badge></td>
                      <td className="p-2">Record creation timestamp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-blue-600" />
                users
              </CardTitle>
              <CardDescription>Platform users with role-based access control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Unique user identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">company_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → companies</Badge></td>
                      <td className="p-2">Associated company</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">email</td>
                      <td className="p-2">VARCHAR(255)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">UNIQUE, NOT NULL</Badge></td>
                      <td className="p-2">Email for SSO authentication</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">role</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Admin, DataCollector, Reviewer, Auditor</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">department</td>
                      <td className="p-2">VARCHAR(100)</td>
                      <td className="p-2">—</td>
                      <td className="p-2">ESG, Finance, HR, Operations</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">last_login</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Audit log for access tracking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESRS Framework Tables */}
        <TabsContent value="esrs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-green-600" />
                esrs_standards
              </CardTitle>
              <CardDescription>Master list of ESRS standards (E1-E5, S1-S4, G1, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Standard identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">code</td>
                      <td className="p-2">VARCHAR(10)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">UNIQUE, NOT NULL</Badge></td>
                      <td className="p-2">ESRS-E1, ESRS-S1, etc.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">category</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Environmental, Social, Governance, General</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">title</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">"Climate Change", "Own Workforce", etc.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">version</td>
                      <td className="p-2">VARCHAR(20)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">ESRS taxonomy version (2023-01, 2024-02)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">mandatory</td>
                      <td className="p-2">BOOLEAN</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT FALSE</Badge></td>
                      <td className="p-2">TRUE for ESRS-1, ESRS-2 (always required)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-green-600" />
                disclosure_requirements
              </CardTitle>
              <CardDescription>Specific disclosure requirements within each standard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">DR identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">standard_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → esrs_standards</Badge></td>
                      <td className="p-2">Parent standard</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">code</td>
                      <td className="p-2">VARCHAR(20)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">E1-1, E1-2, S1-1, etc.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">type</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">GOV, SBM, IRO, Metrics</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">title</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">"Transition plan for climate change mitigation"</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">description</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Full requirement text from ESRS</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">phasing_allowed</td>
                      <td className="p-2">BOOLEAN</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT FALSE</Badge></td>
                      <td className="p-2">Can be omitted in year 1 under CSRD phasing rules</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-green-600" />
                data_point_templates
              </CardTitle>
              <CardDescription>Granular data points required for each DR (the "what to report")</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Data point template ID</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">dr_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → disclosure_requirements</Badge></td>
                      <td className="p-2">Parent DR</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">label</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">"Total Scope 1 GHG emissions (tCO2e)"</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">data_type</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Numeric, Narrative, Boolean, Date, Percentage</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">unit</td>
                      <td className="p-2">VARCHAR(50)</td>
                      <td className="p-2">—</td>
                      <td className="p-2">tCO2e, MWh, EUR, %, employees</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">xbrl_tag</td>
                      <td className="p-2">VARCHAR(200)</td>
                      <td className="p-2">—</td>
                      <td className="p-2">ESEF taxonomy element name</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">calculation_formula</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Reference to calculation engine function</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">validation_rules</td>
                      <td className="p-2">JSONB</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Min/max ranges, required format, dependencies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tables */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-orange-600" />
                materiality_assessments
              </CardTitle>
              <CardDescription>Double materiality assessment instances per company and reporting period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Assessment identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">company_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → companies</Badge></td>
                      <td className="p-2">Company performing assessment</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">reporting_period</td>
                      <td className="p-2">INT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">2024, 2025, etc.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">status</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Draft, InReview, Approved, Locked</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">methodology</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Description of DMA methodology used</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">approved_by</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → users</Badge></td>
                      <td className="p-2">User who approved DMA</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">approved_at</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Approval timestamp for audit trail</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-orange-600" />
                materiality_scores
              </CardTitle>
              <CardDescription>Individual topic scores from DMA (IRO-1 requirement)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Score identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">assessment_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → materiality_assessments</Badge></td>
                      <td className="p-2">Parent assessment</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">standard_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → esrs_standards</Badge></td>
                      <td className="p-2">ESRS topic being assessed</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">impact_materiality</td>
                      <td className="p-2">DECIMAL(3,2)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">CHECK (0-5)</Badge></td>
                      <td className="p-2">Impact on people/environment (IRO score)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">financial_materiality</td>
                      <td className="p-2">DECIMAL(3,2)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">CHECK (0-5)</Badge></td>
                      <td className="p-2">Financial impact on company (Risks/Opportunities)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">is_material</td>
                      <td className="p-2">BOOLEAN</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">COMPUTED</Badge></td>
                      <td className="p-2">TRUE if either dimension {'>'} threshold (e.g., 3.0)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">rationale</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Justification for score (auditor requirement)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-orange-600" />
                data_point_values
              </CardTitle>
              <CardDescription>Actual reported values for each data point (the core reporting data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Value record identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">company_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → companies</Badge></td>
                      <td className="p-2">Reporting company</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">data_point_template_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → data_point_templates</Badge></td>
                      <td className="p-2">Template definition</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">reporting_period</td>
                      <td className="p-2">INT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Year of data</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">value_numeric</td>
                      <td className="p-2">DECIMAL</td>
                      <td className="p-2">—</td>
                      <td className="p-2">For numeric data types</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">value_text</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">For narrative disclosures</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">is_calculated</td>
                      <td className="p-2">BOOLEAN</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT FALSE</Badge></td>
                      <td className="p-2">TRUE if auto-computed by calculation engine</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">entered_by</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → users</Badge></td>
                      <td className="p-2">User who entered/approved value</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">entered_at</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT NOW()</Badge></td>
                      <td className="p-2">Entry timestamp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tables */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-red-600" />
                evidence_documents
              </CardTitle>
              <CardDescription>Supporting evidence linked to data points (mandatory audit trail)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Document identifier</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">data_point_value_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → data_point_values</Badge></td>
                      <td className="p-2">Linked data point</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">file_name</td>
                      <td className="p-2">VARCHAR(500)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Original file name</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">s3_key</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL, UNIQUE</Badge></td>
                      <td className="p-2">Object storage path</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">file_hash</td>
                      <td className="p-2">CHAR(64)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">SHA-256 checksum for integrity verification</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">mime_type</td>
                      <td className="p-2">VARCHAR(100)</td>
                      <td className="p-2">—</td>
                      <td className="p-2">application/pdf, image/png, etc.</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">uploaded_by</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → users</Badge></td>
                      <td className="p-2">User who uploaded evidence</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">uploaded_at</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT NOW()</Badge></td>
                      <td className="p-2">Upload timestamp (immutable)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-red-600" />
                audit_log
              </CardTitle>
              <CardDescription>Immutable append-only log for all system actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">BIGSERIAL</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Sequential log entry ID</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">timestamp</td>
                      <td className="p-2">TIMESTAMP</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">DEFAULT NOW(), IMMUTABLE</Badge></td>
                      <td className="p-2">When action occurred</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">user_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → users</Badge></td>
                      <td className="p-2">Actor who performed action</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">action_type</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">CREATE, UPDATE, DELETE, APPROVE, EXPORT</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">entity_type</td>
                      <td className="p-2">VARCHAR(100)</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Table name (data_point_values, etc.)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">entity_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Record that was modified</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">old_values</td>
                      <td className="p-2">JSONB</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Before state (for UPDATE/DELETE)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">new_values</td>
                      <td className="p-2">JSONB</td>
                      <td className="p-2">—</td>
                      <td className="p-2">After state (for CREATE/UPDATE)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">ip_address</td>
                      <td className="p-2">INET</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Client IP for security analysis</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> This table uses PostgreSQL triggers to automatically log all changes to data_point_values and materiality_scores. Records cannot be updated or deleted (append-only constraint).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table className="h-5 w-5 text-red-600" />
                stakeholder_engagement_log
              </CardTitle>
              <CardDescription>Record of stakeholder consultations for DMA process (ESRS 1 requirement)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left p-2 font-medium">Column</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Constraints</th>
                      <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">PRIMARY KEY</Badge></td>
                      <td className="p-2">Engagement record ID</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">assessment_id</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → materiality_assessments</Badge></td>
                      <td className="p-2">Related DMA</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">stakeholder_group</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Employees, Customers, Investors, Communities, NGOs</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">engagement_type</td>
                      <td className="p-2">ENUM</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">Survey, Interview, Workshop, Public Consultation</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">date</td>
                      <td className="p-2">DATE</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">NOT NULL</Badge></td>
                      <td className="p-2">When engagement occurred</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">participants_count</td>
                      <td className="p-2">INT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Number of stakeholders consulted</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">summary</td>
                      <td className="p-2">TEXT</td>
                      <td className="p-2">—</td>
                      <td className="p-2">Key findings and feedback</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-mono text-xs">conducted_by</td>
                      <td className="p-2">UUID</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">FK → users</Badge></td>
                      <td className="p-2">Internal user who led engagement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Relationships Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-indigo-600" />
            Key Entity Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-6 rounded-md border border-slate-200 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-700">
{`
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────────────┐
│   companies     │────1:N──│ materiality_         │────1:N──│  materiality_scores     │
│                 │         │ assessments          │         │                         │
│ • tenant_id     │         │                      │         │ • standard_id (FK)      │
│ • lei_code      │         │ • reporting_period   │         │ • impact_materiality    │
│ • nace_code     │         │ • status             │         │ • financial_materiality │
└─────────────────┘         └──────────────────────┘         │ • is_material (derived) │
        │                                                     └─────────────────────────┘
        │                                                                  │
        │                                                                  │ (determines)
        │                                                                  ▼
        │                   ┌──────────────────────┐         ┌─────────────────────────┐
        │                   │  esrs_standards      │────1:N──│ disclosure_             │
        │                   │                      │         │ requirements            │
        │                   │ • code (ESRS-E1)     │         │                         │
        │                   │ • category           │         │ • code (E1-1, E1-2)     │
        │                   │ • mandatory          │         │ • type (GOV/SBM/IRO)    │
        │                   └──────────────────────┘         └─────────────────────────┘
        │                                                                  │
        │                                                                  │
        │                                                                  ▼
        │                                                     ┌─────────────────────────┐
        │                                                     │ data_point_templates    │
        │                                                     │                         │
        │                                                     │ • label                 │
        │                                                     │ • data_type             │
        │                                                     │ • xbrl_tag              │
        │                                                     │ • calculation_formula   │
        │                                                     └─────────────────────────┘
        │                                                                  │
        │                                                                  │
        │                                                                  ▼
        └──────────────────────────────────────────────────────┐  ┌─────────────────────────┐
                                                               └─▶│ data_point_values       │
                                                                  │                         │
                                                                  │ • value_numeric         │
                                                                  │ • value_text            │
                                                                  │ • is_calculated         │
                                                                  │ • entered_by (FK)       │
                                                                  └─────────────────────────┘
                                                                           │
                                                                           │
                                                                           ▼
                                                                  ┌─────────────────────────┐
                                                                  │ evidence_documents      │
                                                                  │                         │
                                                                  │ • s3_key                │
                                                                  │ • file_hash (SHA-256)   │
                                                                  │ • uploaded_at           │
                                                                  └─────────────────────────┘
`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

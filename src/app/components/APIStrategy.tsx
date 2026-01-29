import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Code, Zap, Shield, RefreshCw } from 'lucide-react';

export function APIStrategy() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-xl text-green-900">API Integration Strategy</CardTitle>
          <CardDescription className="text-green-700">
            Multi-layered API architecture for ERP/HR system integration and third-party data ingestion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="font-medium text-sm text-green-900 mb-1">RESTful API</p>
              <p className="text-xs text-green-700">Primary interface for data exchange</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="font-medium text-sm text-green-900 mb-1">GraphQL API</p>
              <p className="text-xs text-green-700">Flexible queries for complex reports</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="font-medium text-sm text-green-900 mb-1">Webhook System</p>
              <p className="text-xs text-green-700">Real-time event notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rest" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="erp">ERP Integration</TabsTrigger>
          <TabsTrigger value="connectors">Pre-built Connectors</TabsTrigger>
          <TabsTrigger value="security">Security & Auth</TabsTrigger>
        </TabsList>

        {/* REST API */}
        <TabsContent value="rest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                RESTful API Endpoints
              </CardTitle>
              <CardDescription>Core endpoints for data collection and reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Point Endpoints */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-900">Data Points</Badge>
                  Collection & Submission
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-green-600 text-white text-xs mb-1">POST</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/data-points</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Submit a new data point value with evidence</p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Request Payload Example</summary>
                      <pre className="bg-slate-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`{
  "data_point_template_id": "uuid-e1-ghg-scope1",
  "reporting_period": 2024,
  "value_numeric": 12543.67,
  "unit": "tCO2e",
  "calculation_metadata": {
    "sources": ["fuel_consumption_diesel", "natural_gas_usage"],
    "methodology": "GHG Protocol Corporate Standard"
  },
  "evidence_document_ids": [
    "uuid-evidence-invoice-1",
    "uuid-evidence-meter-reading"
  ],
  "comment": "Calculated from Q1-Q4 utility bills"
}`}
                      </pre>
                    </details>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-blue-600 text-white text-xs mb-1">GET</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/data-points?dr_code=E1-1&period=2024</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Retrieve data points for a specific disclosure requirement</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-yellow-600 text-white text-xs mb-1">PATCH</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/data-points/{'{id}'}</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Update a data point (creates audit log entry automatically)</p>
                  </div>
                </div>
              </div>

              {/* Materiality Assessment Endpoints */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-900">DMA</Badge>
                  Double Materiality Assessment
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-green-600 text-white text-xs mb-1">POST</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/materiality-assessments</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Create new DMA for a reporting period</p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Request Payload Example</summary>
                      <pre className="bg-slate-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`{
  "reporting_period": 2024,
  "methodology": "Hybrid approach: quantitative scoring (1-5) with stakeholder validation",
  "scores": [
    {
      "standard_code": "ESRS-E1",
      "impact_materiality": 4.5,
      "financial_materiality": 3.8,
      "rationale": "High Scope 1 emissions; carbon pricing risk from EU ETS"
    },
    {
      "standard_code": "ESRS-S1",
      "impact_materiality": 3.2,
      "financial_materiality": 2.9,
      "rationale": "Gender pay gap identified in annual review"
    }
  ]
}`}
                      </pre>
                    </details>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-blue-600 text-white text-xs mb-1">GET</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/materiality-assessments/{'{id}'}/applicable-standards</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Get list of material standards (basis for DR filtering)</p>
                  </div>
                </div>
              </div>

              {/* Export Endpoints */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-900">Export</Badge>
                  Report Generation
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-green-600 text-white text-xs mb-1">POST</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/reports/generate</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Async job to generate XBRL or PDF report</p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Request Payload Example</summary>
                      <pre className="bg-slate-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`{
  "reporting_period": 2024,
  "format": "xbrl", // or "pdf", "html"
  "include_sections": ["general_disclosures", "material_topics"],
  "xbrl_options": {
    "taxonomy_version": "esef-2024",
    "inline_xbrl": true,
    "validation_level": "strict"
  }
}

// Response:
{
  "job_id": "uuid-job-123",
  "status": "processing",
  "estimated_completion": "2024-01-15T14:30:00Z"
}`}
                      </pre>
                    </details>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="bg-blue-600 text-white text-xs mb-1">GET</Badge>
                        <code className="text-xs ml-2 font-mono text-slate-700">/api/v1/reports/jobs/{'{job_id}'}</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Poll job status and retrieve download URL when complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ERP Integration */}
        <TabsContent value="erp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                ERP System Integration Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* SAP Integration */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white">SAP S/4HANA</Badge>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="font-medium text-xs text-slate-500 uppercase">Connection Method</p>
                    <ul className="list-disc ml-5 space-y-1 text-xs">
                      <li>OData API v4 (preferred for cloud)</li>
                      <li>RFC/BAPI for on-premise systems</li>
                      <li>IDoc for batch data transfer</li>
                    </ul>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Data Extraction Examples</p>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Scope 1 GHG Data:</strong></p>
                      <code className="text-xs text-blue-600">
                        SAP EHS (Environment, Health & Safety) module → Emissions data
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Employee Metrics (ESRS S1):</strong></p>
                      <code className="text-xs text-blue-600">
                        SAP SuccessFactors → Headcount, turnover, training hours
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Supply Chain Data (ESRS E2):</strong></p>
                      <code className="text-xs text-blue-600">
                        SAP Ariba → Supplier sustainability ratings
                      </code>
                    </div>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Authentication</p>
                    <p className="text-xs">OAuth 2.0 with SAP Cloud Platform service keys</p>
                  </div>
                </div>

                {/* Oracle NetSuite */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Badge className="bg-orange-600 text-white">Oracle NetSuite</Badge>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="font-medium text-xs text-slate-500 uppercase">Connection Method</p>
                    <ul className="list-disc ml-5 space-y-1 text-xs">
                      <li>SuiteTalk (SOAP/REST Web Services)</li>
                      <li>SuiteScript for custom endpoints</li>
                      <li>CSV/FTP for bulk imports</li>
                    </ul>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Data Extraction Examples</p>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Energy Consumption (ESRS E1):</strong></p>
                      <code className="text-xs text-blue-600">
                        Utility invoices from AP module → kWh extraction
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Waste Management (ESRS E5):</strong></p>
                      <code className="text-xs text-blue-600">
                        Vendor bills for waste disposal → tonnage data
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Financial Disclosures (ESRS 2):</strong></p>
                      <code className="text-xs text-blue-600">
                        General Ledger → Revenue, OpEx by sustainability category
                      </code>
                    </div>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Authentication</p>
                    <p className="text-xs">Token-based authentication (TBA) with account-specific credentials</p>
                  </div>
                </div>

                {/* Microsoft Dynamics */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">Microsoft Dynamics 365</Badge>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="font-medium text-xs text-slate-500 uppercase">Connection Method</p>
                    <ul className="list-disc ml-5 space-y-1 text-xs">
                      <li>Dynamics 365 Web API (OData v4)</li>
                      <li>Power Automate for workflow triggers</li>
                      <li>Azure Data Factory for ETL pipelines</li>
                    </ul>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Data Extraction Examples</p>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>HR Metrics (ESRS S1):</strong></p>
                      <code className="text-xs text-blue-600">
                        Dynamics 365 HR → Employee demographics, compensation
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Customer Data (ESRS S4):</strong></p>
                      <code className="text-xs text-blue-600">
                        Dynamics 365 CRM → Customer complaints, accessibility
                      </code>
                    </div>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Authentication</p>
                    <p className="text-xs">Azure AD with service principal authentication</p>
                  </div>
                </div>

                {/* Workday */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white">Workday HCM</Badge>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="font-medium text-xs text-slate-500 uppercase">Connection Method</p>
                    <ul className="list-disc ml-5 space-y-1 text-xs">
                      <li>Workday REST API</li>
                      <li>Workday Report-as-a-Service (RaaS)</li>
                      <li>SOAP Web Services (legacy)</li>
                    </ul>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Data Extraction Examples</p>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Workforce Composition (ESRS S1-1):</strong></p>
                      <code className="text-xs text-blue-600">
                        Worker_Data service → Gender, age, contract type
                      </code>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 mt-1">
                      <p className="text-xs mb-1"><strong>Training & Development (ESRS S1-13):</strong></p>
                      <code className="text-xs text-blue-600">
                        Learning records → Training hours by employee
                      </code>
                    </div>

                    <p className="font-medium text-xs text-slate-500 uppercase mt-3">Authentication</p>
                    <p className="text-xs">ISU (Integration System User) with OAuth 2.0</p>
                  </div>
                </div>
              </div>

              {/* Integration Flow Diagram */}
              <div className="mt-6">
                <h4 className="font-medium text-sm mb-3">Generic Integration Flow</h4>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-700">
{`
┌──────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   ERP/HR     │         │  Middleware  │         │  ESRS SaaS   │         │   Database   │
│   System     │         │  (ETL Layer) │         │   Platform   │         │  PostgreSQL  │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │                        │
       │  1. API Call           │                        │                        │
       │  (scheduled/triggered) │                        │                        │
       ├───────────────────────▶│                        │                        │
       │                        │                        │                        │
       │  2. Data Transformation│                        │                        │
       │     • Map to ESRS model│                        │                        │
       │     • Unit conversion  │                        │                        │
       │     • Data validation  │                        │                        │
       │                        │  3. POST /api/v1/      │                        │
       │                        │     data-points        │                        │
       │                        ├───────────────────────▶│                        │
       │                        │                        │                        │
       │                        │  4. Validation &       │                        │
       │                        │     Tenant Check       │                        │
       │                        │                        │  5. INSERT with        │
       │                        │                        │     audit trail        │
       │                        │                        ├───────────────────────▶│
       │                        │                        │                        │
       │                        │  6. Webhook Event      │                        │
       │                        │◀───────────────────────┤                        │
       │                        │     (data.point.       │                        │
       │                        │      created)          │                        │
       │                        │                        │                        │
       │  7. Confirmation to    │                        │                        │
       │     source system      │                        │                        │
       │◀───────────────────────┤                        │                        │
       │                        │                        │                        │
`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pre-built Connectors */}
        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Pre-built Integration Connectors
              </CardTitle>
              <CardDescription>Turnkey solutions for common data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connector List */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Utility Bill Parser</h4>
                      <Badge className="bg-blue-600 text-white text-xs">AI-Powered</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      OCR + NLP to extract energy/water consumption from utility invoices (PDF/email)
                    </p>
                    <div className="text-xs">
                      <p className="font-medium text-slate-700 mb-1">Supports:</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Electricity (kWh) → ESRS E1 Scope 2</li>
                        <li>Natural gas (m³) → ESRS E1 Scope 1</li>
                        <li>Water (liters) → ESRS E3</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-md p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Carbon Accounting APIs</h4>
                      <Badge className="bg-green-600 text-white text-xs">Third-Party</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Direct integrations with carbon calculation platforms
                    </p>
                    <div className="text-xs">
                      <p className="font-medium text-slate-700 mb-1">Integrated Services:</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Watershed API (Scope 3 supply chain)</li>
                        <li>Persefoni (carbon footprint)</li>
                        <li>Normative (product-level LCA)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-purple-200 rounded-md p-4 bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">HR System Connector</h4>
                      <Badge className="bg-purple-600 text-white text-xs">OAuth 2.0</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Automated sync for ESRS S1 (Own Workforce) metrics
                    </p>
                    <div className="text-xs">
                      <p className="font-medium text-slate-700 mb-1">Data Points:</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Employee headcount & demographics</li>
                        <li>Gender pay gap calculations</li>
                        <li>Training hours per FTE</li>
                        <li>Turnover rates</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-orange-200 rounded-md p-4 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">IoT Sensor Integration</h4>
                      <Badge className="bg-orange-600 text-white text-xs">MQTT/CoAP</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Real-time environmental monitoring for facilities
                    </p>
                    <div className="text-xs">
                      <p className="font-medium text-slate-700 mb-1">Use Cases:</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Building energy meters (ESRS E1)</li>
                        <li>Water flow sensors (ESRS E3)</li>
                        <li>Waste bin fill sensors (ESRS E5)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Connector Configuration Example */}
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3">Example: Configuring an ERP Connector</h4>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-md text-xs overflow-x-auto">
                    <pre>
{`// Platform Configuration UI → Integrations → Add New

{
  "connector_type": "sap_s4hana",
  "connection": {
    "base_url": "https://api.sap.example.com",
    "auth_method": "oauth2",
    "client_id": "{{VAULT_SECRET:sap_client_id}}",
    "client_secret": "{{VAULT_SECRET:sap_client_secret}}"
  },
  "sync_schedule": {
    "frequency": "daily",
    "time": "02:00 UTC",
    "timezone": "Europe/Brussels"
  },
  "data_mappings": [
    {
      "source": "SAP_EHS.EmissionsRegister.CO2_Total",
      "destination": {
        "data_point_template_id": "esrs-e1-scope1-total",
        "unit_conversion": {
          "from": "kg",
          "to": "tCO2e",
          "factor": 0.001
        }
      },
      "filters": {
        "fiscal_year": "current",
        "entity_code": "EU01"
      }
    },
    {
      "source": "SAP_SuccessFactors.EmployeeData.HeadCount",
      "destination": {
        "data_point_template_id": "esrs-s1-total-employees"
      },
      "filters": {
        "employment_type": "permanent",
        "status": "active"
      }
    }
  ],
  "error_handling": {
    "on_failure": "retry_3_times",
    "notification_email": "esg-team@example.com"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                API Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Authentication */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3">Authentication Methods</h4>
                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="font-medium mb-1">JWT Tokens (Primary)</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Short-lived access tokens (15 min)</li>
                        <li>Refresh tokens stored in httpOnly cookies</li>
                        <li>RS256 signing with rotated keys</li>
                        <li>Token payload includes tenant_id for RLS enforcement</li>
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="font-medium mb-1">API Keys (Machine-to-Machine)</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>SHA-256 hashed storage</li>
                        <li>Scoped permissions (read-only, write, admin)</li>
                        <li>Rate limiting per key (1000 req/hour default)</li>
                        <li>IP whitelisting optional</li>
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="font-medium mb-1">OAuth 2.0 (Third-Party Integrations)</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>Authorization Code flow with PKCE</li>
                        <li>Scopes: esrs:read, esrs:write, esrs:export</li>
                        <li>Consent screen for data access transparency</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Authorization */}
                <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <h4 className="font-medium text-sm mb-3">Authorization & Permissions</h4>
                  <div className="space-y-3 text-xs">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="font-medium mb-1">Role-Based Access Control (RBAC)</p>
                      <table className="w-full text-xs mt-2">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left p-1">Role</th>
                            <th className="text-left p-1">Permissions</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-600">
                          <tr className="border-b border-slate-100">
                            <td className="p-1">Admin</td>
                            <td className="p-1">Full CRUD, export, user mgmt</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-1">Data Collector</td>
                            <td className="p-1">Create/update data points</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-1">Reviewer</td>
                            <td className="p-1">Read + approve submissions</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-1">Auditor</td>
                            <td className="p-1">Read-only + audit logs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white p-3 rounded border border-slate-200">
                      <p className="font-medium mb-1">Row-Level Security (RLS)</p>
                      <ul className="list-disc ml-5 text-slate-600 space-y-0.5">
                        <li>PostgreSQL RLS policies enforce tenant isolation</li>
                        <li>Every query auto-filters by <code className="bg-slate-100 px-1 rounded">tenant_id</code></li>
                        <li>Prevents cross-tenant data leakage</li>
                      </ul>
                      <div className="bg-slate-900 text-green-400 p-2 rounded mt-2 text-xs">
                        <code>
                          {`CREATE POLICY tenant_isolation ON data_point_values
  USING (tenant_id = current_setting('app.current_tenant')::uuid);`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Limiting & Security Headers */}
              <div className="border border-red-200 rounded-md p-4 bg-red-50">
                <h4 className="font-medium text-sm mb-3 text-red-900">Additional Security Measures</h4>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium mb-1">Rate Limiting (Kong/AWS API Gateway)</p>
                    <ul className="list-disc ml-5 text-red-800 space-y-0.5">
                      <li>Anonymous: 100 req/hour</li>
                      <li>Authenticated: 1000 req/hour</li>
                      <li>Premium tier: 10,000 req/hour</li>
                      <li>Burst allowance: 20 req/second</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Security Headers</p>
                    <ul className="list-disc ml-5 text-red-800 space-y-0.5">
                      <li>CORS: Whitelist approved domains only</li>
                      <li>Content-Security-Policy: No inline scripts</li>
                      <li>X-Frame-Options: DENY</li>
                      <li>Strict-Transport-Security (HSTS)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Input Validation</p>
                    <ul className="list-disc ml-5 text-red-800 space-y-0.5">
                      <li>JSON Schema validation on all payloads</li>
                      <li>SQL injection prevention (parameterized queries)</li>
                      <li>XSS sanitization for narrative fields</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Encryption</p>
                    <ul className="list-disc ml-5 text-red-800 space-y-0.5">
                      <li>TLS 1.3 for all API traffic</li>
                      <li>At-rest encryption: AES-256 (PostgreSQL TDE)</li>
                      <li>Field-level encryption for PII (pgcrypto)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Server, Database, Cloud, Lock, Zap, Globe } from 'lucide-react';

export function ArchitectureOverview() {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Executive Summary</CardTitle>
          <CardDescription className="text-blue-700">
            Enterprise-grade SaaS platform for CSRD/ESRS compliance automation
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>
            This platform automates the entire sustainability reporting lifecycle, from double materiality
            assessment through XBRL-ready report generation, ensuring full compliance with ESRS standards
            (E1-E5, S1-S4, G1).
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">CSRD Compliant</Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">ESRS 1 & 2</Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">XBRL Export</Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-900">Audit Trail</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Technical Stack */}
      <Tabs defaultValue="frontend" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
          <TabsTrigger value="backend">Backend</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="frontend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Frontend Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Core Framework</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Next.js 14+</span> (React 18)</p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Server-Side Rendering (SSR) for SEO and performance</li>
                      <li>App Router for nested layouts and optimized routing</li>
                      <li>API Routes for BFF (Backend-for-Frontend) pattern</li>
                      <li>Incremental Static Regeneration (ISR) for reporting pages</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">State Management</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Zustand + TanStack Query</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Zustand for global application state (user, company context)</li>
                      <li>TanStack Query for server state, caching, and optimistic updates</li>
                      <li>React Hook Form for complex form validation (DMA workflows)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">UI/UX Layer</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Tailwind CSS + Radix UI + shadcn/ui</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Tailwind for utility-first styling with custom design tokens</li>
                      <li>Radix UI primitives for accessibility (WCAG 2.1 AA)</li>
                      <li>React Flow for visual workflow builder (DMA mapping)</li>
                      <li>Recharts for sustainability KPI dashboards</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-green-600" />
                Backend Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Primary API Layer</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Django 5.x + Django REST Framework (DRF)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Django ORM for complex relational queries (materiality matrix joins)</li>
                      <li>DRF for RESTful API with automatic OpenAPI schema generation</li>
                      <li>Celery for asynchronous tasks (XBRL generation, ERP sync)</li>
                      <li>Django Channels for WebSocket support (real-time collaboration)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Calculation Engine</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Python Microservice</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Pandas + NumPy for GHG Protocol calculations (Scope 1, 2, 3)</li>
                      <li>Custom libraries for ESRS-specific formulas (gender pay gap, water intensity)</li>
                      <li>Version-controlled calculation logic (audit compliance)</li>
                      <li>FastAPI wrapper for high-performance compute endpoints</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Document Processing</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Apache Tika + Arelle (XBRL)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>OCR and text extraction from evidence documents (PDFs, scans)</li>
                      <li>Arelle library for XBRL taxonomy validation (ESEF/ESRS)</li>
                      <li>WeasyPrint for PDF report generation with CSS Paged Media</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Database & Storage Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Primary Database</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">PostgreSQL 15+ with Extensions</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li><code className="text-xs bg-slate-200 px-1 rounded">pg_partman</code>: Table partitioning for multi-tenant data isolation</li>
                      <li><code className="text-xs bg-slate-200 px-1 rounded">pgcrypto</code>: Column-level encryption for sensitive stakeholder data</li>
                      <li><code className="text-xs bg-slate-200 px-1 rounded">jsonb</code>: Flexible schema for dynamic disclosure requirements</li>
                      <li><code className="text-xs bg-slate-200 px-1 rounded">temporal_tables</code>: Bi-temporal support for audit trail (valid-time & transaction-time)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Caching Layer</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Redis 7.x</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Session management and JWT token blacklisting</li>
                      <li>Cache for computed KPIs and materiality scores</li>
                      <li>Pub/Sub for real-time notifications (stakeholder comments)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Document Storage</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">AWS S3 / Azure Blob Storage</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>Versioned buckets for evidence documents (immutable audit trail)</li>
                      <li>Pre-signed URLs with expiration for secure document access</li>
                      <li>Lifecycle policies for archival to Glacier (7+ year retention)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-orange-600" />
                Infrastructure & DevOps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Cloud Platform</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">AWS / Azure (Multi-Region)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>EU-West-1 (Ireland) primary for GDPR compliance</li>
                      <li>Kubernetes (EKS/AKS) for container orchestration</li>
                      <li>Auto-scaling based on reporting cycle peaks (Q1, Q4)</li>
                      <li>CloudFront/Azure CDN for static asset delivery</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Security & Compliance</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">Zero Trust Architecture</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li><strong>Auth0 / Okta:</strong> SSO with SAML 2.0 / OAuth 2.1</li>
                      <li><strong>HashiCorp Vault:</strong> Secrets management and encryption key rotation</li>
                      <li><strong>SOC 2 Type II:</strong> Annual compliance audits</li>
                      <li><strong>ISO 27001:</strong> Information security management</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Monitoring & Observability</h4>
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm mb-2"><span className="font-medium">DataDog / New Relic Stack</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                      <li>APM for Django/Next.js performance tracking</li>
                      <li>Log aggregation with structured JSON logs</li>
                      <li>Custom dashboards for calculation engine latency</li>
                      <li>Alert rules for XBRL validation errors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Design Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Core Design Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-green-700" />
                <h4 className="font-medium text-sm text-green-900">Data Integrity</h4>
              </div>
              <ul className="text-sm text-green-800 space-y-1 ml-6 list-disc">
                <li>Immutable audit logs (append-only)</li>
                <li>Cryptographic checksums for all documents</li>
                <li>Row-level security (RLS) in PostgreSQL</li>
                <li>WORM (Write Once Read Many) storage for evidence</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-700" />
                <h4 className="font-medium text-sm text-blue-900">Multi-Tenancy</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                <li>Schema-per-tenant for large enterprises</li>
                <li>Shared schema with tenant_id for SMEs</li>
                <li>Isolated connection pools per tenant tier</li>
                <li>Tenant-aware middleware in all API requests</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-700" />
                <h4 className="font-medium text-sm text-purple-900">Performance</h4>
              </div>
              <ul className="text-sm text-purple-800 space-y-1 ml-6 list-disc">
                <li>Materialized views for complex reporting queries</li>
                <li>Database indices on frequently queried fields</li>
                <li>Edge caching for generated XBRL files</li>
                <li>Lazy loading for disclosure requirement trees</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-orange-700" />
                <h4 className="font-medium text-sm text-orange-900">Extensibility</h4>
              </div>
              <ul className="text-sm text-orange-800 space-y-1 ml-6 list-disc">
                <li>Plugin architecture for custom calculations</li>
                <li>Webhook system for third-party integrations</li>
                <li>GraphQL API for flexible data fetching</li>
                <li>ESRS taxonomy updates via version migrations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

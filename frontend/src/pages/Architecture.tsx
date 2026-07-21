import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";

interface ArchNode {
  id: string;
  name: string;
  layer: number;
  color: string;
  purpose: string;
  responsibilities: string[];
  technologies: string[];
  apis: string[];
  dataFlow: string[];
}

const NODES: ArchNode[] = [
  {
    id: "dashboard",
    name: "React Dashboard",
    layer: 1,
    color: "bg-primary text-white",
    purpose: "Frontend user interface for managing AI feature flags and monitoring rollouts.",
    responsibilities: ["Display real-time metrics", "Manage feature flags", "Visualize rollout progress", "Show system health"],
    technologies: ["React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts"],
    apis: ["REST API via API Gateway", "WebSocket for live updates"],
    dataFlow: ["User → Dashboard → API Gateway → Flag Service"],
  },
  {
    id: "gateway",
    name: "API Gateway",
    layer: 2,
    color: "bg-success text-white",
    purpose: "Central entry point for all API requests with authentication, rate limiting, and routing.",
    responsibilities: ["Request authentication", "Rate limiting", "Request routing", "Load balancing"],
    technologies: ["Node.js", "Express", "Redis Rate Limit", "JWT Auth"],
    apis: ["POST /api/v1/flags", "GET /api/v1/flags", "POST /api/v1/rollouts", "GET /api/v1/quality"],
    dataFlow: ["Dashboard → API Gateway → Flag Service", "API Gateway → Quality Worker → Judge"],
  },
  {
    id: "flag-service",
    name: "Flag Service",
    layer: 3,
    color: "bg-warning text-white",
    purpose: "Core service managing feature flag definitions, configurations, and evaluation.",
    responsibilities: ["Flag CRUD operations", "Flag evaluation engine", "Percentage rollout logic", "Variant assignment"],
    technologies: ["Node.js", "TypeScript", "PostgreSQL", "Redis Cache"],
    apis: ["GET /flags/:id/evaluate", "POST /flags", "PUT /flags/:id/config", "GET /flags/:id/status"],
    dataFlow: ["API Gateway → Flag Service → PostgreSQL", "Flag Service → Redis Cache"],
  },
  {
    id: "redis",
    name: "Redis Cache",
    layer: 4,
    color: "bg-error text-white",
    purpose: "In-memory cache for flag evaluations and real-time metrics aggregation.",
    responsibilities: ["Cache flag evaluations", "Real-time metrics aggregation", "Session management", "Rate limit counters"],
    technologies: ["Redis 7", "Redis Cluster", "Redis Streams"],
    apis: ["GET flag:flagId", "SET flag:flagId", "INCR metrics:key"],
    dataFlow: ["Flag Service reads/writes to Redis", "Quality Worker reads from Redis Streams"],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    layer: 4,
    color: "bg-ink-700 text-white",
    purpose: "Primary database for persistent storage of flags, rollouts, evaluations, and events.",
    responsibilities: ["Persist flag configurations", "Store rollout history", "Record evaluations", "Audit logging"],
    technologies: ["PostgreSQL 16", "TimescaleDB", "pg_stat_statements"],
    apis: ["SQL queries via Flag Service", "SQL queries via Quality Worker"],
    dataFlow: ["Flag Service → PostgreSQL", "Quality Worker → PostgreSQL", "Rollback Monitor → PostgreSQL"],
  },
  {
    id: "quality-worker",
    name: "Quality Worker",
    layer: 5,
    color: "bg-primary text-white",
    purpose: "Background worker that evaluates AI response quality using judge models and sliding windows.",
    responsibilities: ["Quality evaluation", "Sliding window computation", "Trigger quality alerts", "Score aggregation"],
    technologies: ["Node.js", "BullMQ", "Redis Streams", "OpenAI API"],
    apis: ["Internal: Judge Service", "Internal: PostgreSQL", "Internal: Redis"],
    dataFlow: ["Flag Service → Quality Worker → Judge", "Quality Worker → PostgreSQL", "Quality Worker → Rollback Monitor"],
  },
  {
    id: "judge",
    name: "Judge Service",
    layer: 6,
    color: "bg-success text-white",
    purpose: "AI-powered evaluation service that scores response quality using LLM-as-a-judge.",
    responsibilities: ["Score response quality", "Compare baseline vs experimental", "Compute P10/stdDev metrics", "Detect regressions"],
    technologies: ["Python", "FastAPI", "OpenAI GPT-4", "LangChain"],
    apis: ["POST /judge/evaluate", "POST /judge/compare", "GET /judge/status"],
    dataFlow: ["Quality Worker → Judge Service → Quality Worker"],
  },
  {
    id: "analyzer",
    name: "Analyzer",
    layer: 6,
    color: "bg-warning text-white",
    purpose: "Statistical analysis engine for canary comparisons and significance testing.",
    responsibilities: ["Canary analysis", "Statistical significance tests", "Confidence interval computation", "Metric comparison"],
    technologies: ["Python", "SciPy", "NumPy", "Statsmodels"],
    apis: ["POST /analyze/canary", "POST /analyze/metrics", "GET /analyze/report"],
    dataFlow: ["Quality Worker → Analyzer", "Analyzer → Rollback Monitor"],
  },
  {
    id: "rollback-monitor",
    name: "Rollback Monitor",
    layer: 7,
    color: "bg-error text-white",
    purpose: "Monitors quality metrics and automatically triggers rollbacks when thresholds are breached.",
    responsibilities: ["Monitor quality thresholds", "Trigger automatic rollbacks", "Notify Slack", "Log rollback events"],
    technologies: ["Node.js", "BullMQ", "Slack SDK", "PostgreSQL"],
    apis: ["POST /rollbacks/trigger", "POST /slack/notify", "GET /rollbacks/history"],
    dataFlow: ["Quality Worker → Rollback Monitor → Slack", "Rollback Monitor → PostgreSQL"],
  },
  {
    id: "slack",
    name: "Slack Notifier",
    layer: 8,
    color: "bg-ink-500 text-white",
    purpose: "Sends real-time notifications to configured Slack channels for all platform events.",
    responsibilities: ["Send rollback alerts", "Send canary results", "Notify stage advancements", "Alert on quality degradation"],
    technologies: ["Slack Web API", "Slack Block Kit", "Webhooks"],
    apis: ["POST /api/chat.postMessage", "POST /api/chat.postEphemeral"],
    dataFlow: ["Rollback Monitor → Slack Notifier → Slack Channel"],
  },
];

const LAYER_LABELS = [
  "UI Layer",
  "API Layer",
  "Service Layer",
  "Data Layer",
  "Worker Layer",
  "AI Services",
  "Monitoring",
  "Notifications",
];

export default function Architecture() {
  const [selected, setSelected] = useState<ArchNode | null>(null);

  return (
    <div>
      <PageHeader
        title="System Architecture"
        description="Interactive architecture diagram showing all platform components."
      />

      <div className="card p-6">
        <div className="relative flex flex-col items-center gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((layer) => {
            const nodesInLayer = NODES.filter((n) => n.layer === layer);
            if (nodesInLayer.length === 0) return null;
            return (
              <div key={layer} className="w-full">
                <p className="mb-3 text-xs font-semibold text-ink-500 text-center uppercase tracking-wider">
                  {LAYER_LABELS[layer - 1]}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {nodesInLayer.map((node) => (
                    <motion.button
                      key={node.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected(node)}
                      className={`focus-ring flex items-center gap-2.5 rounded-xl2 px-5 py-3 text-sm font-medium shadow-softer transition-shadow hover:shadow-soft ${node.color}`}
                    >
                      {node.name}
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </motion.button>
                  ))}
                </div>
                {layer < 8 && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex flex-col items-center gap-1 text-ink-300">
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                        <path d="M12 16L0 0H24L12 16Z" fill="currentColor" opacity="0.3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/30 p-4 pt-12 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="card w-full max-w-xl max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`rounded-xl2 px-4 py-2 text-sm font-medium ${selected.color}`}>
                  {selected.name}
                </div>
                <button onClick={() => setSelected(null)} className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Purpose</p>
                  <p className="text-sm text-ink-700">{selected.purpose}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Responsibilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.responsibilities.map((r) => (
                      <span key={r} className="rounded-pill bg-surface-bg px-3 py-1 text-xs text-ink-700">{r}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.technologies.map((t) => (
                      <span key={t} className="rounded-pill bg-primary-50 px-3 py-1 text-xs text-primary">{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">APIs</p>
                  <div className="space-y-1">
                    {selected.apis.map((api) => (
                      <div key={api} className="flex items-center gap-2 rounded-lg bg-surface-bg px-3 py-2">
                        <code className="text-xs text-ink-700">{api}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Data Flow</p>
                  <div className="space-y-1">
                    {selected.dataFlow.map((flow) => (
                      <div key={flow} className="flex items-center gap-2 rounded-lg bg-surface-bg px-3 py-2">
                        <span className="text-xs text-ink-700 font-mono">{flow}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

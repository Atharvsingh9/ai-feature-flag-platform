import { motion } from "framer-motion";
import { Code, Zap, GitBranch, Activity, Shield, ChevronRight } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";

const SECTIONS = [
  {
    title: "Quick Start",
    icon: Zap,
    color: "bg-primary-50 text-primary",
    content: (
      <div>
        <p className="text-sm text-ink-700 mb-4">
          Integrate AI feature flags in your application with just a few lines of code.
        </p>
        <div className="rounded-xl2 bg-ink-900 p-4 font-mono text-sm text-white overflow-x-auto">
          <pre className="leading-relaxed">
            <span className="text-ink-500">from </span>
            <span className="text-green-400">ai_flags</span>
            <span className="text-ink-500"> import </span>
            <span className="text-green-400">AIFlagsClient</span>
            <br />
            <br />
            <span className="text-ink-500">client = </span>
            <span className="text-yellow-400">AIFlagsClient</span>
            <span className="text-white">(</span>
            <span className="text-green-400">api_key</span>
            <span className="text-white">=</span>
            <span className="text-orange-400">"YOUR_API_KEY"</span>
            <span className="text-white">)</span>
            <br />
            <span className="text-ink-500">result = </span>
            <span className="text-yellow-400">client.evaluate</span>
            <span className="text-white">(</span>
            <span className="text-orange-400">"email-generator"</span>
            <span className="text-white">, user)</span>
          </pre>
        </div>
      </div>
    ),
  },
  {
    title: "AI vs Non-AI Fallback",
    icon: GitBranch,
    color: "bg-success-50 text-success",
    content: (
      <div>
        <p className="text-sm text-ink-700 mb-4">
          Automatically fall back to template-based responses when AI quality drops below threshold.
        </p>
        <div className="rounded-xl2 bg-ink-900 p-4 font-mono text-sm text-white overflow-x-auto">
          <pre className="leading-relaxed">
            <span className="text-ink-500">result = </span>
            <span className="text-yellow-400">client.evaluate</span>
            <span className="text-white">(</span>
            <span className="text-orange-400">"email-generator"</span>
            <span className="text-white">, user)</span>
            <br />
            <br />
            <span className="text-blue-400">if </span>
            <span className="text-white">result.</span>
            <span className="text-yellow-400">enabled</span>
            <span className="text-white">:</span>
            <br />
            <span className="text-white">&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="text-blue-400">return </span>
            <span className="text-yellow-400">generate_ai_email</span>
            <span className="text-white">()</span>
            <br />
            <span className="text-blue-400">else</span>
            <span className="text-white">:</span>
            <br />
            <span className="text-white">&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="text-blue-400">return </span>
            <span className="text-yellow-400">generate_template_email</span>
            <span className="text-white">()</span>
          </pre>
        </div>
      </div>
    ),
  },
  {
    title: "Prompt A/B Testing",
    icon: Activity,
    color: "bg-warning-50 text-warning",
    content: (
      <div>
        <p className="text-sm text-ink-700 mb-4">
          Test different prompt versions against each other with automatic quality scoring.
        </p>
        <div className="rounded-xl2 bg-ink-900 p-4 font-mono text-sm text-white overflow-x-auto">
          <pre className="leading-relaxed">
            <span className="text-ink-500">result = </span>
            <span className="text-yellow-400">client.evaluate</span>
            <span className="text-white">(</span>
            <span className="text-orange-400">"assistant"</span>
            <span className="text-white">, user)</span>
            <br />
            <br />
            <span className="text-ink-500">prompt = </span>
            <span className="text-white">result.</span>
            <span className="text-yellow-400">prompt_version</span>
            <br />
            <span className="text-ink-500">print</span>
            <span className="text-white">(</span>
            <span className="text-green-400">f"Using prompt: {'{prompt}'}"</span>
            <span className="text-white">)</span>
          </pre>
        </div>
      </div>
    ),
  },
  {
    title: "Model Swap Testing",
    icon: Code,
    color: "bg-primary-50 text-primary",
    content: (
      <div>
        <p className="text-sm text-ink-700 mb-4">
          Route traffic between different AI models to compare performance and cost.
        </p>
        <div className="rounded-xl2 bg-ink-900 p-4 font-mono text-sm text-white overflow-x-auto">
          <pre className="leading-relaxed">
            <span className="text-ink-500">result = </span>
            <span className="text-yellow-400">client.evaluate</span>
            <span className="text-white">(</span>
            <span className="text-orange-400">"assistant"</span>
            <span className="text-white">, user)</span>
            <br />
            <br />
            <span className="text-ink-500">model = </span>
            <span className="text-white">result.</span>
            <span className="text-yellow-400">model</span>
            <br />
            <span className="text-ink-500">print</span>
            <span className="text-white">(</span>
            <span className="text-green-400">f"Serving from: {'{model}'}"</span>
            <span className="text-white">)</span>
          </pre>
        </div>
      </div>
    ),
  },
  {
    title: "Automatic Quality Monitoring",
    icon: Shield,
    color: "bg-success-50 text-success",
    content: (
      <div>
        <p className="text-sm text-ink-700 mb-4">
          Developers do <strong>not</strong> need to manually send metrics. The platform automatically handles:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            "Quality monitoring via Judge Service",
            "Canary analysis with statistical significance",
            "Shadow mode evaluations",
            "Automatic rollbacks on threshold breach",
            "Slack notifications for all events",
            "Rolling window quality computation",
            "Latency and error rate tracking",
            "P10 and standard deviation metrics",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl bg-surface-bg p-3">
              <ChevronRight className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs text-ink-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Documentation() {
  return (
    <div>
      <PageHeader
        title="SDK Documentation"
        description="Integrate AI feature flags into your application with the Aegis Flags SDK."
      />
      <div className="grid grid-cols-1 gap-5">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl2 ${section.color}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink-900">{section.title}</h3>
            </div>
            {section.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

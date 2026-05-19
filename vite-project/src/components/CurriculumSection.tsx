import { motion } from "framer-motion";
import { GitBranch, Container, Cloud, Shield, BarChart3, Workflow } from "lucide-react";

const modules = [
  { icon: GitBranch, title: "Git & CI/CD Pipelines", weeks: "Weeks 1–3", topics: ["Git workflows", "GitHub Actions", "Jenkins", "GitLab CI", "Automated testing"] },
  { icon: Container, title: "Containers & Docker", weeks: "Weeks 4–6", topics: ["Dockerfile mastery", "Docker Compose", "Multi-stage builds", "Image optimization", "Registry management"] },
  { icon: Workflow, title: "Kubernetes & Orchestration", weeks: "Weeks 7–10", topics: ["K8s architecture", "Deployments & Services", "Helm charts", "Ingress & networking", "Auto-scaling"] },
  { icon: Cloud, title: "Cloud & Infrastructure as Code", weeks: "Weeks 11–14", topics: ["AWS / GCP core services", "Terraform", "Ansible", "CloudFormation", "Multi-cloud strategies"] },
  { icon: BarChart3, title: "Monitoring & Observability", weeks: "Weeks 15–17", topics: ["Prometheus & Grafana", "ELK Stack", "Distributed tracing", "Alerting strategies", "SLOs & SLIs"] },
  { icon: Shield, title: "Security & Production Ops", weeks: "Weeks 18–20", topics: ["DevSecOps practices", "Secrets management", "Incident response", "Chaos engineering", "Final capstone project"] },
];

const CurriculumSection = () => {
  return (
    <section id="curriculum" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary text-glow-sm">// curriculum</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            20 Weeks of <span className="gradient-text">Intensive Training</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A structured, hands-on path from fundamentals to production-grade infrastructure.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:box-glow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <mod.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{mod.weeks}</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{mod.title}</h3>
              <ul className="space-y-1.5">
                {mod.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary/60" />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;

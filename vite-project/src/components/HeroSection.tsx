import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
      <div className="h-full w-full bg-gradient-to-br from-primary/20 via-background to-muted/40" />

        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            New cohort starting April 2026
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Master <span className="gradient-text text-glow">DevOps</span>
            <br />
            From Zero to Production
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            A hands-on, project-based course covering CI/CD, Docker, Kubernetes, Terraform, AWS, monitoring, and everything you need to become a production-ready DevOps engineer.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#pricing"
              className="group flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-mono text-sm font-semibold text-primary-foreground transition-all hover:box-glow"
            >
              Start Learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#curriculum"
              className="flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 font-mono text-sm text-secondary-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <Play className="h-4 w-4" />
              View Curriculum
            </a>
          </div>

          {/* Terminal snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full bg-muted-foreground/50" />
              <span className="h-3 w-3 rounded-full bg-primary/70" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">terminal</span>
            </div>
            <div className="p-5 text-left font-mono text-sm leading-relaxed">
              <p className="text-muted-foreground">$ <span className="text-primary">kubectl</span> get pods --all-namespaces</p>
              <p className="mt-1 text-muted-foreground">NAMESPACE &nbsp;&nbsp; NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY &nbsp; STATUS</p>
              <p className="text-foreground">default &nbsp;&nbsp;&nbsp; app-deploy-7d4f &nbsp; 3/3 &nbsp;&nbsp;&nbsp; <span className="text-primary">Running ✓</span></p>
              <p className="text-foreground">monitoring &nbsp;prometheus-0 &nbsp;&nbsp;&nbsp;&nbsp; 1/1 &nbsp;&nbsp;&nbsp; <span className="text-primary">Running ✓</span></p>
              <p className="mt-2 text-muted-foreground">$ <span className="text-primary">terraform</span> apply --auto-approve</p>
              <p className="text-primary">Apply complete! Resources: 12 added, 0 changed, 0 destroyed.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

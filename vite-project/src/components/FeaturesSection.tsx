import { motion } from "framer-motion";
import { Laptop, Users, Trophy, Headphones, BookOpen, Rocket } from "lucide-react";

const features = [
  { icon: Laptop, title: "Hands-On Labs", desc: "Real cloud environments — not simulations. Build actual infrastructure from day one." },
  { icon: Users, title: "Live Cohorts", desc: "Learn alongside peers with weekly live sessions, code reviews, and group projects." },
  { icon: Trophy, title: "Industry Certificate", desc: "Earn a recognized certificate that validates your DevOps engineering skills." },
  { icon: Headphones, title: "1-on-1 Mentoring", desc: "Personal guidance from senior DevOps engineers working at top tech companies." },
  { icon: BookOpen, title: "Lifetime Access", desc: "All materials, recordings, and future updates available forever after enrollment." },
  { icon: Rocket, title: "Career Support", desc: "Resume reviews, mock interviews, and direct introductions to hiring partners." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="border-y border-border bg-card/50 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary text-glow-sm">// why us</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Built for <span className="gradient-text">Real Engineers</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

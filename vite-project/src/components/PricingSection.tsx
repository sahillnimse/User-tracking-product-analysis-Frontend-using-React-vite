import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Self-Paced",
    price: "$499",
    desc: "Learn at your own speed with full access to all materials.",
    features: ["All 20 modules", "Hands-on labs", "Community Discord", "Certificate on completion", "Lifetime access"],
    highlighted: false,
  },
  {
    name: "Pro Cohort",
    price: "$1,299",
    desc: "The full experience with live sessions and mentorship.",
    features: ["Everything in Self-Paced", "Live weekly sessions", "1-on-1 mentoring (4 sessions)", "Code reviews", "Career support & intros", "Capstone project feedback"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Train your entire team with a tailored program.",
    features: ["Everything in Pro Cohort", "Custom modules for your stack", "Dedicated Slack channel", "Team progress dashboard", "Volume discounts"],
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary text-glow-sm">// pricing</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Invest in Your <span className="gradient-text">Future</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-primary/60 bg-primary/5 box-glow-sm"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="font-mono text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-3 mb-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="ml-1 text-sm text-muted-foreground">one-time</span>}
              </div>
              <p className="mb-6 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block w-full rounded-lg py-3 text-center font-mono text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:box-glow"
                    : "border border-border text-secondary-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

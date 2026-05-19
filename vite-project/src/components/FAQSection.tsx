import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "Do I need prior DevOps experience?", a: "No. Basic Linux and command-line familiarity is helpful, but we start from fundamentals and build up progressively." },
  { q: "What tools and cloud platforms are covered?", a: "Docker, Kubernetes, Terraform, Ansible, GitHub Actions, Jenkins, AWS, GCP, Prometheus, Grafana, and more." },
  { q: "How much time should I dedicate per week?", a: "Plan for 10–15 hours per week. Self-paced students can adjust, but cohort students should attend weekly live sessions." },
  { q: "Is there a money-back guarantee?", a: "Yes! If you're not satisfied within the first 14 days, we'll refund you in full — no questions asked." },
  { q: "Will I get a certificate?", a: "Yes. Upon completing all modules and the capstone project, you'll receive a verified certificate of completion." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="border-t border-border bg-card/50 py-24">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-mono text-sm text-primary text-glow-sm">// faq</p>
          <h2 className="text-4xl font-bold md:text-5xl">
            Got <span className="gradient-text">Questions?</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card px-6">
              <AccordionTrigger className="font-semibold text-foreground hover:text-primary hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;

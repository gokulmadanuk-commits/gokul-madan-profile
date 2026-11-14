import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { person } from "@/data/profile";
import { useAnalytics } from "@/hooks/useAnalytics";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzdyrbyz";

const Connect: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const { toast } = useToast();
  const { trackClick } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Required fields", description: "Please enter your name and email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Form submission failed");
      setSubmittedName(name);
      setShowSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Error sending form:", err);
      toast({ title: "Something went wrong", description: "Please try again, or email me directly.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const field =
    "h-12 rounded-[3px] border-rule bg-card-paper text-base text-ink placeholder:text-ink-faint focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-0";

  return (
    <>
      <section id="contact" className="border-t border-rule bg-[#EFEBE1] py-20 sm:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.98] text-ink sm:text-7xl">
              Let&rsquo;s <span className="marker italic">talk.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Working on a hard problem where business, data and AI meet? I&rsquo;d like to hear about it.
            </p>
            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${person.email}`}
                onClick={() => trackClick("Contact: Email")}
                className="group flex items-center gap-2 font-display text-2xl text-ink sm:text-3xl"
              >
                <span className="link-u">{person.email}</span>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("Contact: LinkedIn")}
                className="group flex items-center gap-2 font-mono text-sm uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
              >
                {person.linkedinLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 lg:col-span-6 lg:pt-14">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={field} required />
              <Input
                aria-label="Email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                required
              />
            </div>
            <Textarea
              aria-label="Message"
              placeholder="What are you working on? (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${field} h-auto min-h-[8rem] py-3`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
            >
              {isLoading ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank you</AlertDialogTitle>
            <AlertDialogDescription>
              Hi {submittedName}, thanks for reaching out. I&rsquo;ll get back to you shortly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Connect;

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/GedeAnanda",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/gedeananda",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Email",
    url: "gdenand2020@gmail.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://instagram.com/gdenand",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "easter" | "ai_thinking">("idle");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Welcome to nanda@portfolio",
    'Type "sudo hire nanda" for a surprise.',
    'Type "chat <message>" in the message box to talk to my AI clone.',
    "---",
  ]);

  const addLine = (line: string) => {
    setTerminalLines((prev) => [...prev, line]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Easter egg
    if (message.toLowerCase().trim() === "sudo hire nanda") {
      setStatus("easter");
      addLine("$ sudo hire nanda");
      addLine("🔓 Permission granted. Redirecting to LinkedIn...");
      setTimeout(() => {
        window.open("https://linkedin.com/in/gedeananda", "_blank");
      }, 1500);
      return;
    }

    // AI Chat
    if (message.toLowerCase().trim().startsWith("chat ")) {
      const userMessage = message.trim().substring(5);
      setStatus("ai_thinking");
      addLine(`$ chat "${userMessage}"`);
      addLine("> AI processing...");
      setMessage("");

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })
        .then((res) => res.json())
        .then((data) => {
          addLine(`🤖 AI Nanda: ${data.reply}`);
          setStatus("idle");
        })
        .catch(() => {
          addLine("🤖 Error: Connection to neural network failed.");
          setStatus("idle");
        });
      return;
    }

    if (!name || !email || !message) return;

    setStatus("sending");
    addLine(`$ send-message --from "${name}" --email "${email}"`);
    addLine("> Sending...");

    // Simulate send
    setTimeout(() => {
      setStatus("sent");
      addLine("✓ Message sent successfully!");
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 md:py-32 relative"
      aria-label="Contact section"
    >
      <div className="section-container max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-[var(--accent-primary)] font-mono text-sm">
            05.
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mt-4"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            Let&apos;s Build Something
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto">
            Have a project in mind or just want to say hi? Drop me a message.
          </p>
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="terminal shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span className="ml-3 text-xs text-[var(--text-secondary)] font-mono">
                nanda@portfolio ~ %
              </span>
            </div>

            {/* Body */}
            <div className="terminal-body space-y-3">
              {/* Previous output lines */}
              {terminalLines.map((line, i) => (
                <p
                  key={i}
                  className={`text-xs font-mono ${
                    line.startsWith("✓")
                      ? "text-green-400"
                      : line.startsWith("🔓")
                      ? "text-green-400"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {line}
                </p>
              ))}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent-primary)] font-mono text-sm shrink-0">
                    $
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-sm shrink-0">
                    enter-name:
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="terminal-input"
                    placeholder="Your name"
                    aria-label="Your name"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent-primary)] font-mono text-sm shrink-0">
                    $
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-sm shrink-0">
                    enter-email:
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="terminal-input"
                    placeholder="you@example.com"
                    aria-label="Your email"
                    required
                  />
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-[var(--accent-primary)] font-mono text-sm shrink-0 mt-0.5">
                    $
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono text-sm shrink-0 mt-0.5">
                    enter-message:
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="terminal-input resize-none min-h-[60px]"
                    placeholder="Your message (or try: chat who are you?)"
                    aria-label="Your message"
                    rows={3}
                    required={!message.toLowerCase().trim().startsWith("chat ")}
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={status === "sending" || status === "ai_thinking"}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white font-mono text-sm rounded-md hover:bg-[#e05a1f] transition-colors disabled:opacity-50"
                    aria-label="Send message"
                    data-cursor="link"
                  >
                    <span className="text-white/70">$</span>
                    {status === "sending" ? (
                      <span className="flex items-center gap-1">
                        Sending
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ...
                        </motion.span>
                      </span>
                    ) : status === "ai_thinking" ? (
                      <span className="flex items-center gap-1">
                        Thinking
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ...
                        </motion.span>
                      </span>
                    ) : status === "sent" ? (
                      "✓ Sent!"
                    ) : (
                      "send-message"
                    )}
                  </button>

                  {status === "sent" && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green-400 text-xs font-mono"
                    >
                      Message sent successfully ✓
                    </motion.span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-12"
        >
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:scale-110 transition-all duration-300"
              aria-label={`Visit ${social.name}`}
              data-cursor="link"
            >
              {social.icon}
            </a>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-20 pt-8 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Designed & Built by{" "}
            <span className="text-[var(--accent-primary)]">Nanda</span> ·{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { MessageSquare, X, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const modalRef = useRef(null);

  // Close modal handler
  const handleClose = () => {
    setIsOpen(false);
    // Reset form status on close
    setCategory("");
    setEmail("");
    setMessage("");
    setStatus("idle");
    setErrorMessage("");
  };

  // Prevent background scrolling while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // Form Submit Handler using EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!category) {
      setErrorMessage("Please select a feedback category.");
      setStatus("error");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Please type a message.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    // Grab environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS environment variables are missing.");
      setErrorMessage("Feedback setup is incomplete. Please check environment variables.");
      setStatus("error");
      return;
    }

    // Parameters to send to EmailJS template
    const templateParams = {
      category: category,
      email: email.trim() || "Not provided",
      message: message.trim(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toLocaleString(),
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setStatus("success");
    } catch (err) {
      console.error("EmailJS Error:", err);
      setErrorMessage(
        err?.text || "An unexpected error occurred while sending your feedback. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <>
      {/* Floating Circular Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 p-3 md:p-4 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group flex items-center justify-center"
        aria-label="Give Feedback"
      >
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:rotate-12" />
        <span className="max-w-0 overflow-hidden md:group-hover:max-w-xs md:group-hover:ml-2 font-medium text-sm transition-all duration-300 whitespace-nowrap">
          Feedback
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        >
          {/* Modal Container */}
          <div
            ref={modalRef}
            className="relative w-full max-w-md max-h-[90vh] bg-zinc-950 border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col"
          >
            {/* Header Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 shrink-0" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-colors cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {status === "success" ? (
                /* Success State View */
                <div className="flex flex-col items-center text-center py-6 animate-fade-in">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Feedback Received!</h3>
                  <p className="text-zinc-400 text-sm mb-6 max-w-xs">
                    Thank you for helping us improve FQz Games. Your input has been sent directly to us!
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Feedback & Suggestions</h3>
                    <p className="text-xs text-zinc-400">
                      Found a bug, want a feature, or have a suggestion? Let us know below!
                    </p>
                  </div>

                  {/* Error Alert Banner */}
                  {status === "error" && errorMessage && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Error:</span> {errorMessage}
                      </div>
                    </div>
                  )}

                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-semibold text-zinc-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-white text-sm rounded-xl outline-none transition-all cursor-pointer"
                      required
                      disabled={status === "loading"}
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="Suggestion">💡 Suggestion</option>
                      <option value="Bug Report">🐛 Bug Report</option>
                      <option value="Feature Request">🚀 Feature Request</option>
                      <option value="Other">❓ Other</option>
                    </select>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-zinc-300">
                      Email Address <span className="text-zinc-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-white text-sm rounded-xl outline-none transition-all"
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-zinc-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows="4"
                      placeholder="Describe your feedback or suggestion in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-white text-sm rounded-xl outline-none transition-all resize-none"
                      required
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      disabled={status === "loading"}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

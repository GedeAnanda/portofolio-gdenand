import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StackBand from "@/components/StackBand";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Arcade from "@/components/Arcade";
import Skills from "@/components/Skills";
import Journey from "@/components/Journey";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  // The question box only renders when the chat endpoint can actually answer.
  const aiEnabled = Boolean(process.env.GEMINI_API_KEY);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <StackBand />
        <About />
        <Projects />
        <Arcade />
        <Skills />
        <Journey />
        <Contact aiEnabled={aiEnabled} />
      </main>
      <Footer />
    </>
  );
}

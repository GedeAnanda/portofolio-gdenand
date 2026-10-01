import SkillKeys from "./SkillKeys";

export default function Skills() {
  return (
    <section id="skills" className="layer band" style={{ ["--band" as string]: "var(--pop-cyan)" }}>
      <div className="container-x py-28 md:py-40">
      <h2 className="t-section max-w-[12ch]">
        The{" "}
        <span className="mark" style={{ ["--mark" as string]: "var(--pop-cyan)" }}>
          toolkit
        </span>
      </h2>
      <p className="t-lead mt-6">Every key is a tool I ship with. Press one to see where it was used.</p>
      <div className="mt-12 md:mt-16">
        <SkillKeys />
      </div>
      </div>
    </section>
  );
}

import SkillKeys from "./SkillKeys";

export default function Skills() {
  return (
    <section id="skills" className="layer container-x py-28 md:py-40">
      <h2 className="t-section max-w-[12ch]">The toolkit</h2>
      <p className="t-lead mt-6">Every key is a tool I ship with. Press one to see where it was used.</p>
      <div className="mt-12 md:mt-16">
        <SkillKeys />
      </div>
    </section>
  );
}

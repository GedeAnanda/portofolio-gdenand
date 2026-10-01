import Image from "next/image";
import { projectById, projectTint, type ProjectId } from "@/lib/projects";
import PhoneFrame from "./mockups/PhoneFrame";
import { ProjectDescription, ProjectHeader, ProjectImpact, ProjectStack } from "./projects/ProjectMeta";
import ProjectTracker from "./projects/ProjectTracker";
import FirStepDemo from "./projects/FirStepDemo";
import { FotoKitaBrowser, FotoKitaPrinter } from "./projects/FotoKitaDemo";
import LensLiftPrototype from "./projects/LensLiftPrototype";
import OlahinConsole from "./projects/OlahinConsole";
import SultanDemo from "./projects/SultanDemo";
import BeatTheModel from "./projects/BeatTheModel";
import { ConfusionMatrix, ModelTiles, NegativeShare } from "./projects/GemastikCharts";
import Reveal from "./ui/Reveal";
import llLogin from "../../public/work/lenslift/login.webp";
import llGoal from "../../public/work/lenslift/goal.webp";
import llTargets from "../../public/work/lenslift/targets.webp";
import llAllSet from "../../public/work/lenslift/all-set.webp";
import llProfile from "../../public/work/lenslift/profile.webp";
import llScan from "../../public/work/lenslift/scan.webp";
import llResult from "../../public/work/lenslift/result.webp";
import llSession from "../../public/work/lenslift/session.webp";
import llProgress from "../../public/work/lenslift/progress.webp";
import llDone from "../../public/work/lenslift/done.webp";
import wordcloud from "../../public/work/gemastik/wordcloud.webp";

const lensliftScreens = [
  { src: llLogin, alt: "Sign in" },
  { src: llGoal, alt: "Choosing a main goal" },
  { src: llTargets, alt: "Daily calorie and macro targets" },
  { src: llAllSet, alt: "Onboarding complete" },
  { src: llScan, alt: "Scan food with a photo of nasi goreng" },
  { src: llResult, alt: "AI nutrition result, 650 kcal" },
  { src: llSession, alt: "Active workout session logging sets" },
  { src: llDone, alt: "Workout done summary" },
  { src: llProgress, alt: "Body weight progress" },
  { src: llProfile, alt: "Profile with daily targets" },
];

/** Sets a project's colour for the stage and shadows inside it. */
const tint = (id: ProjectId) => ({ ["--tint" as string]: projectTint[id] });

export default function Projects() {
  const firstep = projectById("firstep");
  const fotokita = projectById("fotokita");
  const lenslift = projectById("lenslift");
  const olahin = projectById("olahin");
  const sultan = projectById("sultan");
  const gemastik = projectById("gemastik");

  return (
    <section id="projects" className="layer pb-12 pt-28 md:pt-40">
      <ProjectTracker />
      <div className="container-x">
        <h2 className="t-section max-w-[13ch]">
          Projects you can{" "}
          <span className="mark" style={{ ["--mark" as string]: "var(--pop-lime)" }}>
            play
          </span>{" "}
          with
        </h2>
        <p className="t-lead mt-6">
          Six things I built. Each one has a working piece right here: live sites, a prototype, an API console and a
          game.
        </p>
      </div>

      {/* FirStep: wide stage, details underneath */}
      <article id="project-firstep" data-project="firstep" className="container-x mt-24 md:mt-32">
        <ProjectHeader project={firstep} />
        <Reveal className="stage mt-10 p-4 md:mt-12 md:p-8" style={tint("firstep")}>
          <FirStepDemo />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <ProjectDescription project={firstep} className="md:col-span-5" />
          <ProjectImpact project={firstep} className="md:col-span-4" />
          <ProjectStack project={firstep} className="md:col-span-3" />
        </div>
      </article>

      {/* fotokita.space: the whole chapter sits on its pink stage */}
      <article id="project-fotokita" data-project="fotokita" className="container-x mt-32 md:mt-48">
        <Reveal className="stage grid grid-cols-1 gap-10 p-5 md:p-10 lg:grid-cols-12 lg:gap-10" style={tint("fotokita")}>
          <div className="flex min-w-0 flex-col gap-7 lg:col-span-4">
            <ProjectHeader project={fotokita} />
            <ProjectDescription project={fotokita} />
            <FotoKitaPrinter />
          </div>
          <div className="flex min-w-0 flex-col gap-10 lg:col-span-8">
            <FotoKitaBrowser />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ProjectImpact project={fotokita} />
              <ProjectStack project={fotokita} />
            </div>
          </div>
        </Reveal>
      </article>

      {/* LensLift: phone on the left, story and real screens on the right */}
      <article
        id="project-lenslift"
        data-project="lenslift"
        className="container-x mt-32 grid grid-cols-1 gap-14 md:mt-48 lg:grid-cols-12 lg:gap-10"
      >
        <Reveal className="stage self-start px-4 py-8 md:p-10 lg:col-span-5" style={tint("lenslift")}>
          <LensLiftPrototype />
        </Reveal>
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-7 lg:pt-6">
          <ProjectHeader project={lenslift} />
          <ProjectDescription project={lenslift} />
          <ProjectImpact project={lenslift} />
          <ProjectStack project={lenslift} />
          <div>
            <p className="text-sm font-medium">Screens from the real app</p>
            <ul
              className="mt-4 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]"
              data-lenis-prevent
              aria-label="LensLift screenshots"
            >
              {lensliftScreens.map((s) => (
                <li key={s.alt} className="w-[104px] flex-none">
                  <PhoneFrame tone="dark">
                    <Image src={s.src} alt={s.alt} fill sizes="110px" className="object-cover object-top" />
                  </PhoneFrame>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {/* Olahin Dong: full-width console */}
      <article id="project-olahin" data-project="olahin" className="container-x mt-32 md:mt-48">
        <ProjectHeader project={olahin} />
        <ProjectDescription project={olahin} className="mt-6" />
        <Reveal className="mt-10 md:mt-12" style={{ ["--panel-shadow" as string]: projectTint.olahin }}>
          <OlahinConsole />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <ProjectImpact project={olahin} className="md:col-span-6" />
          <ProjectStack project={olahin} className="md:col-span-6" />
        </div>
      </article>

      {/* Smoothies Sultan: story left, live browser right */}
      <article
        id="project-sultan"
        data-project="sultan"
        className="container-x mt-32 grid grid-cols-1 gap-12 md:mt-48 lg:grid-cols-12 lg:gap-10"
      >
        <div className="flex flex-col gap-8 lg:col-span-4">
          <ProjectHeader project={sultan} />
          <ProjectDescription project={sultan} />
          <ProjectImpact project={sultan} />
          <ProjectStack project={sultan} />
        </div>
        <Reveal className="stage self-start p-4 md:p-7 lg:col-span-8" style={tint("sultan")}>
          <SultanDemo />
        </Reveal>
      </article>

      {/* GEMASTIK: a bento of the game and the paper's numbers */}
      <article id="project-gemastik" data-project="gemastik" className="container-x mt-32 md:mt-48">
        <ProjectHeader project={gemastik} />
        <ProjectDescription project={gemastik} className="mt-6" />
        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 lg:grid-cols-12">
          <div
            className="panel lg:col-span-7 lg:row-span-2"
            style={{
              ["--panel-shadow" as string]: "var(--pop-violet)",
              background: "color-mix(in oklab, var(--pop-violet) 12%, var(--raised))",
            }}
          >
            <BeatTheModel />
          </div>
          <figure className="panel overflow-hidden lg:col-span-5" style={{ ["--panel-shadow" as string]: "var(--pop-pink)" }}>
            <Image
              src={wordcloud}
              alt="Word clouds of complaints per app, dominated by aplikasi, gagal, login, verifikasi, daftar, barcode and bayar"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="t-label px-5 py-4 md:px-7">
              Most frequent words in complaints, one cloud per app. From the team&apos;s notebook.
            </figcaption>
          </figure>
          <div className="panel p-5 md:p-7 lg:col-span-5" style={{ ["--panel-shadow" as string]: "var(--pop-cyan)" }}>
            <ConfusionMatrix />
          </div>
          <div className="panel p-5 md:p-7 lg:col-span-6" style={{ ["--panel-shadow" as string]: "var(--pop-yellow)" }}>
            <ModelTiles />
          </div>
          <div className="panel p-5 md:p-7 lg:col-span-6" style={{ ["--panel-shadow" as string]: "var(--pop-orange)" }}>
            <NegativeShare />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <ProjectImpact project={gemastik} className="md:col-span-6" />
          <ProjectStack project={gemastik} className="md:col-span-6" />
        </div>
      </article>
    </section>
  );
}

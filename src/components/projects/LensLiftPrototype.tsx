"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowClockwise, Barbell, CaretLeft, Check, Fire, Heart, Minus, Plus, Sparkle } from "@phosphor-icons/react";
import PhoneFrame from "../mockups/PhoneFrame";
import { unlock } from "@/lib/achievements";
import food from "../../../public/work/lenslift/food.webp";

/*
 * A browser rebuild of LensLift's onboarding and food-scan flow. Copy, colours
 * and the target formula are taken from the SwiftUI source (OnboardingViewModel,
 * Constants.swift). The meal result is the one the real app returned for this photo.
 */

const C = {
  green: "#C6FF00",
  surface: "#1C1C1E",
  surface2: "#2C2C2E",
  text: "#8E8E93",
  muted: "#636366",
  protein: "#FF6B6B",
  carbs: "#FFD93D",
  fat: "#6BCB77",
};

type Goal = "lose" | "build" | "maintain";
type Step = "welcome" | "goal" | "body" | "targets" | "nutrition" | "scan" | "result";

const goals: { id: Goal; title: string; sub: string; icon: typeof Fire }[] = [
  { id: "lose", title: "Lose Fat", sub: "Burn calories & shed weight", icon: Fire },
  { id: "build", title: "Build Muscle", sub: "Gain strength & mass", icon: Barbell },
  { id: "maintain", title: "Maintain", sub: "Stay consistent & healthy", icon: Heart },
];

const meal = {
  name: "Nasi Goreng dengan Telur Mata Sapi dan Roti Tawar",
  calories: 650,
  protein: 18,
  carbs: 75,
  fat: 28,
};

/** Port of OnboardingViewModel.calculateTargets(). */
function calculateTargets(goal: Goal, age: number, height: number, weight: number) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const tdee = bmr * 1.55;
  const calories = goal === "lose" ? Math.max(1200, tdee - 500) : goal === "build" ? tdee + 300 : tdee;
  const protein = weight * 2;
  const fat = (calories * 0.25) / 9;
  const carbs = Math.max(50, (calories - protein * 4 - fat * 9) / 4);
  return { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
}

const kcal = (m: { protein: number; carbs: number; fat: number }) =>
  Math.round((m.protein * 4 + m.carbs * 4 + m.fat * 9) / 10) * 10;

const fmt = (n: number) => n.toLocaleString("id-ID");

/* ---------------------------------------------------------------- */

function GreenButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[12.5cqw] w-full items-center justify-center gap-[2cqw] rounded-[3.6cqw] text-[4.1cqw] font-bold text-black transition-[opacity,transform] active:scale-[0.98] disabled:opacity-35"
      style={{ background: C.green }}
    >
      {children}
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="-ml-[2cqw] grid size-[10cqw] place-items-center rounded-full text-white/80 hover:text-white"
    >
      <CaretLeft style={{ width: "5cqw", height: "5cqw" }} weight="bold" aria-hidden />
    </button>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h4 className="whitespace-pre-line text-[8.6cqw] font-black leading-[1.08] tracking-[-0.02em] text-white" style={{ fontFamily: "ui-rounded, system-ui, sans-serif" }}>
      {children}
    </h4>
  );
}

function Stepper({ label, unit, value, min, max, onChange }: { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[3.6cqw] px-[4cqw] py-[3cqw]" style={{ background: C.surface }}>
      <div>
        <p className="text-[3.2cqw]" style={{ color: C.text }}>
          {label}
        </p>
        <p className="text-[5.4cqw] font-bold text-white">
          {value}
          <span className="ml-[1cqw] text-[3.2cqw] font-medium" style={{ color: C.text }}>
            {unit}
          </span>
        </p>
      </div>
      <div className="flex gap-[2cqw]">
        {[
          { d: -1, Icon: Minus, label: `Less ${label.toLowerCase()}` },
          { d: 1, Icon: Plus, label: `More ${label.toLowerCase()}` },
        ].map(({ d, Icon, label: l }) => (
          <button
            key={d}
            type="button"
            aria-label={l}
            onClick={() => onChange(Math.min(max, Math.max(min, value + d)))}
            className="grid size-[9cqw] place-items-center rounded-full text-white active:scale-95"
            style={{ background: C.surface2 }}
          >
            <Icon style={{ width: "4cqw", height: "4cqw" }} weight="bold" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

function MacroSlider({ label, color, value, min, max, onChange }: { label: string; color: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-[3.4cqw]">
        <span style={{ color: C.text }}>{label}</span>
        <span className="font-semibold" style={{ color }}>
          {value}g
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-[1.6cqw] w-full"
        style={{ accentColor: color }}
      />
    </label>
  );
}

function Ring({ value, target }: { value: number; target: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, value / target);
  return (
    <svg viewBox="0 0 100 100" className="size-[34cqw] -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke={C.surface2} strokeWidth="9" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={C.green}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- */

export default function LensLiftPrototype() {
  const [step, setStep] = useState<Step>("welcome");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [body, setBody] = useState({ age: 19, height: 172, weight: 67 });
  const [macros, setMacros] = useState({ protein: 134, carbs: 346, fat: 71 });
  const [logged, setLogged] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!analyzing) return;
    const id = window.setTimeout(() => {
      setAnalyzing(false);
      setStep("result");
    }, 1900);
    return () => window.clearTimeout(id);
  }, [analyzing]);

  const target = kcal(macros);
  const eaten = logged ? meal : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const restart = () => {
    setStep("welcome");
    setGoal(null);
    setLogged(false);
    setAnalyzing(false);
  };

  let screen: ReactNode;
  switch (step) {
    case "welcome":
      screen = (
        <div className="flex h-full flex-col items-center px-[7cqw] pb-[9cqw] text-center">
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-[8cqw] font-light tracking-[0.42em] text-white">LENSLIFT</p>
            <p className="mt-[2cqw] text-[2.6cqw] tracking-[0.3em]" style={{ color: C.muted }}>
              YOUR GYM. TRACKED.
            </p>
            <p className="mt-[10cqw] text-[5cqw] font-semibold leading-snug text-white">
              Your AI-powered
              <br />
              gym companion.
            </p>
          </div>
          <GreenButton onClick={() => setStep("goal")}>Get Started</GreenButton>
        </div>
      );
      break;

    case "goal":
      screen = (
        <div className="flex h-full flex-col px-[6cqw] pb-[9cqw]">
          <Back onClick={() => setStep("welcome")} />
          <div className="flex flex-1 flex-col justify-center">
            <Title>{"What's your\nmain goal?"}</Title>
            <div className="mt-[7cqw] flex flex-col gap-[3cqw]" role="radiogroup" aria-label="Main goal">
              {goals.map((g) => {
                const on = goal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setGoal(g.id)}
                    className="flex items-center gap-[3.4cqw] rounded-[3.6cqw] px-[3.6cqw] py-[3.2cqw] text-left transition-colors"
                    style={{ background: on ? "rgb(198 255 0 / 0.08)" : C.surface, boxShadow: on ? `inset 0 0 0 1.5px ${C.green}` : "none" }}
                  >
                    <span
                      className="grid size-[9cqw] flex-none place-items-center rounded-full"
                      style={{ background: on ? C.green : C.surface2, color: on ? "#000" : "#fff" }}
                    >
                      <g.icon style={{ width: "4.4cqw", height: "4.4cqw" }} weight="fill" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[3.8cqw] font-semibold text-white">{g.title}</span>
                      <span className="block text-[2.9cqw]" style={{ color: C.text }}>
                        {g.sub}
                      </span>
                    </span>
                    {on && <Check style={{ width: "4.4cqw", height: "4.4cqw", color: C.green }} weight="bold" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
          <GreenButton onClick={() => setStep("body")} disabled={!goal}>
            Continue
          </GreenButton>
        </div>
      );
      break;

    case "body":
      screen = (
        <div className="flex h-full flex-col px-[6cqw] pb-[9cqw]">
          <Back onClick={() => setStep("goal")} />
          <div className="flex flex-1 flex-col justify-center">
            <Title>Body stats</Title>
            <p className="mt-[2cqw] text-[3.3cqw]" style={{ color: C.text }}>
              Used to calculate your daily calorie needs.
            </p>
            <div className="mt-[6cqw] flex flex-col gap-[2.6cqw]">
              <Stepper label="Age" unit="yrs" value={body.age} min={14} max={80} onChange={(age) => setBody((b) => ({ ...b, age }))} />
              <Stepper label="Height" unit="cm" value={body.height} min={140} max={210} onChange={(height) => setBody((b) => ({ ...b, height }))} />
              <Stepper label="Weight" unit="kg" value={body.weight} min={40} max={150} onChange={(weight) => setBody((b) => ({ ...b, weight }))} />
            </div>
          </div>
          <GreenButton
            onClick={() => {
              setMacros(calculateTargets(goal ?? "maintain", body.age, body.height, body.weight));
              setStep("targets");
            }}
          >
            Calculate My Targets
          </GreenButton>
        </div>
      );
      break;

    case "targets":
      screen = (
        <div className="flex h-full flex-col px-[6cqw] pb-[9cqw]">
          <Back onClick={() => setStep("body")} />
          <Title>{"Your daily\ntargets"}</Title>
          <p className="mt-[2cqw] text-[3.1cqw]" style={{ color: C.text }}>
            Calculated based on your stats & goal. Adjust anytime.
          </p>
          <div className="mt-[5cqw] rounded-[3.6cqw] p-[4cqw]" style={{ background: C.surface }}>
            <div className="flex items-baseline justify-between">
              <span className="text-[3.4cqw]" style={{ color: C.text }}>
                Calories
              </span>
              <span className="text-[4.6cqw] font-bold" style={{ color: C.green }}>
                {fmt(target)} kcal
              </span>
            </div>
          </div>
          <div className="mt-[3cqw] flex flex-col gap-[3.4cqw] rounded-[3.6cqw] p-[4cqw]" style={{ background: C.surface }}>
            <MacroSlider label="Protein" color={C.protein} value={macros.protein} min={40} max={260} onChange={(protein) => setMacros((m) => ({ ...m, protein }))} />
            <MacroSlider label="Carbs" color={C.carbs} value={macros.carbs} min={50} max={500} onChange={(carbs) => setMacros((m) => ({ ...m, carbs }))} />
            <MacroSlider label="Fat" color={C.fat} value={macros.fat} min={30} max={160} onChange={(fat) => setMacros((m) => ({ ...m, fat }))} />
          </div>
          <div className="flex-1" />
          <GreenButton onClick={() => setStep("nutrition")}>Looks Good!</GreenButton>
        </div>
      );
      break;

    case "nutrition":
      screen = (
        <div className="flex h-full flex-col px-[6cqw] pb-[9cqw] pt-[3cqw]">
          <p className="text-[7cqw] font-black text-white" style={{ fontFamily: "ui-rounded, system-ui, sans-serif" }}>
            Nutrition
          </p>
          <div className="mt-[4cqw] flex items-center gap-[5cqw] rounded-[4cqw] p-[4cqw]" style={{ background: C.surface }}>
            <div className="relative grid place-items-center">
              <Ring value={eaten.calories} target={target} />
              <div className="absolute text-center">
                <p className="text-[6.4cqw] font-bold leading-none text-white">{eaten.calories}</p>
                <p className="mt-[1cqw] text-[2.6cqw]" style={{ color: C.text }}>
                  / {fmt(target)} kcal
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[2.4cqw] text-[3cqw]">
              {(
                [
                  ["Protein", eaten.protein, macros.protein, C.protein],
                  ["Carbs", eaten.carbs, macros.carbs, C.carbs],
                  ["Fat", eaten.fat, macros.fat, C.fat],
                ] as const
              ).map(([label, v, t, color]) => (
                <div key={label}>
                  <p className="flex justify-between">
                    <span style={{ color: C.text }}>{label}</span>
                    <span className="text-white">
                      {v}/{t}g
                    </span>
                  </p>
                  <div className="mt-[1cqw] h-[1.2cqw] overflow-hidden rounded-full" style={{ background: C.surface2 }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-1000"
                      style={{ width: `${Math.min(100, (v / t) * 100)}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-[3cqw]">
            <GreenButton onClick={() => setStep("scan")}>Scan Food</GreenButton>
          </div>
          <p className="mt-[6cqw] flex justify-between text-[2.7cqw] tracking-[0.14em]" style={{ color: C.muted }}>
            <span>TODAY&apos;S LOG</span>
            <span>{logged ? "1 item" : "0 items"}</span>
          </p>
          {logged ? (
            <div className="fade-in mt-[2.4cqw] flex items-center gap-[3cqw] rounded-[3.6cqw] p-[3.4cqw]" style={{ background: C.surface }}>
              <Image src={food} alt="" className="size-[11cqw] rounded-[2.4cqw] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[3.3cqw] font-semibold text-white">{meal.name}</p>
                <p className="text-[2.8cqw]" style={{ color: C.text }}>
                  {meal.protein}g protein
                </p>
              </div>
              <p className="text-[3.3cqw] font-semibold text-white">{meal.calories} kcal</p>
            </div>
          ) : (
            <p className="mt-[5cqw] text-center text-[3.2cqw]" style={{ color: C.muted }}>
              No food logged yet
            </p>
          )}
        </div>
      );
      break;

    case "scan":
      screen = (
        <div className="relative flex h-full flex-col px-[6cqw] pb-[9cqw]">
          <button type="button" onClick={() => setStep("nutrition")} className="flex w-fit items-center gap-[1cqw] text-[3.4cqw]" style={{ color: C.green }}>
            <CaretLeft style={{ width: "3.6cqw", height: "3.6cqw" }} weight="bold" aria-hidden />
            Back
          </button>
          <p className="mt-[3cqw] text-[6.6cqw] font-black text-white" style={{ fontFamily: "ui-rounded, system-ui, sans-serif" }}>
            Scan Food
          </p>
          <p className="text-[3cqw]" style={{ color: C.text }}>
            Take a photo of your meal for instant nutrition breakdown.
          </p>
          <div className="relative mt-[5cqw] overflow-hidden rounded-[4cqw]">
            <Image src={food} alt="A plate of nasi goreng with a fried egg and crackers" sizes="300px" className="aspect-[4/3] w-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 bg-black/30">
                <div className="ll-scan absolute inset-0" />
              </div>
            )}
          </div>
          <div className="mt-[5cqw]">
            <GreenButton onClick={() => setAnalyzing(true)} disabled={analyzing}>
              <Sparkle style={{ width: "4.4cqw", height: "4.4cqw" }} weight="fill" aria-hidden />
              {analyzing ? "Analyzing..." : "Analyze with AI"}
            </GreenButton>
          </div>
          {analyzing && (
            <p className="fade-in mt-[4cqw] text-center text-[3.2cqw]" style={{ color: C.text }} aria-live="polite">
              AI is identifying calories and macros
            </p>
          )}
        </div>
      );
      break;

    case "result":
      screen = (
        <div className="flex h-full flex-col px-[6cqw] pb-[9cqw]">
          <div className="flex items-center gap-[2cqw] rounded-[3cqw] px-[3cqw] py-[2.4cqw] text-[3cqw] text-white" style={{ background: "rgb(198 255 0 / 0.1)" }}>
            <span className="grid size-[5cqw] place-items-center rounded-full text-black" style={{ background: C.green }}>
              <Check style={{ width: "3cqw", height: "3cqw" }} weight="bold" aria-hidden />
            </span>
            Food analyzed successfully!
          </div>
          <div className="mt-[3cqw] rounded-[3.6cqw] p-[4cqw]" style={{ background: C.surface }}>
            <p className="text-[4cqw] font-semibold leading-snug text-white">{meal.name}</p>
            <p className="mt-[2cqw] flex items-end justify-between">
              <span>
                <span className="text-[10cqw] font-bold leading-none" style={{ color: C.green }}>
                  {meal.calories}
                </span>
                <span className="ml-[1.4cqw] text-[3.4cqw]" style={{ color: C.text }}>
                  kcal
                </span>
              </span>
              <span className="rounded-[1.6cqw] px-[2cqw] py-[0.6cqw] text-[2.6cqw] font-bold text-black" style={{ background: C.green }}>
                AI
              </span>
            </p>
          </div>
          <p className="mt-[4cqw] text-[2.6cqw] tracking-[0.14em]" style={{ color: C.muted }}>
            NUTRITION BREAKDOWN
          </p>
          <div className="mt-[2cqw] flex flex-col gap-[2cqw]">
            {(
              [
                ["Protein", meal.protein, C.protein],
                ["Carbohydrates", meal.carbs, C.carbs],
                ["Fat", meal.fat, C.fat],
              ] as const
            ).map(([label, g, color]) => (
              <div key={label} className="flex items-center gap-[3cqw] rounded-[3cqw] p-[2.6cqw]" style={{ background: C.surface }}>
                <span className="grid size-[8cqw] place-items-center rounded-[2cqw] text-[3cqw] font-bold" style={{ background: `${color}22`, color }}>
                  {g}
                </span>
                <span className="flex-1 text-[3.3cqw] text-white">{label}</span>
                <span className="text-[3.3cqw] font-semibold" style={{ color }}>
                  {g.toFixed(1)}g
                </span>
              </div>
            ))}
          </div>
          <p className="mt-[4cqw] text-[2.6cqw] tracking-[0.14em]" style={{ color: C.muted }}>
            TODAY&apos;S TOTALS
          </p>
          <div className="mt-[2cqw] flex flex-col gap-[1.6cqw] rounded-[3cqw] p-[3cqw] text-[2.9cqw]" style={{ background: C.surface }}>
            {(
              [
                ["Calories", eaten.calories, target, "kcal"],
                ["Protein", eaten.protein, macros.protein, "g"],
                ["Carbs", eaten.carbs, macros.carbs, "g"],
                ["Fat", eaten.fat, macros.fat, "g"],
              ] as const
            ).map(([label, v, t, unit]) => (
              <p key={label} className="flex justify-between">
                <span style={{ color: C.text }}>{label}</span>
                <span className="text-white">
                  {fmt(v)} / {fmt(t)} {unit}
                </span>
              </p>
            ))}
          </div>
          <div className="min-h-[5cqw] flex-1" />
          <GreenButton
            onClick={() => {
              setLogged(true);
              setStep("nutrition");
              unlock("macro");
            }}
          >
            Add to My Log
          </GreenButton>
          <button type="button" onClick={() => setStep("nutrition")} className="mt-[2.6cqw] text-center text-[3.1cqw]" style={{ color: C.text }}>
            Just checking, don&apos;t add
          </button>
        </div>
      );
      break;
  }

  return (
    <div>
      <PhoneFrame tone="dark" className="mx-auto w-full max-w-[320px]">
        <div key={step} className="ll-in absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none]" data-lenis-prevent>
          {screen}
        </div>
      </PhoneFrame>
      <div className="mx-auto mt-5 flex max-w-[320px] items-center justify-between gap-4">
        <p className="t-label">Rebuilt for the web from the SwiftUI flow. Tap through it.</p>
        <button type="button" className="btn btn-quiet btn-sm flex-none" onClick={restart} aria-label="Restart the prototype">
          <ArrowClockwise size={16} weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}

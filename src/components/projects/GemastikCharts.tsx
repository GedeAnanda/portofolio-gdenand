"use client";

import { useState } from "react";
import { confusion, models, negativeShare, type Label } from "@/lib/sentiment";

const labels: Label[] = ["neg", "pos"];
const word: Record<Label, string> = { neg: "Negatif", pos: "Positif" };
const total = confusion.neg.neg + confusion.neg.pos + confusion.pos.neg + confusion.pos.pos;
const correct = confusion.neg.neg + confusion.pos.pos;
const max = Math.max(confusion.neg.neg, confusion.pos.pos);

/** 2x2 heatmap on one sequential hue (the accent), counts printed in every cell. */
export function ConfusionMatrix() {
  return (
    <figure>
      <figcaption>
        <p className="font-semibold">SVM on 775 test reviews</p>
        <p className="mt-1 text-sm text-muted">
          {correct} right, {total - correct} wrong.
        </p>
      </figcaption>
      <table className="mt-5 w-full border-separate border-spacing-[3px] font-mono text-[0.75rem]">
        <caption className="sr-only">Confusion matrix: rows are the actual label, columns the predicted label.</caption>
        <thead>
          <tr>
            <td />
            {labels.map((p) => (
              <th key={p} scope="col" className="pb-1 text-center font-normal text-muted">
                Predicted {word[p].toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((a) => (
            <tr key={a}>
              <th scope="row" className="pr-2 text-left font-normal text-muted">
                Actual {word[a].toLowerCase()}
              </th>
              {labels.map((p) => {
                const v = confusion[a][p];
                const t = v / max;
                const strong = t > 0.5;
                return (
                  <td
                    key={p}
                    title={`Actual ${word[a].toLowerCase()}, predicted ${word[p].toLowerCase()}: ${v}`}
                    className={`h-16 rounded-[8px] border-2 border-edge text-center text-[1rem] font-semibold ${strong ? "text-[#17141f]" : "text-ink"}`}
                    style={{ background: `color-mix(in oklab, var(--pop-violet) ${Math.round(12 + t * 88)}%, var(--raised))` }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Three close accuracies read best as numbers; the winner carries the accent. */
export function ModelTiles() {
  return (
    <figure>
      <figcaption>
        <p className="font-semibold">Same TF-IDF features, three classifiers</p>
      </figcaption>
      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {models.map((m, i) => (
          <div key={m.name} className={`flex items-baseline justify-between border-t-2 pt-3 sm:block ${i === 0 ? "border-pop-violet" : "border-line"}`}>
            <dt className="t-label">{m.name}</dt>
            <dd className={`text-[clamp(1.4rem,2.2vw,1.9rem)] sm:mt-1 font-bold tracking-[-0.03em] ${i === 0 ? "text-ink" : "text-muted"}`}>
              {m.accuracy.toFixed(2)}%
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/** Negative share per app: one series, M-Pajak emphasised, the rest in neutral ink. */
export function NegativeShare() {
  const [active, setActive] = useState<string | null>(null);
  const focus = negativeShare.find((r) => r.app === active);
  return (
    <figure>
      <figcaption>
        <p className="font-semibold">Share of negative reviews</p>
        <p className="mt-1 min-h-5 text-sm text-muted" aria-live="polite">
          {focus
            ? `${focus.app}: ${focus.negative}% negatif, ${(100 - focus.negative).toFixed(1)}% positif.`
            : "M-Pajak stands out. The paper ties it to complex tax reporting and login problems."}
        </p>
      </figcaption>
      <ul className="mt-5 flex flex-col gap-3">
        {negativeShare.map((r, i) => (
          <li
            key={r.app}
            tabIndex={0}
            onPointerEnter={() => setActive(r.app)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(r.app)}
            onBlur={() => setActive(null)}
            className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-md outline-offset-2"
          >
            <span className="text-sm">{r.app}</span>
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 rounded-r-[4px] border-2 border-l-0 border-edge transition-opacity"
                style={{
                  width: `${r.negative * 0.82}%`,
                  background: i === 0 ? "var(--pop-pink)" : "color-mix(in oklab, var(--ink) 30%, var(--raised))",
                  opacity: active && active !== r.app ? 0.45 : 1,
                }}
              />
              <span className="font-mono text-[0.75rem] text-muted">{r.negative}%</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

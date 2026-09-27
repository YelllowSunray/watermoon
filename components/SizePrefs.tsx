"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store";
import type { Department, Gender } from "@/lib/products";
import { SPLASH_FIELD, streetSplash } from "@/lib/looks-data";
import { sizeKey, type SizeKey } from "@/lib/storage";

const ROOMS: Array<{
  gender: Gender;
  department: Department;
  subcategory?: string;
  world: string;
  room: string;
}> = [
  { gender: "women", department: "clothing", world: "Women", room: "Cloth" },
  { gender: "women", department: "clothing", subcategory: "Jeans", world: "Women", room: "Trousers" },
  { gender: "women", department: "shoes", world: "Women", room: "Shoes" },
  { gender: "men", department: "clothing", world: "Men", room: "Cloth" },
  { gender: "men", department: "clothing", subcategory: "Jeans", world: "Men", room: "Trousers" },
  { gender: "men", department: "shoes", world: "Men", room: "Shoes" },
];

function RoomField({
  gender,
  department,
  subcategory,
  world,
  room,
  options,
  splash,
}: {
  gender: Gender;
  department: Department;
  subcategory?: string;
  world: string;
  room: string;
  options: string[];
  splash: string;
}) {
  const { sizeFor, setSizePref } = useStore();
  const saved = sizeFor(gender, department, subcategory) ?? "";
  const [draft, setDraft] = useState(saved);
  const dirty = useRef(false);
  const key = sizeKey(gender, department, subcategory);
  const id = `size-${key ?? `${gender}-${department}`}`;

  useEffect(() => {
    if (!dirty.current) setDraft(saved);
  }, [saved]);

  function keep(value: string) {
    dirty.current = false;
    setDraft(value);
    setSizePref(gender, department, value, subcategory);
  }

  return (
    <li className={`${splash} flex h-full flex-col justify-end px-5 py-10 md:min-h-[36vh] md:px-10`}>
      <label htmlFor={id} className="eyebrow">
        {world} · {room}
      </label>
      <p className="display mt-3 text-3xl md:text-5xl">{room}</p>
      {options.length > 0 ? (
        <ul className="mt-6 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {options.map((entry) => (
            <li key={entry}>
              <button
                type="button"
                className={`choice min-w-10 ${saved === entry ? "choice-on" : ""}`}
                onClick={() => keep(saved === entry ? "" : entry)}
              >
                {entry}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={id}
        value={draft}
        placeholder="—"
        autoComplete="off"
        className="mt-6 w-full border-b border-current bg-transparent py-2 text-2xl outline-none placeholder:opacity-35"
        onChange={(event) => {
          dirty.current = true;
          setDraft(event.target.value);
        }}
        onBlur={() => {
          if (!dirty.current) return;
          dirty.current = false;
          setSizePref(gender, department, draft, subcategory);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </li>
  );
}

export function SizePrefs() {
  const [options, setOptions] = useState<Partial<Record<SizeKey, string[]>>>({});

  useEffect(() => {
    fetch("/api/size-options")
      .then((response) => response.json())
      .then((data: { options?: Partial<Record<SizeKey, string[]>> }) => {
        setOptions(data.options ?? {});
      })
      .catch(() => setOptions({}));
  }, []);

  return (
    <ul className="grid md:grid-cols-2">
      {ROOMS.map((entry, index) => {
        const key = sizeKey(entry.gender, entry.department, entry.subcategory);
        return (
          <RoomField
            key={key ?? `${entry.gender}-${entry.room}`}
            {...entry}
            splash={SPLASH_FIELD[streetSplash(index, entry.gender === "men" ? 3 : 0)]}
            options={key ? (options[key] ?? []) : []}
          />
        );
      })}
    </ul>
  );
}

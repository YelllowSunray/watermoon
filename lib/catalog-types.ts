import type { Department, Gender } from "@/lib/products";

export type Brand = {
  name: string;
  slug: string;
  count: number;
  image?: string;
};

export type NavCategory = {
  slug: string;
  name: string;
  count: number;
};

export type NavDepartment = {
  slug: Department;
  name: string;
  count: number;
  image?: string;
  categories: NavCategory[];
};

export type GenderNav = {
  gender: Gender;
  href: string;
  label: string;
  departments: NavDepartment[];
};

export type NavLook = {
  slug: string;
  title: string;
  gender: Gender;
  splash: "cobalt" | "vermillion" | "chartreuse" | "violet" | "orange" | "ink";
  image?: string;
};

import resumeData from "./resume.json";

type Link = {
  label: string;
  href: string;
};

type SkillGroup = {
  label: string;
  value: string;
};

type Experience = {
  organization: string;
  role: string;
  dates: string;
  location: string;
  bullets: readonly string[];
};

type Education = {
  institution: string;
  program: string;
  dates: string;
  honors: string | null;
};

type Project = {
  name: string;
  status: string;
  technologies: string;
  bullets: readonly string[];
  links: readonly Link[];
};

type Resume = {
  name: string;
  title: string;
  location: string;
  phone: Link;
  email: Link;
  availability: string;
  profiles: readonly Link[];
  summary: string;
  skills: readonly SkillGroup[];
  experience: readonly Experience[];
  education: readonly Education[];
  certifications: readonly string[];
  projects: readonly Project[];
};

export const resume: Resume = resumeData;

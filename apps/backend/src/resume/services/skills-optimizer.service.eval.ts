import "dotenv/config";
import { evalite } from "evalite";
import { SkillsOptimizerService } from "./skills-optimizer.service";

const data: { input: any; expected: string }[] = [
  {
    input: {
      jobDescription: `**Job Title:** Senior Frontend Developer
**Company:** TechCorp

**Responsibilities:** Develop responsive web applications, implement modern UI/UX designs, optimize application performance, collaborate with cross-functional teams, mentor junior developers.

**Tech Stack:** React, TypeScript, Next.js, Tailwind CSS, Node.js, GraphQL, REST APIs, Git, CI/CD, Testing Frameworks.

**Requirements:** 5+ years frontend development experience, strong React skills, experience with TypeScript, knowledge of modern CSS frameworks, understanding of performance optimization.

**Preferred:** Experience with design systems, state management, automated testing, Agile methodologies.`,
      skills: `**Languages & Frameworks:**
*   JavaScript
*   TypeScript
*   HTML
*   CSS
*   Node.js
*   React
*   Next.js
*   Angular
*   NestJS
*   Tailwind CSS
*   styled-components

**Databases & APIs:**
*   PostgreSQL
*   REST
*   tRPC

**Testing Tools:**
*   Cypress
*   Playwright
*   Jest
*   Vitest

**Other Skills:**
*   Performance Optimization
*   Design Systems
*   CI/CD Automation
*   Accessibility (a11y)
*   AI Integration
*   SEO Optimization
*   Agile/Scrum`,
    },
    expected: "",
  },
];

evalite("Resume skills optimizer", {
  data: () => {
    return data;
  },
  task: async (input: any) => {
    const skillsOptimizerService = new SkillsOptimizerService();
    return skillsOptimizerService.optimize(input);
  },
  scorers: [],
});

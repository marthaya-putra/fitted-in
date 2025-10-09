import 'dotenv/config';
import { evalite } from 'evalite';
import { WorkExperienceOptimizerService } from './work-experience-optimizer.service';

const data: { input: any; expected: string }[] = [
  {
    input: {
      jobDescription: `**Job Title:** Senior Frontend Developer
**Company:** TechCorp

**Responsibilities:** Develop responsive web applications, implement modern UI/UX designs, optimize application performance, collaborate with cross-functional teams, mentor junior developers.

**Tech Stack:** React, TypeScript, Next.js, Tailwind CSS, Node.js, GraphQL, REST APIs, Git, CI/CD, Testing Frameworks.

**Requirements:** 5+ years frontend development experience, strong React skills, experience with TypeScript, knowledge of modern CSS frameworks, understanding of performance optimization.

**Preferred:** Experience with design systems, state management, automated testing, Agile methodologies.`,
      resume: {
        summary: `Product-minded Senior Software Engineer based in Bali, Indonesia, with _10+ years_ of experience building, deploying, and optimizing high-performance web applications. Proficient in JavaScript, TypeScript, HTML, CSS, Node.js, and modern frameworks including React, Next.js, Tailwind CSS, Angular, NestJS. Skilled in AI integration, performance optimization, automated testing, and scalable front-end architecture.`,
        experiences: `### **Senior Software Engineer**
*We Lysn*, New South Wales, Australia (Remote)
Feb 2024 - Present
*Telehealth platform startup for mental health and workplace wellbeing*
* Designed, re-engineered, and co-architected Next.js and React applications from scratch, improving UI/UX and aligning features with business requirements.
* Utilized Tailwind CSS, PostgreSQL, tRPC for seamless and scalable front-end development.
* Improved development processes, resulting in 50% faster team velocity.
* Led AI-driven product initiatives to enhance platform capabilities.

### **Web Software Engineer**
*Glints*, Indonesia (Remote)
Apr 2022 - Feb 2024
*Southeast Asia leading career development and recruitment platform*
* Optimized job and employer marketplace sites built with React and Next.js, achieving 20-30% faster performance and higher SEO rankings.
* Maintained and improved an internal React + styled-components design system, boosting developer productivity.
* Integrated Cypress and Playwright automated testing into CI/CD pipelines, reducing critical post-deployment bugs by 60–70%.

### **Senior Engineer (Frontend focused)**
*Nintex*, Kuala Lumpur, Malaysia
Jan 2020 - Mar 2022
*Leading low-code automation platform that empowers organizations to streamline workflows*
* Developed a Node.js + NestJS migration tool to transition clients from O365 to proprietary cloud systems, increasing client conversion by 30%.
* Unified UI/UX across React and Angular products, raising productivity by 20%.
* Researched and implemented accessibility (a11y) improvements to meet 100% compliance standards.`,
        educations: `*   **Bachelor's Degree - Computer Science**
    *   *Bina Nusantara University, Jakarta*`,
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
    },
    expected: '',
  },
];

evalite('Resume work experience optimizer', {
  data: async () => {
    return data;
  },
  task: async (input: any) => {
    const workExperienceOptimizerService = new WorkExperienceOptimizerService();
    return workExperienceOptimizerService.optimize(input);
  },
  scorers: [],
});

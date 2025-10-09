import 'dotenv/config';
import { evalite } from 'evalite';
import { SummaryOptimizerService } from './summary-optimizer.service';

const data: { input: any; expected: string }[] = [
  {
    input: {
      jobDescription: `**Job Title:** RAG/Database Engineer\n**Company:** Supercoder (for a client)\n\n**Responsibilities:** Design & optimize RAG systems, integrate SQL & vector databases, build/optimize APIs, ensure query optimization, collaborate with teams, maintain data security.\n\n**Tech Stack:** PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Pinecone, Weaviate, Milvus, LangChain, LlamaIndex, Haystack, OpenAI GPT, Claude, Python, SQL, JavaScript/TypeScript, FastAPI, Flask, Node.js, AWS, GCP, Azure, Docker, Kubernetes, CI/CD, Monitoring.\n\n**Requirements:** 4+ years database/data platform experience, strong SQL skills, experience with vector databases & RAG systems, proficiency in Python & SQL.\n\n**Preferred:** Experience with BI tools, ETL/ELT pipelines, semantic modeling, strong problem-solving & communication.\n\n**Experience:** 4+ years\n\n**Benefits:** Work with cutting-edge LLMs/vector databases, collaborative environment, competitive salary, growth opportunities, 100% remote.`,
      resume: {
        summary: `Product-minded Senior Software Engineer based in Bali, Indonesia, with _10+ years_ of experience building, deploying, and optimizing high-performance web applications. Proficient in JavaScript, TypeScript, HTML, CSS, Node.js, and modern frameworks including React, Next.js, Tailwind CSS, Angular, NestJS. Skilled in AI integration, performance optimization, automated testing, and scalable front-end architecture.`,
        experiences: `### **Senior Software Engineer**\n*We Lysn*, New South Wales, Australia (Remote)\nFeb 2024 - Present\n*Telehealth platform startup for mental health and workplace wellbeing*\n* Designed, re-engineered, and co-architected Next.js and React applications from scratch, improving UI/UX and aligning features with business requirements.\n* Utilized Tailwind CSS, PostgreSQL, tRPC for seamless and scalable front-end development.\n* Improved development processes, resulting in 50% faster team velocity.\n* Led AI-driven product initiatives to enhance platform capabilities.\n\n### **Web Software Engineer**\n*Glints*, Indonesia (Remote)\nApr 2022 - Feb 2024\n*Southeast Asia leading career development and recruitment platform*\n* Optimized job and employer marketplace sites built with React and Next.js, achieving 20-30% faster performance and higher SEO rankings.\n* Maintained and improved an internal React + styled-components design system, boosting developer productivity.\n* Integrated Cypress and Playwright automated testing into CI/CD pipelines, reducing critical post-deployment bugs by 60–70%.\n\n### **Senior Engineer (Frontend focused)**\n*Nintex*, Kuala Lumpur, Malaysia\nJan 2020 - Mar 2022\n*Leading low-code automation platform that empowers organizations to streamline workflows*\n* Developed a Node.js + NestJS migration tool to transition clients from O365 to proprietary cloud systems, increasing client conversion by 30%.\n* Unified UI/UX across React and Angular products, raising productivity by 20%.\n* Researched and implemented accessibility (a11y) improvements to meet 100% compliance standards.\n\n### **Senior Engineer (Frontend focused)**\n*Apar Technologies*, Kuala Lumpur, Malaysia\nApr 2019 - Dec 2019\n* Built an Angular-based parcel management app for DHL, improving up to 30% agent efficiency and customer service.\n* Implemented automated testing to improve delivery reliability and deployment confidence by 60%.\n\n### **Senior Technical Consultant (Frontend focused)**\n*Arvato System*, Kuala Lumpur, Malaysia\nJune 2017 - Jan 2019\n* Migrated legacy AngularJS codebase to Angular while delivering new features for better maintainability.\n* Developed a centralized Angular-based media hub for broadcasting clients, streamlining digital asset management.`,
        educations: `*   **Bachelor's Degree - Computer Science**\n    *   *Bina Nusantara University, Jakarta*`,
        skills: `**Languages & Frameworks:**\n*   JavaScript\n*   TypeScript\n*   HTML\n*   CSS\n*   Node.js\n*   React\n*   Next.js\n*   Angular\n*   NestJS\n*   Tailwind CSS\n*   styled-components\n\n**Databases & APIs:**\n*   PostgreSQL\n*   REST\n*   tRPC\n\n**Testing Tools:**\n*   Cypress\n*   Playwright\n*   Jest\n*   Vitest\n\n**Other Skills:**\n*   Performance Optimization\n*   Design Systems\n*   CI/CD Automation\n*   Accessibility (a11y)\n*   AI Integration\n*   SEO Optimization\n*   Agile/Scrum`,
      },
    },
    expected: '',
  },
];

evalite('Resume summary optimizer', {
  // A function that returns an array of test data
  // - TODO: Replace with your test data
  data: async () => {
    return data;
  },
  // The task to perform
  // - TODO: Replace with your LLM call
  task: async (input: any) => {
    const summaryOptimizerService = new SummaryOptimizerService();

    return summaryOptimizerService.optimize(input);
  },
  // The scoring methods for the eval
  // TODO: create custom scorer
  scorers: [],
});

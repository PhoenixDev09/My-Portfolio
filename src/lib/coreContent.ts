import { CoreContent } from './types';

/**
 * SOURCE OF TRUTH — This object is the immutable factual foundation.
 * The AI may rewrite tone and style, but NEVER alters these facts.
 */
export const coreContent: CoreContent = {
    name: 'Lohith Kumar Parvathaneni',
    title: 'Full Stack Engineer & Creative Technologist',
    tagline: '2 years building systems that think, feel, and scale.',
    bio: 'Lohith Kumar Parvathaneni is a full stack engineer with 2 years of professional experience designing and building digital systems. Specializing in AI-integrated web applications, distributed architectures, and developer tooling, Lohith has shipped products used by over 50,000 people. Lohith holds a Bachelor of Technology in Computer Science from Ramachandra College of Engineering(2023) and has worked with startups, and open-source communities to craft experiences that endure.',
    yearsOfExperience: 2,
    skills: [
        'TypeScript', 'Spring Security', 'Microservices', 'Node.js', 'Python',
        'PostgreSQL', 'Java', 'Docker', 'SpringBoot',
        'Machine Learning', 'System Design', 'CI/CD', 'WebSockets'
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'ASL Translator',
            year: 2024,
            description: 'An AI-powered ASL translator that converts sign language into text.',
            technologies: ['Python', 'OpenAI', 'WebGL', 'YOLO4', 'pandas'],
            metrics: '12,000 active users, 200ms avg generation time',
            link: 'https://neuralcraft.dev',
        },
        {
            id: 'proj-2',
            name: 'FlowSync',
            year: 2023,
            description: 'A real-time collaborative data pipeline orchestration platform. Reduced deployment friction by 70% for 8 enterprise clients managing petabyte-scale workflows.',
            technologies: ['Node.js', 'WebSockets', 'PostgreSQL', 'Docker', 'Kubernetes'],
            metrics: '70% deployment time reduction, 8 enterprise clients',
        },
        {
            id: 'proj-3',
            name: 'Echosphere',
            year: 2022,
            description: 'Spatial audio social platform connecting 30,000 users through immersive, location-based audio rooms. Built with low-latency WebRTC infrastructure.',
            technologies: ['React', 'WebRTC', 'Node.js', 'AWS', 'PostgreSQL'],
            metrics: '30,000 users, <50ms latency',
        },
        {
            id: 'proj-4',
            name: 'OpenLens',
            year: 2021,
            description: 'Open-source observability toolkit for distributed systems. Adopted by 3,200 engineers globally, with 1,400 GitHub stars.',
            technologies: ['TypeScript', 'Prometheus', 'Grafana', 'Go'],
            metrics: '3,200 users, 1,400 GitHub stars',
        },
    ],
    stats: [
        { label: 'Years Experience', value: '2' },
        { label: 'Projects Shipped', value: '5' },
        { label: 'Users Reached', value: '50K+' },
        { label: 'Countries', value: '1' },
    ],
    contact: {
        email: 'parvathanenilohithkumar@gmail.com',
        location: 'Hyderabad, AP',
        availability: 'Open to Full-stack Development roles',
    },
    socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/PhoenixDev09' },
        { platform: 'LinkedIn', url: 'www.linkedin.com/in/lohith-kumar-parvathaneni' },
        { platform: 'Twitter', url: 'https://twitter.com/lohithkumarparvathaneni' },
    ],
};

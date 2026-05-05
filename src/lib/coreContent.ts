import { CoreContent } from './types';

/**
 * SOURCE OF TRUTH — This object is the immutable factual foundation.
 * The AI may rewrite tone and style, but NEVER alters these facts.
 */
export const coreContent: CoreContent = {
    name: 'Sandeep Vadlamudi',
    title: 'EMS Data Analyst',
    tagline: '3+ years turning complex healthcare & EMS data into decisions that matter.',
    bio: 'Sandeep Vadlamudi is an EMS Data Analyst at Montgomery County Hospital District (MCHD) with 3+ years of experience across healthcare and emergency services data. He designs and optimises SQL-based ETL pipelines, builds operational dashboards in Power BI and Tableau, and develops custom interfaces between EMS, billing, clinical, and fleet systems. Previously a Data Analyst at OU Health and Wipro, Sandeep brings a proven record of reducing manual effort, improving data accuracy, and delivering reporting that supports mission-critical operations under HIPAA compliance.',
    yearsOfExperience: 3,
    education: 'M.S. Computer Science — Oklahoma City University | B.Tech CSE — Rama Chandra College of Engineering, India',
    skills: [
        'SQL', 'Python', 'Power BI', 'Tableau', 'Excel (VBA / Pivot)',
        'ETL & Data Pipelines', 'Data Reconciliation', 'SQL Server', 'PostgreSQL',
        'Azure Data Factory', 'PySpark', 'Airflow', 'HIPAA Compliance', 'EMS Operations Data'
    ],
    experiences: [
        {
            id: 'exp-1',
            role: 'EMS Data Analyst',
            company: 'Montgomery County Hospital District (MCHD)',
            location: 'Houston, Texas, USA',
            period: '2025 – Present',
            bullets: [
                'Design, test, and modify reports, analytics, and data infrastructure to support EMS, Alarm, Fleet, Clinical, and Billing operations.',
                'Develop and optimise custom SQL-based ETL processes for data reporting and interoperability between disparate EMS software systems.',
                'Build custom interfaces between EMS platforms and coordinate with Operations, Radio, ALARM, DCS, Materials Management, and Fleet.',
                'Create scheduled and ad-hoc reports for EMS and Clinical leadership, ensuring accuracy and integrity of all reported information.',
                'Maintain thorough documentation, change logs, and version histories for all software and reporting workflows.',
                'Assist with compliance of data submissions to regulatory bodies and external vendors.',
            ],
        },
        {
            id: 'exp-2',
            role: 'Data Analyst',
            company: 'OU Health',
            location: 'Oklahoma, USA',
            period: 'Aug 2024 – 2025',
            bullets: [
                'Built Power BI dashboards and operational KPIs to monitor data accuracy, compliance, and performance across business teams.',
                'Developed SQL-based ETL workflows to reconcile data across multiple enterprise systems, reducing manual reconciliation effort by 40%.',
                'Performed investigative SQL analysis to identify root causes of data mismatches and support operational decision-making.',
                'Designed interactive Power BI reports using advanced DAX measures, drill-through filters, parameters, and action filters.',
                'Optimised dashboard performance by 50% across datasets of 1M+ records through query tuning and efficient data modelling.',
                'Performed system-to-system reconciliations between operational tracking systems and ERP platforms for audit resolution.',
            ],
        },
        {
            id: 'exp-3',
            role: 'Data Analyst',
            company: 'Wipro',
            location: 'India',
            period: 'Apr 2021 – Jun 2023',
            bullets: [
                'Built and maintained Tableau and Power BI dashboards for sales and operations teams, enabling performance tracking and forecasting.',
                'Reconciled data across multiple enterprise systems to resolve inconsistencies and standardise KPIs.',
                'Automated recurring operational reporting using Excel VBA, Power Query, and Pivot Tables — saving 10 hours per week.',
                'Improved reporting turnaround time from 1–2 days to a few hours by streamlining data refresh workflows.',
                'Supported data governance by documenting datasets, validating accuracy, and improving trust in enterprise reporting.',
                'Investigated system-level data discrepancies, performed root cause analysis, and resolved issues impacting operational reporting.',
            ],
        },
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'Chronic Kidney Disease Diagnostic System',
            year: 2024,
            description: 'AI-driven diagnostic system using Python to detect chronic kidney disease early. Applied hybrid machine learning on real-time health datasets, automated data pipelines for risk assessment, and used SQL for preprocessing and model input optimisation.',
            technologies: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'SQL'],
            metrics: 'Improved diagnostic precision with a real-time risk assessment pipeline',
        },
        {
            id: 'proj-2',
            name: 'Advance Traffic Flow Control System',
            year: 2023,
            description: 'ML-based intelligent traffic control system using real-time IoT sensor data to optimise signal timings dynamically. Included an emergency vehicle priority lane system and Power BI dashboards for smart-city analytics. Deployed end-to-end on Azure IoT Hub.',
            technologies: ['Python', 'Scikit-learn', 'Power BI', 'Plotly', 'Azure IoT Hub'],
            metrics: 'Measurable reduction in average wait times, real-time operational insights',
        },
    ],
    stats: [
        { label: 'Years Experience', value: '3+' },
        { label: 'Reconciliation Effort', value: '−40%' },
        { label: 'Weekly Hours Saved', value: '10 hrs' },
        { label: 'Dashboard Refresh Speed', value: '+50%' },
    ],
    contact: {
        email: 'vadlamudisandeep07@gmail.com',
        location: 'Houston, Texas',
        availability: 'EMS Data Analyst at Montgomery County Hospital District',
    },
    socialLinks: [
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/sandeep-vadlamudi-34383a2b3/' },
        { platform: 'GitHub', url: 'https://github.com/sandeep5599' },
    ],
};

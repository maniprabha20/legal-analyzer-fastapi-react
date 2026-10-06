import { Fragment } from 'react';

const FEATURES = [
  {
    icon: '📄',
    title: 'AI Document Analysis',
    desc: 'Analyze contracts and get a clear executive summary in seconds.',
  },
  {
    icon: '⚠️',
    title: 'Risk Detection',
    desc: 'Identify high, medium, and low-risk clauses automatically.',
  },
  {
    icon: '📅',
    title: 'Important Dates',
    desc: 'Find deadlines, renewal dates, and termination windows.',
  },
  {
    icon: '💬',
    title: 'Ask AI',
    desc: 'Ask questions about any uploaded document and get cited answers.',
  },
  {
    icon: '📑',
    title: 'Key Clauses',
    desc: 'Quickly surface important clauses and party obligations.',
  },
  {
    icon: '📥',
    title: 'Legal Report',
    desc: 'Download a structured, shareable AI analysis report as a PDF.',
  },
];

const HOW_STEPS = [
  { num: 1, label: 'Upload Document' },
  { num: 2, label: 'AI Processing' },
  { num: 3, label: 'Review Analysis' },
  { num: 4, label: 'Ask AI / Download Report' },
];

export function FeatureCardsSection() {
  return (
    <div className="mt-5">
      <div className="section-heading">AI Legal Tools</div>
      <div className="section-subheading">Everything you can do with an uploaded document</div>

      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <div>
      <div className="section-heading">How It Works</div>
      <div className="section-subheading">From upload to insight in four steps</div>

      <div className="how-it-works">
        {HOW_STEPS.map((step, i) => (
          <Fragment key={step.num}>
            <div className="how-step">
              <div className="how-num">{step.num}</div>
              <div className="how-label">{step.label}</div>
            </div>
            {i < HOW_STEPS.length - 1 && <div className="how-arrow">&rarr;</div>}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

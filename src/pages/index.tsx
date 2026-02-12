import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Multi-Agent AI Decision Engine
        </Heading>
        <p className="hero__subtitle">
          82 C-Suite agents. Bayesian calibration. Board meetings in seconds.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/developers/architecture/overview">
            Explore Architecture
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/developers/api/overview"
            style={{marginLeft: '1rem'}}>
            API Reference
          </Link>
        </div>
        <div style={{marginTop: '2rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <span className={styles.statBadge}>82 Agents</span>
          <span className={styles.statBadge}>28 Endpoints</span>
          <span className={styles.statBadge}>5 Tiers</span>
          <span className={styles.statBadge}>{'<'}30s Decisions</span>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Architecture',
    emoji: '\u{1F3D7}',
    description: '82-agent swarm with C-Suite hierarchy, board meetings, and Bayesian calibration.',
    link: '/docs/developers/architecture/overview',
  },
  {
    title: 'API Reference',
    emoji: '\u{1F50C}',
    description: '28 endpoints across board meetings, content, vision, HITL, and more.',
    link: '/docs/developers/api/overview',
  },
  {
    title: 'Guides',
    emoji: '\u{1F4D6}',
    description: 'Step-by-step integration guides for API keys, webhooks, and voice agent setup.',
    link: '/docs/guides/getting-started',
  },
  {
    title: 'Internal',
    emoji: '\u{1F512}',
    description: 'SOPs, runbooks, incident response procedures, and security documentation.',
    link: '/docs/internal/sops/overview',
  },
];

function FeatureCard({title, emoji, description, link}: {title: string; emoji: string; description: string; link: string}) {
  return (
    <div className={clsx('col col--3')}>
      <div className="card padding--lg" style={{height: '100%'}}>
        <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{emoji}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link} className="button button--outline button--primary button--sm">
          Learn more &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="DYNIQ Documentation"
      description="Documentation for the DYNIQ AI Platform - 82-agent swarm, voice AI, and automation">
      <HomepageHeader />
      <main>
        <section className="container margin-top--xl margin-bottom--xl">
          <div className="row">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

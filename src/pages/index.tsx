import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
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
      </div>
    </header>
  );
}

function FeatureCard({title, description, link}: {title: string; description: string; link: string}) {
  return (
    <div className={clsx('col col--3')}>
      <div className="card padding--lg" style={{height: '100%'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link} className="button button--outline button--primary button--sm">
          Learn more
        </Link>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="DYNIQ Documentation"
      description="Documentation for the DYNIQ AI Platform - 82-agent swarm, voice AI, and automation">
      <HomepageHeader />
      <main>
        <section className="container margin-top--xl margin-bottom--xl">
          <div className="row">
            <FeatureCard
              title="Architecture"
              description="82-agent swarm with C-Suite hierarchy, board meetings, and Bayesian calibration."
              link="/docs/developers/architecture/overview"
            />
            <FeatureCard
              title="API Reference"
              description="28 endpoints across board meetings, content, vision, HITL, and more."
              link="/docs/developers/api/overview"
            />
            <FeatureCard
              title="Guides"
              description="Step-by-step integration guides for API keys, webhooks, and Ruben configuration."
              link="/docs/guides/getting-started"
            />
            <FeatureCard
              title="Workflows"
              description="Pre-built n8n automation templates for lead qualification and content pipelines."
              link="/docs/workflows/n8n-templates/overview"
            />
          </div>
        </section>
      </main>
    </Layout>
  );
}

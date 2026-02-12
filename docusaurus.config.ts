import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DYNIQ Docs',
  tagline: 'Documentation for the DYNIQ AI Platform',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.dyniq.ai',
  baseUrl: '/',

  organizationName: 'JWconsultancy1234',
  projectName: 'dyniq-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    format: 'detect',
  },

  themes: [
    '@docusaurus/theme-mermaid',
    'docusaurus-theme-openapi-docs',
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      language: ['en'],
      highlightSearchTermsOnTargetPage: true,
      explicitSearchResultPath: true,
    }],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'agents-api',
        docsPluginId: 'classic',
        config: {
          agentsApi: {
            specPath: 'static/openapi.json',
            outputDir: 'docs/developers/api-reference',
            sidebarOptions: {
              groupPathsBy: 'tag',
            },
          },
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem',
          editUrl: 'https://github.com/JWconsultancy1234/dyniq-docs/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          includeCurrentVersion: true,
          lastVersion: 'current',
          versions: {
            current: {
              label: 'v3.1',
              path: '',
            },
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/JWconsultancy1234/dyniq-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'DYNIQ',
      logo: {
        alt: 'DYNIQ Logo',
        src: 'img/logo.png',
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'developersSidebar',
          position: 'left',
          label: 'Developers',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'workflowsSidebar',
          position: 'left',
          label: 'Workflows',
        },
        {
          type: 'docSidebar',
          sidebarId: 'internalSidebar',
          position: 'left',
          label: 'Internal',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiReferenceSidebar',
          position: 'left',
          label: 'API Explorer',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {to: '/blog', label: 'Changelog', position: 'left'},
        {
          href: 'https://github.com/JWconsultancy1234/dyniq-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Architecture', to: '/docs/developers/architecture/overview'},
            {label: 'API Reference', to: '/docs/developers/api/overview'},
            {label: 'Getting Started', to: '/docs/guides/getting-started'},
          ],
        },
        {
          title: 'Platform',
          items: [
            {label: 'DYNIQ Website', href: 'https://dyniq.ai'},
            {label: 'API Status', href: 'https://agents-api.dyniq.ai/health'},
            {label: 'Langfuse Traces', href: 'https://langfuse.dyniq.ai'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Changelog', to: '/blog'},
            {label: 'Contributing', href: 'https://github.com/JWconsultancy1234/dyniq-docs/blob/main/CONTRIBUTING.md'},
            {label: 'GitHub', href: 'https://github.com/JWconsultancy1234/dyniq-docs'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DYNIQ. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'yaml', 'docker', 'nginx'],
    },
    codeBlock: {
      showCopyButton: true,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

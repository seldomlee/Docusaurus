// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Na0H's site",
  tagline: '自己要走的路 应当自己决定',
  url: 'https://na0h.cn',
  baseUrl: '/',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'seldomlee', // Usually your GitHub org/user name.
  projectName: 'docusaurus2', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },

        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'My Site',
        logo: {
          alt: 'My Site Logo',
          src: 'img/avatar.jpg',
        },
        items: [
          {
            type: 'doc',
            docId: 'Home',
            position: 'right',
            label: '📗Wiki',
          },
          {to: '/blog', label: '👨🏻‍💻Blog', position: 'right'},
          {to: '/about', label: '🏡About', position: 'right'},
          // {
          //   href: 'https://github.com/facebook/docusaurus',
          //   label: 'GitHub',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Wiki',
                to: '/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'About',
                to: '/about',
              },            
              {
                label: 'GitHub',
                href: 'https://github.com/seldomlee',
              },
            ],
          },
          {
            title: '友链',
            items: [
              {
                label: 'beiwo',
                href: 'https://www.cnblogs.com/wkzb/',
              },
              {
                label: 'Morouu',
                href: 'https://morblog.cc/',
              },
              {
                label: 'llllll7',
                href: 'http://lyxx.link/',
              },
              {
                label: 'hututu-w',
                href: 'https://hututu-w.github.io/',
              },
              {
                label: '夜孤城',
                href: 'https://gutoom.github.io/',
              },
              {
                label: 'th0me',
                href: 'https://th0me.github.io',
              },
              {
                label: 'wx_x',
                href: 'https://wxx0105.github.io/',
              },
            ],
          },

        ],
        copyright: `Copyright © ${new Date().getFullYear()} Na0H's Wiki`,

      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
            // The application ID provided by Algolia
            appId: 'NKX36XZFNO',

            // Public API key: it is safe to commit it
            apiKey: 'f19e8240cc811784db153d8e96c386d4',

            indexName: 'na0h',

            // Optional: see doc section below
            contextualSearch: true,

            // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
            // externalUrlRegex: 'external\\.com|domain\\.com',

            // Optional: Algolia search parameters
            searchParameters: {},

            // Optional: path for search page that enabled by default (`false` to disable it)
            searchPagePath: 'search',

            //... other Algolia params
          },
    }),
};

module.exports = config;

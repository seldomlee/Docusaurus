// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Na0H's Wiki",
  tagline: '',
  url: 'https://wiki.na0h.cn',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://bloghexo-seldomlee.vercel.app/img/favicon.ico',
  organizationName: 'seldomlee', // Usually your GitHub org/user name.
  projectName: 'Docusaurus', // Usually your repo name.



  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        language: ["en", "zh"],
        // ```
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
      },
    ],
  ],


  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        googleAnalytics: {
          trackingID: 'G-JPWGXDKK2T',
          anonymizeIP: false,
        },
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/seldomlee/Docusaurus/edit/main/',
          sidebarCollapsible: true, //默认折叠
          routeBasePath: "/",
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
          breadcrumbs: false,
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          showReadingTime: false,
          editUrl: 'https://github.com/seldomlee/Docusaurus/edit/main/',
          blogSidebarCount: 0,
          // blogSidebarCount: 8,
          // postsPerPage: 8,
          // path: 'blog',
          // blogSidebarTitle: 'Recent',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        //生成sitemap.xml，可访问url/sitemap.xml
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      }),
    ],
  ],

  stylesheets: [{
    href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
    type: 'text/css',
    integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
    crossorigin: 'anonymous',
  }, ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
/*
      algolia: {
        // The application ID provided by Algolia
        appId: 'IRO903CONI',

        // Public API key: it is safe to commit it
        apiKey: 'defe7fd8690822eed8e3c94801bab286',

        indexName: 'wiki-power',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        //externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        //... other Algolia params
      },*/

      //sidebarCollapsible: true, //默认折叠
      image: 'img/avatar.jpg',
      hideableSidebar: true,


      navbar: {
        title: "Na0H's Wiki",
        hideOnScroll: true,

        logo: {
          alt: 'My Site Logo',
          src: "https://bloghexo-hdltzafy7-seldomlee.vercel.app/img/avatar.jpg",
        },

        items: [        
          {
            to: "blog",
            label: "👨🏻‍💻about",
            position: "right",
          },
        // {
        //   href: "https://bloghexo-seldomlee.vercel.app/",
        //   label: "博客",
        //   position: "right",
        // },
        // {
        //   href: "https://github.com/seldomlee",
        //   label: "github",
        //   position: "right",
        // },
        ],
      },


      footer: {
        style: 'light',


        links: [
          
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


       //copyright: `by Power Lin | 粤 ICP 备 20014898 号 | Built with Docusaurus.`,
      },

     
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
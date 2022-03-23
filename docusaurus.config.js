const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: "Na0H's Wiki",
  //titleDelimiter: "a", // Defaults to `|`
  tagline: "",
  url: "https://docusaurus-dusky.vercel.app",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "https://bloghexo-seldomlee.vercel.app/img/favicon.ico",
  themeConfig: {
    /*
        footer: {
          
          copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
        },
        */

    image: 'img/avatar.jpg',
    algolia: {
      apiKey: "16b3d7deeb808a05b093ae40cc25b260",
      indexName: "Z6DQZ749EW",

      // Optional: see doc section bellow
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      //... other Algolia params
    },


    colorMode: {
      // "light" | "dark"
      //defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,

      // Dark/light switch icon options
      switchConfig: {
        // Icon for the switch while in dark mode
        darkIcon: '🌙',
        lightIcon: '🌞',
        darkIconStyle: {
          marginLeft: "2px",
        },
        lightIconStyle: {
          marginLeft: "1px",
        },
      },
    },

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
  },

  // stylesheets: [{
  //   href: 'https://cdn.jsdelivr.net/gh/linyuxuanlin/Wiki_Docusaurus/static/katex/v0.12.0/katex.min.css',
  //   type: 'text/css',
  //   integrity: 'sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X',
  //   crossorigin: 'anonymous',
  // }, ],

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarCollapsible: true, //默认折叠
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: "https://github.com/seldomlee/Docusaurus/edit/main/",
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          //blogTitle: 'Na0H\'s blog!',
          //blogDescription: '',
          //blogSidebarCount: 8,
          //postsPerPage: 8,

          showReadingTime: true,
          blogSidebarCount: 0,
          //path: 'blog',
          //blogSidebarTitle: 'about',
          editUrl: 'https://github.com/seldomlee/Docusaurus/settings/main/',
          /*
          feedOptions: {
            type: 'all', // required. 'rss' | 'feed' | 'all'
            title: 'Na0H\'s Blog', // default to siteConfig.title
            description: '个人博客', // default to  `${siteConfig.title} Blog`
            copyright: 'Copyright © ${new Date().getFullYear()} Power Lin',
            language: undefined, // possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
          },
          */
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
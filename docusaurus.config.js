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
  //https://i.loli.net/2021/08/05/gcTRAN1mEZLtjP2.png
  //organizationName: "seldomlee", // Usually your GitHub org/user name.
  //projectName: "Docusaurus", // Usually your repo name.
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

        // CSS to apply to dark icon,
        // React inline style object
        // see https://reactjs.org/docs/dom-elements.html#style
        darkIconStyle: {
          marginLeft: "2px",
        },

        // Unicode icons such as '\u2600' will work
        // Unicode with 5 chars require brackets: '\u{1F602}'
        //lightIcon: '\u{1F602}',

        lightIconStyle: {
          marginLeft: "1px",
        },
      },
    },

    hideableSidebar: true,
    navbar: {
      title: "Na0H's Wiki",
      hideOnScroll: true,
      //style: 'primary',
      /*
      logo: {
        alt: "My Site Logo",
        src:
          "https://wiki-media-1253965369.cos.ap-guangzhou.myqcloud.com/img/20201122195819.png",
      },
      */
      logo: {
        alt: 'My Site Logo',
        src: "https://bloghexo-seldomlee.vercel.app/img/favicon.ico",
      },
      items: [
        {
          to: "blog",
          label: "about",
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
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          editUrl: "https://github.com/seldomlee/Docusaurus/edit/main/",
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          //blogTitle: 'Na0H\'s blog!',
          //blogDescription: '',
          blogSidebarCount: 8,
          postsPerPage: 8,
          showReadingTime: false,
          path: 'blog',
          blogSidebarTitle: 'about',
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
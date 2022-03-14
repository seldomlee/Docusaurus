module.exports = {
  title: "Na0H's Wiki",              // 站点名称
  tagline: '',  // 站点描述
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',           // 站点的图标
   
  url: 'https://docusaurus-dusky.vercel.app/', // GitHub 页面的 URL
  baseUrl: '/',                         // 项目的基本 URL 设置为 /仓库名/
  organizationName: '',            // 设置为 Github 用户名
  projectName: '',   // 设置为 Github 仓库名
  
  
  themeConfig: {

    // 配置搜索栏需要到 algolia 配置
    // algolia: {
    //   apiKey: 'YOUR_API_KEY',
    //   indexName: 'YOUR_INDEX_NAME',

    //   // Optional: see doc section bellow
    //   contextualSearch: true,

    //   // Optional: Algolia search parameters
    //   searchParameters: {},

    //   //... other Algolia params
    // },
    // 导航栏配置
    navbar: {
      title: "Na0H's Wiki",                 // 名称
      
      // 设置logo 如果需要可以取消注释  logo文件推荐转为 .svg 格式
      // logo: {
      //   alt: 'My Site Logo',            
      //   src: 'img/logo.svg',
      // },
      
      // 导航栏上的按钮  按照相应的格式可以创建新的按钮
      items: [
        {
          to: '/',                   // 要跳转的页面
          label: '博客',                // 按钮名称
          position: 'right'              // 按钮位于左边还是右边
        },
        
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: '文档',
          position: 'right',
        },
        
        {
          href: 'https://github.com/rcxxx/docusaurus-template',  // 如果要跳转链接则使用 herf
          label: '本站源码',
          position: 'right',
        },
      ],
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

    // 页脚配置
    footer: {
      style: 'dark',                    // 页脚风格
      links: [

        // 同样的方式创建一个分类
        {
          title: 'Docs',
          // 同样的格式创建新的按钮
          items: [
            {
              label: 'start',           // 标签
              to: 'docs/',              // 要跳转的页面
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
  },
  
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          showReadingTime: true,
          path: "./blog",
          routeBasePath: "/",           // 这里将 blog/ 设置为首页
        },
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          
          // 修改为自己的链接，在文章底部添加编辑此页面的链接
          // editUrl:
          //   'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

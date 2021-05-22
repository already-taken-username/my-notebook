module.exports = {
  siteMetadata: {
    title: `my-notebook`,
    description: `notebook`,
    author: `@already-taken-username`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `my-notebook`,
        short_name: `notebook`,
        start_url: `/`,
        background_color: `#2E2E2E`,
        theme_color: `#2E2E2E`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`,
      },
    }
  ],
}

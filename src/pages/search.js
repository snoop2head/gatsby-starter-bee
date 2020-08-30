import React, { useState, useEffect, useCallback } from 'react'
import tw, { css } from 'twin.macro'
import { graphql } from 'gatsby'
import queryString from 'query-string'
import Search from '../components/Search/Search'
import { Link } from 'gatsby'

const Post = ({ post }) => {
  return (
    <div
      css={css`
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        ${tw`mx-4 my-12 transform hover:scale-105`}
      `}
    >
      <Link to={post.node.fields.slug}>
        <h1
          css={css`
            ${tw`text-xl font-semibold`}
          `}
        >
          {post.node.frontmatter.title}
        </h1>
        <h2
          css={css`
            ${tw`my-1 text-xs`}
          `}
        >
          {post.node.frontmatter.date}
        </h2>
        <span
          css={css`
            ${tw`break-words`}
          `}
        >
          {post.node.excerpt}
        </span>
      </Link>
    </div>
  )
}

const Wrapper = tw.div`w-full max-w-screen-md mx-auto`

export default ({ data, location }) => {
  const [state, setState] = useState({
    query: '',
    filteredData: [],
  })

  const handleChange = query => {
    if (query.trim() === state.query.trim()) {
      setState({
        query,
        filteredData: state.filteredData,
      })
      return
    }
    searchPost(query)
  }

  const searchPost = useCallback(
    query => {
      if (query.trim() === '') {
        setState({
          query,
          filteredData: [],
        })
        return
      }
      const posts = data.allMarkdownRemark.edges || []

      const filteredData = posts.filter(post => {
        const searchQuery = query.toLowerCase().trim()
        const {
          excerpt,
          frontmatter: { title },
        } = post.node
        return (
          (excerpt && excerpt.toLowerCase().includes(searchQuery)) ||
          (title && title.toLowerCase().includes(searchQuery))
        )
      })
      setState({
        query,
        filteredData,
      })
    },
    [data.allMarkdownRemark.edges]
  )

  useEffect(() => {
    if (location.href) {
      const {
        query: { query },
      } = queryString.parseUrl(location.href)
      searchPost(query ? query : '')
    }
  }, [searchPost, location.href])

  return (
    <Wrapper>
      <Search
        value={state.query}
        onChange={e => handleChange(e.target.value)}
        location={location}
      />
      {state.filteredData.map((post, index) => {
        return <Post post={post} key={`post_${index}`} />
      })}
    </Wrapper>
  )
}

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { category: { ne: null }, draft: { eq: false } } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 200, truncate: true)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD YYYY")
            title
            category
            draft
          }
        }
      }
    }
  }
`

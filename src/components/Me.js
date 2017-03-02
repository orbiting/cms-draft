import React from 'react'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

const query = gql`
query me {
  me {
    name
    login
    avatar_url
  }
}
`

export const withMe = (Component, redirect = () => {}) => graphql(query, {
  props: (props) => {
    const {data} = props
    if (!data.loading) {
      redirect(props)
    }
    return {
      me: data.me
    }
  }
})(Component)

const Me = ({me, size}) => {
  if (!me) {
    return null
  }
  return (
    <span>
      <span className='avatar' style={{
        backgroundImage: `url(${me.avatar_url})`,
        width: size,
        height: size
      }} />
      <span>{me.name || me.login}</span>
      <style jsx>{`
        .avatar {
          display: inline-block;
          background-size: cover;
          margin-right: 10px;
          border-radius: 50%;
        }
      `}</style>
    </span>
  )
}

Me.defaultProps = {
  size: 24
}

export default withMe(Me)

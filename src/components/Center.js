import React from 'react'

export default ({children}) => (
  <div>
    {children}
    <style jsx>{`
      div {
        max-width: 640px;
        margin: 0 auto;
        padding: 20px;
      }
    `}</style>
  </div>
)

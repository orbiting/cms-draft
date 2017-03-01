import React from 'react'

export default ({children}) => (
  <div>
    {children}
    <style jsx global>{`
      body, html {
        padding: 0;
        margin: 0;
      }
    `}</style>
  </div>
)

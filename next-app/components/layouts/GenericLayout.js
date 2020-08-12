import React from 'react'
import PageTransition from '../common/PageTransition'

const GenericLayout = ({children}) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  )
}

export default GenericLayout

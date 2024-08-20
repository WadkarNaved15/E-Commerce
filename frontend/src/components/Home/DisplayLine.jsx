import React from 'react'

const DisplayLine = ({title}) => {
  return (
    <div className='display-line'>
        <p className='display-line-title'>
            {title}
        </p>
    </div>
  )
}

export default DisplayLine
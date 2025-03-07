import React, { Children } from 'react'

const Button = ({text, onclick, primary}) => {
  return (
    <button className={`${primary? "bg-white text-primary-700 hover:bg-gray-100 hover:text-primary-600 px-8 py-3":"ml-4 btn-primary"} text-lg btn`} onClick={onclick}>{text}</button>
  )
}

export default Button
import React from 'react'
import url from 'url'
import { REDIRECT_URI, PATH_PREFIX } from '../constants'

const loginUrl = url.join(REDIRECT_URI, PATH_PREFIX, 'login')

const ReceiveRedirect = ({ redirectTo }) => {
  const redirectUrl = url.join(PATH_PREFIX, redirectTo)

  return (
    <div>
      <h1>Logging you in...</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `
;(() => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get("code")
 
  if(code) {
    fetch(${loginUrl}, {
      method: "post",
      credentials: "include",
      body: JSON.stringify({ code }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then(response => response.json())
    .then(response => {
      console.log(response)
      // window.location.assign("${redirectUrl}");
    })
  } else {
    alert("No code received.")
  }
})();
      `,
        }}
      />
    </div>
  )
}

export default ReceiveRedirect

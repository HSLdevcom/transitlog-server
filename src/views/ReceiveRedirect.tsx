import React from 'react'
import join from 'proper-url-join'
import { PATH_PREFIX } from '../constants'

const ReceiveRedirect = ({ redirectTo }) => {
  const redirectUrl = join(PATH_PREFIX, redirectTo)

  return (
    <div>
      <h1>Logging you in...</h1>
      <script
        dangerouslySetInnerHTML={{
          __html: `
;(() => {
  const url = new URL(window.location.href)
  const code = url.searchParams.get("code")
  const loginUrl = url.origin + "${PATH_PREFIX}" + "login"
 
  if(code) {
    fetch(loginUrl, {
      method: "post",
      credentials: "include",
      body: JSON.stringify({ code }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((response) => {
      console.log(response)
      window.location.assign("${redirectUrl}");
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

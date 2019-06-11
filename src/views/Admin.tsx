import React from 'react'
import join from 'proper-url-join'
import { get } from 'lodash'

const AdminView = ({ adminPath, settings }) => {
  const message = get(settings, 'ui_message') || { date: '', message: '' }

  return (
    <>
      <h1>Transitlog server admin</h1>
      <hr />
      <form method="post" action={join(adminPath, 'set-ui-message')}>
        <fieldset>
          <legend>UI message</legend>
          <p>Set a message that is shown in the UI.</p>
          {message.message && (
            <>
              <h5>Current message:</h5>
              <p>{message.message}</p>
              <p>
                <small>Last set on {message.date}</small>
              </p>
            </>
          )}
          <input type="text" name="ui_message" value={message.message} onChange={() => {}} />
          <input type="submit" value="Set message" />
        </fieldset>
      </form>
    </>
  )
}

export default AdminView

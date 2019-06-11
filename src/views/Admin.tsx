import React from 'react'
import UIMessageForm from './components/UIMessage'
import GroupAssignment from './components/GroupAssignment'

const AdminView = ({ adminPath, settings }) => {
  return (
    <>
      <h1>Transitlog server admin</h1>
      <hr />
      <UIMessageForm adminPath={adminPath} settings={settings} />
      <GroupAssignment adminPath={adminPath} settings={settings} />
    </>
  )
}

export default AdminView

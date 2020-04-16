import React from 'react'
import UIMessageForm from './components/UIMessage'
import GroupAssignment from './components/GroupAssignment'
import AutoDomainGroups from './components/AutoDomainGroups'
import join from 'proper-url-join'

const AdminView = ({ adminPath, settings }) => {
  return (
    <>
      <h1>Transitlog server admin</h1>
      <hr />
      <UIMessageForm adminPath={adminPath} settings={settings} />
      <GroupAssignment adminPath={adminPath} settings={settings} />
      <AutoDomainGroups adminPath={adminPath} settings={settings} />
      <hr />
      <h3>Clear cache</h3>
      <p>
        If the cache contains old data you may clear the whole cache here. Remember that this
        will result in some queries taking longer due to being fetched from the DB.
      </p>
      <form method="post" action={join(adminPath, 'clear-cache')}>
        <input type="submit" value="Clear cache" />
      </form>
    </>
  )
}

export default AdminView

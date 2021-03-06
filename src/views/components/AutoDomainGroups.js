import React from 'react'
import join from 'proper-url-join'
import { get } from 'lodash'

const AutoDomainGroups = ({ adminPath, settings }) => {
  const assignedGroups = get(settings, 'auto_domain_groups', [])

  return (
    <>
      <h3>Create groups for emails</h3>
      <form action={join(adminPath, 'set-auto-groups')} method="post">
        <fieldset>
          <legend>HSL ID group creation</legend>
          <p>
            Enter each email or domain (one per line) that you want to have groups created for.
            The group will be named after the domain, and all emails from that domain that
            register with Transitlog will be assigned to the group as well. Additionally, you
            can assign domains to existing groups with the = sign (like above). Groups will be
            created when you click "Create groups" but no users will be assigned until they log
            into Transitlog.
          </p>
          <p>
            To remove a user from a group, first remove the assignment in this field and then
            remove the user from the group through the HSL ID dashboard at{' '}
            <a href="https://hslid-uat.cinfra.fi/ui">https://hslid-uat.cinfra.fi/ui</a>.
          </p>
          <div>
            <textarea
              onChange={() => {}}
              rows="10"
              cols="60"
              name="auto_group_assignments"
              value={assignedGroups
                .map(({ domain, groups }) => `${domain}=${groups.join(',')}`)
                .join('\n')}
            />
          </div>
          <div>
            <input type="submit" value="Create groups" />
          </div>
        </fieldset>
      </form>
    </>
  )
}

export default AutoDomainGroups

import React from 'react'
import join from 'proper-url-join'
import { get } from 'lodash'

const GroupAssignment = ({ adminPath, settings }) => {
  const assignedGroups = get(settings, 'domain_groups', [])

  return (
    <>
      <h3>Assign email domains to groups</h3>
      <form action={join(adminPath, 'set-groups')} method="post">
        <fieldset>
          <legend>HSL ID group assignment</legend>
          <p>
            One email domain or email per line, assigned to a group with =. A domain can be
            assigned to many groups, separated by a comma. This will not yet assign any users
            to groups, that happens when a user with with an email that matches an assignment
            signs into Transitlog the next time.
          </p>
          <p>
            To remove a user from a group, first remove the assignment in this field and then
            remove the user from the group through the HSL ID dashboard at{' '}
            <a href="https://hslid-uat.cinfra.fi/ui">https://hslid-uat.cinfra.fi/ui</a>.
          </p>
          <p>Example:</p>
          <pre>
            <code
              dangerouslySetInnerHTML={{
                __html: `hsl.fi=HSL,HSL-admin
cgi.com=HSL`,
              }}
            />
          </pre>
          <div>
            <textarea
              onChange={() => {}}
              rows="10"
              cols="60"
              name="group_assignments"
              value={assignedGroups
                .map(({ domain, groups }) => `${domain}=${groups.join(',')}`)
                .join('\n')}
            />
          </div>
          <div>
            <input type="submit" value="Set group assignments" />
          </div>
        </fieldset>
      </form>
    </>
  )
}

export default GroupAssignment

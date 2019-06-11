import React from 'react'
import join from 'proper-url-join'
import { get } from 'lodash'
import { DomainGroup } from '../../datasources/transitlogServer'

const GroupAssignment = ({ adminPath, settings }) => {
  const assignedGroups: DomainGroup[] = get(settings, 'domain_groups', [])

  return (
    <>
      <h3>Assign email domains to groups</h3>
      <form action={join(adminPath, 'set-groups')} method="post">
        <fieldset>
          <legend>HSL ID group assignment</legend>
          <p>
            One email domain (without the @) per line, assigned to a group with =. A domain can be
            assigned to many groups, separated by a comma.
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
              cols="40"
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

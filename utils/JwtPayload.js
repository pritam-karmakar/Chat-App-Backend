
function buildJwtPayload(userObj) {
  const roles = userObj.roles ?? [];
  const orgs = userObj.organizations ?? [];
  const payload = {
    id: userObj.id,
    name: userObj.username,
    role_id: roles[0]?.id ?? roles[0]?.roleId ?? null,
    role_name: roles[0]?.name ?? roles[0]?.roleName ?? null,
    email: userObj.email,
    is_active: userObj.is_active,
    org_type: userObj.organization_type,
    picture_url: userObj.picture_url,
  };
  if (userObj.organization_type === "business")
    payload.org_id = orgs[0]?.id ?? null;
  return payload;
}

export default buildJwtPayload;
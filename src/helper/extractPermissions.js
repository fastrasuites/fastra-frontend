export function extractPermissions(userAccesses) {
  const permissions = {};

  userAccesses.forEach((app) => {
    const appName = app.application;
    const accessGroups = app.access_groups;

    // Superadmin case
    const isAllApps = appName === "all_apps";
    const isAllAccessGroups = accessGroups === "all_access_groups";

    if (isAllApps && isAllAccessGroups) {
      permissions["*:*:*"] = true; // wildcard access
      return;
    }

    // Normal case
    accessGroups.forEach((group) => {
      const module = group.application_module;
      const action = group.access_right_details.name.toLowerCase();

      const key = `${appName}:${module}:${action}`;
      permissions[key] = true;
    });
  });

  return permissions;
}

export function getPermissionsByApp(appName, allPermissions) {
  const filtered = {};

  Object.entries(allPermissions).forEach(([key, value]) => {
    if (key.startsWith(`${appName}:`) || key === "*:*:*") {
      filtered[key] = value;
    }
  });

  return filtered;
}

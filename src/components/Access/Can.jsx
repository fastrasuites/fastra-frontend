// Can.js

import { useCanAccess } from "../../context/Access/AccessContext";

const Can = ({ app, module, action, children }) => {
  const accessMap = useCanAccess();
  console.log("Access Map:", accessMap);

  const key = `${app}:${module}:${action}`;

  const hasExact = accessMap[key];
  const hasWildcard = accessMap["*:*:*"]; // superadmin check

  return hasExact || hasWildcard ? children : null;
};

export default Can;

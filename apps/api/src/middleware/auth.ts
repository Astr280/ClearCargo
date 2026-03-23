import type { NextFunction, Request, Response } from "express";
import type { AuthSession, UserRole } from "../../../../packages/shared/src/index.js";
import { getSession, userHasRole } from "../services/auth.js";

function extractToken(request: Request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice("Bearer ".length);
}

export function requireSession(request: Request, response: Response, next: NextFunction) {
  const token = extractToken(request);
  const session = getSession(token);

  if (!session) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  response.locals.session = session satisfies AuthSession;
  next();
}

export function requireRoles(allowedRoles: UserRole[]) {
  return (_request: Request, response: Response, next: NextFunction) => {
    const session = response.locals.session as AuthSession | undefined;

    if (!session || !userHasRole(session.user.role, allowedRoles)) {
      response.status(403).json({ message: "You do not have permission to access this resource." });
      return;
    }

    next();
  };
}

export function getRequestSession(response: Response) {
  return response.locals.session as AuthSession;
}

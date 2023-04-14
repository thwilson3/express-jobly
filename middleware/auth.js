"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();
  return next();
}

/** Middleware to use to ensure user isAdmin.
 *
 * If not, raises Unauthorized.
 */

function ensureIsAdmin(req, res, next) {
  if (res.locals.user?.isAdmin === true) {
    return next();
  }
  throw new UnauthorizedError("Not authorized to access this.");
}

/** Middleware to use to ensure user current user or admin.
 *
 * If not, raises Unauthorized.
 */
function ensureThisUserOrAdmin(req, res, next) {
  console.log("res.locals", res.locals, "req.params", req.params);
  if ( res.locals?.user && (
    res.locals.user.isAdmin === true ||
    res.locals.user.username === req.params.username
  )) {
    return next();
  }
  throw new UnauthorizedError("Not authorized to access this.");
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureThisUserOrAdmin,
};

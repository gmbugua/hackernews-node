const jwt = require("jsonwebtoken");

// used to sign JSON Web Tokens issued to users
const APP_SECRET = "GraphQL-is-aw3some";

// verifies the user's JSON Web Token and
// if successful it returns the user's id
function getTokenPayload(token) {
  return jwt.verify(token, APP_SECRET);
}

/**
 * 
 * @param {*} req 
 * @param {*} authToken 
 * @returns userId of the user 
 * 
 * helper fn called in resolvers that require auth
 * fails if anything goes wrong
 */
function getUserId(req, authToken) {
  if (req) {

    const authHeader = req.headers.authorization;

    if (authHeader) {

      const token = authHeader.replace("Bearer ", "");
      
      if (!token) {
        throw new Error("No token found");
      }

      const { userId } = getTokenPayload(token);
      
      return userId;
    }

  } else if (authToken) {
    const { userId } = getTokenPayload(authToken);
    return userId;
  }

  throw new Error("Not authenticated");
}

module.exports = {
  APP_SECRET,
  getUserId,
};

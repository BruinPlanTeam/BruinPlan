const jwt = require('jsonwebtoken');

// middleware for future api routes to get saved plans
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  // return the auth header part of the token, or return undefined if the token is null
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401) // 401 status if not verified

  // verify the token using it and the token secret
  // this takes a callback with an error and the user value we serialized in the token. write error handling in callback
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
    if(err) return res.sendStatus(403)
    req.user = user
  next() // move on for the middleware
  })
}

module.exports = { authenticateToken };


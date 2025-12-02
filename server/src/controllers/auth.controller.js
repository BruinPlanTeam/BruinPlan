const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/database');

// I (Owen) took out the username because we don't need it for the sign up process


async function createUser(req, res) {
  const {username, email, password} = req.body
  if (!email || !username) return res.status(400).json({ error: 'email and username required' });

  try {
    // create hashed password with salt added at end in one step (10 default)
    const hashedPassword = await bcrypt.hash(password, 10)
    // post the user to the db with the hashed password
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword } 
    });
    return res.status(201).json(user);
  } catch(err){
    // prisma unique constraint error
    if (err && (err.code === 'P2002' || (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'))) {
      const target = err.meta && err.meta.target ? Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target : 'field';
      return res.status(409).json({ error: `Unique constraint failed on: ${target}` });
    }
    console.error('Error creating user', err)
    return res.status(500).json({ error: 'internal server error' })
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  try {
    // find user by email
    const user = await prisma.user.findUnique({
      where: { email }, // assumes email is unique in your prisma schema
    });

    if (!user) {
      // don't reveal whether email or password is wrong
      return res.status(401).json({ error: 'invalid email or password' });
    }

    // compare provided password with stored hash
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    // build a safe user object
    const { password: _password, ...safeUser } = user;

    // create jwt with user info payload
    const payload = { userId: user.id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h', // optional but recommended
    });

    return res.status(200).json({
      user: safeUser,
      token: accessToken,
    });
  } catch (err) {
    console.error('Error during login', err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  createUser,
  login
};


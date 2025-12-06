const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/database');


async function createUser(req, res) {
  const {username, password} = req.body
  if (!username) return res.status(400).json({ error: 'username required' });

  try {
    // create hashed password with salt added at end in one step (10 default)
    const hashedPassword = await bcrypt.hash(password, 10)
    // post the user to the db with the hashed password
    const user = await prisma.user.create({
      data: { username, password: hashedPassword } 
    });
    return res.status(201).json(user);
  } catch(err){
    // prisma unique constraint error
    if (err?.code === 'P2002' || (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) {
      const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
      return res.status(409).json({ error: `Unique constraint failed on: ${target}` });
    }
    console.error('Error creating user', err)
    return res.status(500).json({ error: 'internal server error' })
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  // basic validation
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    // find user by username
    const user = await prisma.user.findUnique({
      where: { username }, // username is unique in prisma schema
    });

    if (!user) {
      // don't reveal whether username or password is wrong
      return res.status(401).json({ error: 'invalid username or password' });
    }

    // compare provided password with stored hash
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid username or password' });
    }

    // build a safe user object
    const { password: _password, ...safeUser } = user;

    // create jwt with user info payload
    const payload = { userId: user.id, username: user.username };
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

async function updateUsername(req, res) {
  const userId = req.user.userId;
  const { username } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username }
    });

    const { password: _password, ...safeUser } = updated;
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createUser,
  login,
  updateUsername
};


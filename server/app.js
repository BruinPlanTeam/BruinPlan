require('dotenv').config()
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { PrismaClient} = require('@prisma/client');
const { hash } = require('crypto');
const prisma = new PrismaClient();


dotenv.config();

const app = express();
//This lets your app use json 
app.use(express.json())

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.use(cors({
    origin: 'http://localhost:5173' 
}));

app.use(express.json())

conn.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1); 
  } else {
    console.log('Connected to MySQL successfully.');
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.get('/majors', async (req, res) => {
  console.log('endpoint reached')
  try {
    const results = await prisma.major.findMany({
      select:{ 
        name: true
      }
    });
    const majorNames = results.map(major => major.name);
    res.json(majorNames)
  } catch (error){
    console.error("Error retrieving majors", error)
  }
});


app.get('/majors/:majorName', async (req, res) => {
  const majorName = req.params.majorName;

  const majorRecord = await prisma.major.findFirst({
        where: { name: majorName },
        select: { id: true }
    });

    if (!majorRecord) {
        return res.status(404).json({ error: `Major "${majorName}" not found.` });
    }
    
    const majorId = majorRecord.id;


  try {
    const data = await prisma.majorRequirement.findMany({
      where: { majorId: majorId },
      include: {
        req: { 
          include: {
            requirementClasses: {
              include: {
                class: {
                  include: {
                    prereqs: {
                      select: { 
                        prereqId: true 
                      }
                    }
                    }
                  }
                }
              }
            }
          }
      }
    });

    if(data.length === 0){
      throw Error("No major requirements found")
    }
    
    const  uniqueClassesMap = new Map(); 

    const majorRequirementsMap = new Map();

    for (const majorReq of data) {
        const req = majorReq.req;
        
       
        majorRequirementsMap.set(req.id, {
            id: req.id,
            name: req.name,
            type: req.type,
            coursesToChoose: req.coursesToChoose,
            fulfilledByClassIds: []
        });
        
        
        for (const reqClass of req.requirementClasses) {
            const classData = reqClass.class;
            
            majorRequirementsMap.get(req.id).fulfilledByClassIds.push(classData.id);

            if (!uniqueClassesMap.has(classData.id)) {
                const prereqIds = classData.prereqs.map(p => p.prereqId);
                
                uniqueClassesMap.set(classData.id, {
                    id: String(classData.id),
                    code: classData.code,
                    units: classData.units,
                    description: classData.description,
                    prereqIds: prereqIds,
                    fulfillsReqIds: [] 
                });
            }
            
            uniqueClassesMap.get(classData.id).fulfillsReqIds.push(req.id);
        }
    }

    const majorRequirements = Array.from(majorRequirementsMap.values());
    const availableClasses = Array.from(uniqueClassesMap.values());
    // Add a separator to make the output easy to spot!
    console.log("--- DATA RETRIEVAL SUCCESS ---");
    console.log("Major Name:", majorName);

    // Use JSON.stringify for clean, un-truncated output
    console.log("Available Classes (JSON):", JSON.stringify(availableClasses, null, 2)); 
    console.log("Major Requirements (JSON):", JSON.stringify(majorRequirements, null, 2));
    return res.json({
        availableClasses: availableClasses,
        majorRequirements: majorRequirements,
    });

  } catch (error) {
    console.error(`Prisma error fetching major plan for ID ${majorId}:`, error);
    return res.status(500).json({ error: "An internal server error occurred while retrieving the degree plan." });
  }
});

app.post('/users',async (req,res) => {
  const {email, username, password} = req.body
  if (!username || !email) return res.status(400).json({ error: 'name and email required' });

  try {
    //Create hashed password with salt added at end in one step (10 default)
    const hashedPassword = await bcrypt.hash(password, 10)
    //Post the user to the DB with the hashed password
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword } 
    });
    return res.status(201).json(user);
  } catch(err){
    // Prisma unique constraint error
    if (err && (err.code === 'P2002' || (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'))) {
      const target = err.meta && err.meta.target ? Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target : 'field';
      return res.status(409).json({ error: `Unique constraint failed on: ${target}` });
    }
    console.error('Error creating user', err)
    return res.status(500).json({ error: 'internal server error' })
  }
})

//Middleware for future API routes to get saved plans
  //When you write the 
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  //Return the auth header part of the token, or return undefined if the token is null
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401) //401 status if not verified

  //Verify the token using it and the token secret
  //This takes a callback with an error and the user value we serialized in the token. write error handling in calback
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
    if(err) return res.sendStatus(403)
    req.user = user
  next() //Move on for the middleware
  })
}

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  //basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  try {
    //look for user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid email or password' });
    }
    //check pw
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    //send safe object to user
    const { password, ...safeUser } = user;

    //create JWT that saves user info inside of it as payload
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken: accessToken})

    //Send JWT and user
    return res.status(200).json({
      user: safeUser,
      token: accessToken
    });
  } catch (err) {
    console.error('Error during login', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = app;
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');


const { PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();


dotenv.config();

const app = express();
const PORT = 3000

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


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

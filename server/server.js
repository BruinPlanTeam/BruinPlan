<<<<<<< HEAD
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json()); 

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

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
    res.json(majorNames);
  } catch (error) {
    console.error("Error retrieving majors", error);
    res.status(500).json({ error: "Error retrieving majors" });
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
                        prereqId: true,
                        prereqGroupNumber: true
                      }
                    }
                  }
                }
              }
            },
            RequirementsInGroup: {
              include: {
                RequirementGroup: true
              }
            }
          }
        }
      }
    });

    if (data.length === 0) {
      console.warn(`No major requirements found for ${majorName}`);
      return res.json({
        availableClasses: [],
        majorRequirements: [],
        requirementGroups: []
      });
    }

    const uniqueClassesMap = new Map();
    const majorRequirementsMap = new Map();
    const uniqueGroupsMap = new Map();

    for (const majorReq of data) {
      const req = majorReq.req;
      const groupIds = [];

      for (const groupLink of req.RequirementsInGroup) {
        const group = groupLink.RequirementGroup;
        groupIds.push(group.id);

        if (!uniqueGroupsMap.has(group.id)) {
          uniqueGroupsMap.set(group.id, {
            id: group.id,
            name: group.name,
            total: group.total,
            highNumberInReq: group.highNumberInReq,
            lowNumberInReq: group.lowNumberInReq,
            numberOfHighReqs: group.numberOfHighReqs,
            numberOfLowReqs: group.numberOfLowReqs,
            requirementIds: []
          });
        }
        uniqueGroupsMap.get(group.id).requirementIds.push(req.id);
      }

      majorRequirementsMap.set(req.id, {
        id: req.id,
        name: req.name,
        type: req.type,
        coursesToChoose: req.coursesToChoose,
        fulfilledByClassIds: [],
        groupIds: groupIds
      });

      for (const reqClass of req.requirementClasses) {
        const classData = reqClass.class;

        majorRequirementsMap.get(req.id).fulfilledByClassIds.push(String(classData.id));

        if (!uniqueClassesMap.has(classData.id)) {
          
          
          const prereqGroups = {};
          for (const p of classData.prereqs) {
            const groupNum = String(p.prereqGroupNumber);
            if (!prereqGroups[groupNum]) {
              prereqGroups[groupNum] = [];
            }
            prereqGroups[groupNum].push(String(p.prereqId));
          }

          const flatPrereqIds = classData.prereqs.map(p => String(p.prereqId));

          uniqueClassesMap.set(classData.id, {
            id: String(classData.id),
            code: classData.code,
            units: classData.units,
            description: classData.description,
            prereqIds: flatPrereqIds,    
            prereqGroups: prereqGroups, 
            fulfillsReqIds: []
          });
        }

        uniqueClassesMap.get(classData.id).fulfillsReqIds.push(req.id);
      }
    }

    const majorRequirements = Array.from(majorRequirementsMap.values());
    const availableClasses = Array.from(uniqueClassesMap.values());
    const requirementGroups = Array.from(uniqueGroupsMap.values());

    for (const group of requirementGroups) {
      group.requirementIds = [...new Set(group.requirementIds)];
    }

    console.log(`--- DATA RETRIEVAL SUCCESS for ${majorName} ---`);
    
    return res.json({
      availableClasses: availableClasses,
      majorRequirements: majorRequirements,
      requirementGroups: requirementGroups
    });

  } catch (error) {
    console.error(`Prisma error fetching major plan for ID ${majorId}:`, error);
    return res.status(500).json({ error: "An internal server error occurred while retrieving the degree plan." });
  }
});
// --- END MODIFIED ENDPOINT ---
=======
const app = require('./app');
>>>>>>> 932c48b (refactored second Then, should be browser simulated)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
/**
 * Script to import scraped major data into the database
 * 
 * Usage: node scripts/importMajorData.js <path-to-json-file>
 * Example: node scripts/importMajorData.js ../scraper/output/african_american_studies_requirements.json
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importMajorData(jsonFilePath) {
  try {
    console.log(`Reading data from ${jsonFilePath}...`);
    
    // Read the JSON file
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`Found major: ${data.major_name}`);
    console.log(`School: ${data.school}`);
    console.log(`Requirements: ${data.requirements.length}`);
    console.log(`Requirement Groups: ${data.requirementGroups.length}`);
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create or update the Major
      let major = await tx.major.findFirst({
        where: { name: data.major_name }
      });
      
      if (major) {
        console.log(`Major "${data.major_name}" already exists (ID: ${major.id}), updating...`);
        major = await tx.major.update({
          where: { id: major.id },
          data: { school: data.school }
        });
      } else {
        console.log(`Creating new major "${data.major_name}"...`);
        major = await tx.major.create({
          data: {
            name: data.major_name,
            school: data.school
          }
        });
      }
      
      // 2. Process all classes first (create or get existing)
      const classMap = new Map(); // Map from code to class ID
      const allClasses = [];
      
      // Collect all classes from requirements
      for (const req of data.requirements) {
        if (req.classes) {
          allClasses.push(...req.classes);
        }
      }
      
      // Collect all classes from requirement groups
      for (const group of data.requirementGroups) {
        if (group.classes) {
          allClasses.push(...group.classes);
        }
      }
      
      console.log(`Processing ${allClasses.length} classes...`);
      
      for (const classData of allClasses) {
        if (classMap.has(classData.code)) {
          continue; // Already processed
        }
        
        // Check if class already exists
        let classRecord = await tx.class.findUnique({
          where: { code: classData.code }
        });
        
        if (classRecord) {
          console.log(`  Class "${classData.code}" already exists (ID: ${classRecord.id})`);
          classMap.set(classData.code, classRecord.id);
        } else {
          console.log(`  Creating class "${classData.code}"...`);
          classRecord = await tx.class.create({
            data: {
              code: classData.code,
              description: classData.description || classData.code,
              units: classData.units || 4.0
            }
          });
          classMap.set(classData.code, classRecord.id);
        }
      }
      
      // 3. Process Requirements
      console.log(`Processing ${data.requirements.length} requirements...`);
      let displayOrder = 1;
      
      for (const reqData of data.requirements) {
        // Create or find requirement
        let requirement = await tx.requirement.findFirst({
          where: {
            name: reqData.name,
            type: reqData.type
          }
        });
        
        if (!requirement) {
          console.log(`  Creating requirement "${reqData.name}"...`);
          requirement = await tx.requirement.create({
            data: {
              name: reqData.name,
              type: reqData.type,
              coursesToChoose: reqData.coursesToChoose || 1
            }
          });
        } else {
          console.log(`  Requirement "${reqData.name}" already exists (ID: ${requirement.id})`);
        }
        
        // Link requirement to major
        const existingMajorReq = await tx.majorRequirement.findUnique({
          where: {
            majorId_reqId: {
              majorId: major.id,
              reqId: requirement.id
            }
          }
        });
        
        if (!existingMajorReq) {
          await tx.majorRequirement.create({
            data: {
              majorId: major.id,
              reqId: requirement.id,
              displayOrder: displayOrder++
            }
          });
        }
        
        // Link classes to requirement
        if (reqData.classes) {
          for (const classData of reqData.classes) {
            const classId = classMap.get(classData.code);
            if (!classId) {
              console.warn(`    Warning: Class "${classData.code}" not found in classMap`);
              continue;
            }
            
            // Check if already linked
            const existing = await tx.requirementClasses.findUnique({
              where: {
                reqId_classId: {
                  reqId: requirement.id,
                  classId: classId
                }
              }
            });
            
            if (!existing) {
              await tx.requirementClasses.create({
                data: {
                  reqId: requirement.id,
                  classId: classId
                }
              });
            }
          }
          console.log(`    Linked ${reqData.classes.length} classes to "${reqData.name}"`);
        }
      }
      
      // 4. Process Requirement Groups (if any)
      if (data.requirementGroups && data.requirementGroups.length > 0) {
        console.log(`Note: RequirementGroups found but not yet implemented in schema.`);
        console.log(`You may need to add a RequirementGroup model to your Prisma schema.`);
        // TODO: Implement RequirementGroup import when schema is updated
      }
      
      console.log('\n✅ Import completed successfully!');
    });
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node importMajorData.js <path-to-json-file>');
    console.error('Example: node importMajorData.js ../scraper/output/african_american_studies_requirements.json');
    process.exit(1);
  }
  
  const jsonFilePath = path.resolve(args[0]);
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`Error: File not found: ${jsonFilePath}`);
    process.exit(1);
  }
  
  importMajorData(jsonFilePath)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { importMajorData };


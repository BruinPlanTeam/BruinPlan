const { prisma } = require('../config/database');

// this method is to sort the data into a flatter more frontend friendly structure
function processMajorRequirements(major) {
  // instantiate the map and array for classes and req groups we need to return
  const classesById = new Map(); // map used to avoid duplicate classes being added
  const majorRequirementGroups = [];

  // iterate through every major req group
  for (const majorReqGroup of major.MajorRequirementGroup) {
    // extract the requirement group from the major req group
    const reqGroup = majorReqGroup.RequirementGroup;
    const requirements = [];

    // iterate through every requirement in the requirement group
    for (const reqInGroup of reqGroup.requirementsInGroup) {
      const requirement = reqInGroup.requirement;
      const fulfilledByClassIds = [];

      // iterate through every requirement class in the requirement
      for (const reqClass of requirement.requirementClasses) {
        // get class object from join table
        const classData = reqClass.class;
        const classId = classData.id;
        
        // add the class id to the array of class ids that fulfill the requirement
        fulfilledByClassIds.push(classId);

        // work through the prereq logic here
        if (!classesById.has(classId)) {
          // map prereq group numbers to array of prereq ids
          // within each prereq group is an OR
          // each prereq group is an AND
          const prereqGroupsMap = new Map(); 
          const prereqRecords = classData.requiredFor || [];

          // for each prereq record, add the prereq id to the array of prereq ids for the prereq group number
          for (const prereq of prereqRecords) {
            if (!prereqGroupsMap.has(prereq.prereqGroupNumber)) {
              prereqGroupsMap.set(prereq.prereqGroupNumber, []);
            }
            prereqGroupsMap.get(prereq.prereqGroupNumber).push(prereq.prereqId);
          }

          // convert the map to an array of arrays of prereq ids
          const prereqGroups = Array.from(prereqGroupsMap.values());

          classesById.set(classId, {
            id: String(classId),
            code: classData.code,
            units: classData.units,
            description: classData.description,
            prereqGroups,
            fulfillsReqIds: []
          });
        }
        
        // push on req id to the array of req ids that the class fulfills
      classesById.get(classId).fulfillsReqIds.push(requirement.id);
      }

      // add the requirement to the requirement array for the group
      requirements.push({
        id: requirement.id,
        name: requirement.name,
        coursesToChoose: requirement.coursesToChoose,
        fulfilledByClassIds: fulfilledByClassIds
      });
    }

    // add the req group to the req group array
    majorRequirementGroups.push({
      id: reqGroup.id,
      name: reqGroup.name,
      type: reqGroup.type,
      numRequirementsToChoose: reqGroup.numRequirementsToChoose,
      requirements: requirements
    });
  }

  // return the classes as an array and req groups as an array
  return {
    availableClasses: Array.from(classesById.values()),
    majorRequirementGroups: majorRequirementGroups
  };
}



// used for the homepage search bar
async function getAllMajors(req, res) {
  try {
    // load all majors from database and pull out just the names
    const results = await prisma.major.findMany({
      select:{ 
        name: true
      }
    });
    //map results to an arrray
    const majorNames = results.map(major => major.name);
    res.json(majorNames)
  } catch (error){
    console.error("Error retrieving majors", error)
  }
}

// once a major is selected, load all the requirements for that major (with the classes that can fulfill them)
async function getMajorByName(req, res) {
  const majorName = req.params.majorName;

  try {
    // eagerly loads all the data from the database, entering each table in the linear order of the schema
    const major = await prisma.major.findFirst({
      where: { name: majorName },
      include: {
        MajorRequirementGroup: {
          include: {
            RequirementGroup: {
              include: {
                requirementsInGroup: {
                  include: {
                    requirement: {
                      include: {
                        requirementClasses: {
                          include: {
                            class: {
                              include: {
                                requiredFor: {
                                  select: {
                                    prereqId: true,
                                    prereqGroupNumber: true
                                  }
                                }
                              }
                            }
                          }
                        }
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

    // return an error if the data is not found
    if (!major) {
      return res.status(404).json({ error: `Major "${majorName}" not found.` });
    }

    // return an error if no req groups are found 
    if (major.MajorRequirementGroup.length === 0) {
      return res.status(404).json({ error: `No requirement groups found for major "${majorName}".` });
    }

    //use a separate method to procces the data for the frontend (major is a deeply nested object))
    const { availableClasses, majorRequirementGroups } = processMajorRequirements(major);

    // return the data destructured from the processMajorRequirements method
    return res.json({
      availableClasses: availableClasses,
      majorRequirementGroups: majorRequirementGroups
    });

  } catch (error) {
    // return an error if there happens to be a pesky error
    console.error(`Error fetching major plan for "${majorName}":`, error);
    return res.status(500).json({ 
      error: "An internal server error occurred while retrieving the degree plan." 
    });
  }
}

// export the controller methods
module.exports = {
  getAllMajors,
  getMajorByName
};


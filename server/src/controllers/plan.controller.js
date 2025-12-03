const { prisma } = require('../config/database');

async function createPlan(req, res) {
  try {
    const { name, majorName, quarters } = req.body;
    const userId = req.user.userId; // from JWT

    // validate input
    if (!name || !majorName || !quarters) {
      return res.status(400).json({ error: "Missing required fields: name, majorName, quarters" });
    }

    // look up major id
    const major = await prisma.major.findFirst({
      where: { name: majorName }
    });

    if (!major) {
      return res.status(404).json({ error: "Major not found" });
    }

    // create plan with nested quarters and planClasses
    const plan = await prisma.plan.create({
      data: {
        name,
        userId,
        majorId: major.id,
        quarters: {
          create: quarters.map(q => ({
            quarterNumber: q.quarterNumber,
            planClasses: {
              create: q.classIds.map(classId => ({
                classId,
                status: "planned"
              }))
            }
          }))
        }
      },
      include: {
        quarters: {
          include: {
            planClasses: true
          }
        }
      }
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error('Error saving plan:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getPlans(req, res) {
  const userId = req.user.userId;
  const plans = await prisma.plan.findMany({
    where: { userId },
    include: { 
      major: true,
      quarters: {
        include: {
          planClasses: {
            include: {
              class: true  
            }
          }
        },
        orderBy: {
          quarterNumber: 'asc'
        }
      }
    }
  });
  return res.status(200).json(plans);
}

async function updatePlan(req, res) {
  const planId = parseInt(req.params.planId);
  const userId = req.user.userId;
  const { name, majorName, quarters } = req.body;

  try {
    // find existing plan and verify ownership
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { quarters: true }
    });

    if (!existingPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    if (existingPlan.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this plan" });
    }

    // look up major id if majorName provided
    let majorId = existingPlan.majorId;
    if (majorName) {
      const major = await prisma.major.findFirst({
        where: { name: majorName }
      });
      if (!major) {
        return res.status(404).json({ error: "Major not found" });
      }
      majorId = major.id;
    }

    // delete existing quarters and planClasses (we'll recreate them)
    const quarterIds = existingPlan.quarters.map(q => q.id);
    if (quarterIds.length > 0) {
      await prisma.planClass.deleteMany({
        where: { quarterId: { in: quarterIds } }
      });
      await prisma.quarter.deleteMany({
        where: { planId: planId }
      });
    }

    // update plan with new data
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: name || existingPlan.name,
        majorId,
        quarters: {
          create: quarters.map(q => ({
            quarterNumber: q.quarterNumber,
            planClasses: {
              create: q.classIds.map(classId => ({
                classId,
                status: "planned"
              }))
            }
          }))
        }
      },
      include: {
        major: true,
        quarters: {
          include: {
            planClasses: {
              include: {
                class: true
              }
            }
          },
          orderBy: {
            quarterNumber: 'asc'
          }
        }
      }
    });

    return res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function deletePlan(req, res) {
  const planId = parseInt(req.params.planId);
  const userId = req.user.userId;
  
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { quarters: true }
    });
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    // verify ownership
    if (plan.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this plan" });
    }
    
    // delete in order: PlanClasses -> Quarters -> Plan (due to foreign key constraints)
    const quarterIds = plan.quarters.map(q => q.id);
    
    if (quarterIds.length > 0) {
      // delete all PlanClasses for this plan's quarters
      await prisma.planClass.deleteMany({
        where: { quarterId: { in: quarterIds } }
      });
      
      // delete all quarters for this plan
      await prisma.quarter.deleteMany({
        where: { planId: planId }
      });
    }
    
    // finally delete the plan
    await prisma.plan.delete({
      where: { id: planId }
    });
    
    return res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createPlan,
  getPlans,
  updatePlan,
  deletePlan
};


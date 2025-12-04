import { useState, useEffect, useMemo } from 'react';

const CATEGORY_PRIORITY = ['Prep', 'Major', 'Tech Breadth', 'Sci-Tech', 'GE'];

// small helper to get display name for a requirement
const getDisplayName = (name) => {
  if (!name) return '';
  const parts = name.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1] : name;
};

// small helper to build a stable key for droppable zone contents
const buildZonesKey = (droppableZones) => {
  return JSON.stringify(
    Object.values(droppableZones || {}).map(zone =>
      (zone.items || []).map(item => item.id)
    )
  );
};

// normalize a requirement group into one of the known categories
const normalizeGroupType = (group) => {
  let category = group.type;
  const groupName = (group.name || '').toLowerCase();

  if (groupName.includes('sci-tech')) {
    category = 'Sci-Tech';
  } else if (!CATEGORY_PRIORITY.includes(category)) {
    category = 'GE';
  }

  return category;
};

// turn zones into a flat, ordered list of course entries
const flattenZonesToCourses = (zones) => {
  const courses = [];

  Object.entries(zones || {})
    .map(([zoneId, zone]) => {
      const [, rowStr, colStr] = zoneId.split('-');
      const row = parseInt(rowStr, 10);
      const col = parseInt(colStr, 10);
      return {
        zoneId,
        zone,
        row: Number.isFinite(row) ? row : Number.MAX_SAFE_INTEGER,
        col: Number.isFinite(col) ? col : Number.MAX_SAFE_INTEGER
      };
    })
    .sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    })
    .forEach(entry => {
      (entry.zone.items || []).forEach((item, index) => {
        courses.push({
          item,
          order: entry.row * 1000 + entry.col * 100 + index,
          eligibleRequirementIndices: [],
          assignedRequirementId: null,
          optionCount: 0
        });
      });
    });

  return courses;
};

// build a flat list of requirements, ordered by category priority
const buildOrderedRequirements = (requirementGroups) => {
  const ordered = [];

  CATEGORY_PRIORITY.forEach(category => {
    (requirementGroups || [])
      .filter(group => normalizeGroupType(group) === category)
      .forEach(group => {
        (group.requirements || []).forEach(req => {
          ordered.push({
            id: req.id,
            requirement: req,
            group,
            remaining: req.coursesToChoose || 1
          });
        });
      });
  });

  return ordered;
};

// assign requirements to courses so each course fills at most one requirement
const assignRequirementsToCourses = (courses, orderedRequirements) => {
  if (!courses.length || !orderedRequirements.length) return;

  const requirementSets = orderedRequirements.map(entry => new Set(
    (entry.requirement.fulfilledByClassIds || []).map(id => String(id))
  ));

  courses.forEach(courseData => {
    const courseId = String(courseData.item.id);
    courseData.eligibleRequirementIndices = requirementSets
      .map((set, idx) => set.has(courseId) ? idx : null)
      .filter(idx => idx !== null);
    courseData.optionCount = courseData.eligibleRequirementIndices.length;
  });

  const remainingSlots = orderedRequirements.map(entry => entry.remaining);

  orderedRequirements.forEach((_, requirementIndex) => {
    while (remainingSlots[requirementIndex] > 0) {
      const eligibleCourses = courses.filter(
        course =>
          !course.assignedRequirementId &&
          course.eligibleRequirementIndices.includes(requirementIndex)
      );

      if (!eligibleCourses.length) break;

      eligibleCourses.sort((a, b) => {
        if (a.optionCount !== b.optionCount) {
          return a.optionCount - b.optionCount;
        }
        return a.order - b.order;
      });

      const selectedCourse = eligibleCourses[0];
      selectedCourse.assignedRequirementId = orderedRequirements[requirementIndex].id;
      remainingSlots[requirementIndex] -= 1;
    }
  });
};

// hook to compute requirement progress from requirement groups and planned courses
// completedClasses: Set of class ids for quarter 0 (completed before plan)
// allClassesMap: Map from classId (string) -> full course object
export function useRequirementProgress(
  requirementGroups,
  droppableZones,
  completedClasses = new Set(),
  allClassesMap = {}
) {
  const [progressByType, setProgressByType] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  const zonesKey = useMemo(
    () => buildZonesKey(droppableZones),
    [droppableZones]
  );

  useEffect(() => {
    if (!requirementGroups || requirementGroups.length === 0) {
      setProgressByType({});
      setOverallProgress(0);
      return;
    }

    // flatten zones to a simple, ordered course list
    const planCourses = flattenZonesToCourses(droppableZones || {});

    // add quarter 0 (completed) classes as virtual courses at the beginning
    const completedEntries = [];
    if (completedClasses && completedClasses.size > 0) {
      Array.from(completedClasses).forEach((id, index) => {
        const course = allClassesMap[String(id)];
        if (course) {
          completedEntries.push({
            item: course,
            order: -1000 + index,
            eligibleRequirementIndices: [],
            assignedRequirementId: null,
            optionCount: 0
          });
        }
      });
    }

    const courses = [...completedEntries, ...planCourses];

    const orderedRequirements = buildOrderedRequirements(requirementGroups);
    assignRequirementsToCourses(courses, orderedRequirements);

    const typeGroups = {};
    let totalRequired = 0;
    let totalCompleted = 0;

    requirementGroups.forEach(group => {
      const type = group.type;

      if (!typeGroups[type]) {
        typeGroups[type] = {
          type,
          groups: [],
          completed: 0,
          total: 0
        };
      }

      const groupEntry = {
        id: group.id,
        name: group.name,
        numRequirementsToChoose: group.numRequirementsToChoose || 1,
        requirements: [],
        completed: 0,
        total: 0
      };

      const numRequirementsToChoose = group.numRequirementsToChoose || 1;

      // compute progress for each requirement in this group using assignments
      (group.requirements || []).forEach(req => {
        const requiredCourses = req.fulfilledByClassIds || [];
        const coursesToChoose = req.coursesToChoose || 1;

        const assignedCourses = courses.filter(course => {
          if (!course || !course.assignedRequirementId) return false;
          const matchesRequirement = course.assignedRequirementId === req.id;
          const isEligible = requiredCourses.some(
            id => String(id) === String(course.item.id)
          );
          return matchesRequirement && isEligible;
        });

        const completed = Math.min(assignedCourses.length, coursesToChoose);
        const isComplete = completed >= coursesToChoose;

        groupEntry.requirements.push({
          id: req.id,
          name: req.name,
          displayName: getDisplayName(req.name),
          completed,
          total: coursesToChoose,
          isComplete
        });
      });

      // sort requirements in this group:
      // - highest percent finished first
      // - tie‑break on highest total required
      groupEntry.requirements.sort((a, b) => {
        const aTotal = a.total || 0;
        const bTotal = b.total || 0;
        const aPct = aTotal > 0 ? a.completed / aTotal : 0;
        const bPct = bTotal > 0 ? b.completed / bTotal : 0;

        if (bPct !== aPct) {
          return bPct - aPct;
        }

        return bTotal - aTotal;
      });

      // now roll requirement progress up to the group and type levels
      if (groupEntry.requirements.length === 1) {
        // single requirement group: treat it like a leaf
        const req = groupEntry.requirements[0];
        groupEntry.groupCompleted = req.completed;
        groupEntry.groupTotal = req.total;

        typeGroups[type].completed += req.completed;
        typeGroups[type].total += req.total;
        totalRequired += req.total;
        totalCompleted += req.completed;
      } else {
        if (numRequirementsToChoose === 1) {
          // only one requirement must be met: use the max progress among them
          const maxCompleted = Math.max(
            ...groupEntry.requirements.map(r => r.completed)
          );
          const maxTotal = Math.max(
            ...groupEntry.requirements.map(r => r.total)
          );

          groupEntry.groupCompleted = maxCompleted;
          groupEntry.groupTotal = maxTotal;

          typeGroups[type].completed += maxCompleted;
          typeGroups[type].total += maxTotal;
          totalRequired += maxTotal;
          totalCompleted += maxCompleted;
        } else {
          // multiple requirements must be met: count how many are fully complete
          const numCompletedRequirements = groupEntry.requirements.filter(
            r => r.isComplete
          ).length;

          const groupCompleted = Math.min(
            numCompletedRequirements,
            numRequirementsToChoose
          );
          const groupTotal = numRequirementsToChoose;

          groupEntry.groupCompleted = groupCompleted;
          groupEntry.groupTotal = groupTotal;

          const coursesPerRequirement = groupEntry.requirements[0]?.total || 1;
          const totalCoursesRequired =
            numRequirementsToChoose * coursesPerRequirement;

          const completedCourses = groupEntry.requirements
            .filter(r => r.isComplete)
            .reduce((sum, r) => sum + r.completed, 0);

          const completedCoursesCapped = Math.min(
            completedCourses,
            totalCoursesRequired
          );

          typeGroups[type].completed += completedCoursesCapped;
          typeGroups[type].total += totalCoursesRequired;
          totalRequired += totalCoursesRequired;
          totalCompleted += completedCoursesCapped;
        }
      }

      typeGroups[type].groups.push(groupEntry);
    });

    // within each type, sort groups by:
    // - highest percent finished first
    // - then highest groupTotal
    Object.values(typeGroups).forEach(typeEntry => {
      typeEntry.groups.sort((a, b) => {
        const aCompleted = a.groupCompleted || 0;
        const bCompleted = b.groupCompleted || 0;
        const aTotal = a.groupTotal || 0;
        const bTotal = b.groupTotal || 0;

        const aPct = aTotal > 0 ? aCompleted / aTotal : 0;
        const bPct = bTotal > 0 ? bCompleted / bTotal : 0;

        if (bPct !== aPct) {
          return bPct - aPct;
        }

        return bTotal - aTotal;
      });
    });

    setProgressByType(typeGroups);
    setOverallProgress(
      totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0
    );
  }, [requirementGroups, droppableZones, zonesKey, completedClasses, allClassesMap]);

  return {
    progressByType,
    overallProgress,
    getDisplayName
  };
}



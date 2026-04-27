let needs = [
  { id: 1, type: 'food', location: { name: 'Sector 15', lat: 28.62, lng: 77.21 }, urgencyScore: 85, summary: 'Extreme food shortage reported.' },
  { id: 2, type: 'medical', location: { name: 'Block B', lat: 28.63, lng: 77.22 }, urgencyScore: 95, summary: 'Emergency medical assistance needed for 10 people.' },
  { id: 3, type: 'shelter', location: { name: 'Railway Station', lat: 28.61, lng: 77.20 }, urgencyScore: 60, summary: 'Homeless group needing temporary shelter.' }
];

let volunteers = [
  { id: 1, name: 'Dr. Sarah', skills: ['medical'], location: { lat: 28.60, lng: 77.19 }, available: true },
  { id: 2, name: 'John Doe', skills: ['logistics', 'general help'], location: { lat: 28.64, lng: 77.23 }, available: true },
  { id: 3, name: 'Emma Wilson', skills: ['food', 'education'], location: { lat: 28.62, lng: 77.21 }, available: true }
];

let assignments = [];

const getNeeds = () => needs;
const getVolunteers = () => volunteers;

const calculateDistance = (loc1, loc2) => {
  const dx = loc1.lat - loc2.lat;
  const dy = loc1.lng - loc2.lng;
  return Math.sqrt(dx * dx + dy * dy);
};

const autoAssign = () => {
  assignments = [];
  const sortedNeeds = [...needs].sort((a, b) => b.urgencyScore - a.urgencyScore);
  const availableVolunteers = volunteers.filter(v => v.available);

  sortedNeeds.forEach(need => {
    let bestMatch = null;
    let highestScore = -1;

    availableVolunteers.forEach(volunteer => {
      const skillMatch = volunteer.skills.includes(need.type) ? 50 : 0;
      const distance = calculateDistance(volunteer.location, need.location);
      const distanceScore = Math.max(0, 50 - (distance * 100)); // Simple penalty

      const totalScore = skillMatch + distanceScore;

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestMatch = volunteer;
      }
    });

    if (bestMatch) {
      assignments.push({
        needId: need.id,
        volunteerId: bestMatch.id,
        volunteerName: bestMatch.name,
        matchScore: highestScore
      });
      // In a real app, we'd mark them as unavailable
      // bestMatch.available = false; 
    }
  });

  return assignments;
};

const addNeed = (need) => {
  const newNeed = { ...need, id: Date.now() };
  needs.push(newNeed);
  return newNeed;
};

module.exports = {
  getNeeds,
  getVolunteers,
  autoAssign,
  addNeed
};

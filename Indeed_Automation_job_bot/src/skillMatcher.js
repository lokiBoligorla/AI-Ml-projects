const stringSimilarity = require('string-similarity');

/**
 * Calculates a match score between the required skills in a job description 
 * and the user's skill profile.
 * 
 * @param {string} userSkills - Comma separated list of user skills.
 * @param {string} jobDescription - Full text of the job description.
 * @returns {number} Score from 0 to 100 representing match percentage.
 */
function calculateMatchScore(userSkills, jobDescription) {
    if (!userSkills || !jobDescription) return 0;

    const skillsArray = userSkills.split(',').map(s => s.trim().toLowerCase());
    const jobTextLower = jobDescription.toLowerCase();

    if(skillsArray.length === 0) return 0;

    let matchedSkills = [];
    
    // Skill aliases for better matching
    const aliases = {
        'js': 'javascript',
        'javascript': 'js',
        'py': 'python',
        'react': 'react.js',
        'aws': 'amazon web services',
        'db': 'database'
    };

    skillsArray.forEach(skill => {
        const skillLower = skill.toLowerCase();
        const alias = aliases[skillLower];

        // Check for direct match or alias match
        const hasSkill = jobTextLower.includes(skillLower) || (alias && jobTextLower.includes(alias));
        
        if (hasSkill) {
            matchedSkills.push(skill);
        } else {
            // Fuzzy word boundary check for skills like "Python" vs "Python3"
            const regex = new RegExp(`\\b${skillLower}\\b`, 'i');
            if(regex.test(jobTextLower)) {
                matchedSkills.push(skill);
            }
        }
    });

    // SCORING LOGIC: 
    // We don't want to penalize a user for having 10 skills if the job only lists 4.
    // If we find 3-4 matches, it's usually a very solid job.
    // We use a "normalized" denominator (limited to 5) to ensure 3-4 matches equals a high score.
    const denominator = Math.min(skillsArray.length, 5); 
    const score = Math.round((matchedSkills.length / denominator) * 100);
    
    return { 
        score: Math.min(score, 100), 
        matchedSkills 
    };
}

module.exports = { calculateMatchScore };

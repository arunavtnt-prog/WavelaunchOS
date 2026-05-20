#!/usr/bin/env node

// Comprehensive verification script for business plan generation
const { PrismaClient } = require('@prisma/client');

// All Client fields from schema
const clientFields = [
  'id', 'fullName', 'email', 'instagramHandle', 'tiktokHandle', 'country',
  'industryNiche', 'age', 'professionalMilestones', 'personalTurningPoints',
  'visionForVenture', 'hopeToAchieve', 'targetAudience', 'demographicProfile',
  'targetDemographicAge', 'audienceGenderSplit', 'audienceMaritalStatus',
  'currentChannels', 'keyPainPoints', 'brandValues', 'differentiation',
  'uniqueValueProps', 'emergingCompetitors', 'idealBrandImage',
  'inspirationBrands', 'brandingAesthetics', 'emotionsBrandEvokes',
  'brandPersonality', 'preferredFont', 'productCategories', 'otherProductIdeas',
  'scalingGoals', 'growthStrategies', 'longTermVision', 'specificDeadlines',
  'additionalInfo', 'status', 'onboardedAt', 'createdAt', 'updatedAt', 'deletedAt'
];

console.log('✅ All Client Schema Fields:');
console.log(clientFields.join(', '));
console.log(`Total: ${clientFields.length} fields`);

// Business plan template field usage verification
const businessPlanTemplate = `
fullName
industryNiche
visionForVenture
hopeToAchieve
targetAudience
demographicProfile
targetDemographicAge
audienceGenderSplit
audienceMaritalStatus
currentChannels
keyPainPoints
brandValues
differentiation
uniqueValueProps
emergingCompetitors
idealBrandImage
inspirationBrands
brandingAesthetics
emotionsBrandEvokes
brandPersonality
preferredFont
scalingGoals
growthStrategies
longTermVision
specificDeadlines
professionalMilestones
personalTurningPoints
instagramHandle
tiktokHandle
`;

console.log('\n✅ Business Plan Template Fields Used:');
const templateFields = businessPlanTemplate.match(/\w+/g);
console.log([...new Set(templateFields)].join(', '));
console.log(`Total: ${templateFields.length} unique fields`);

console.log('\n🔍 Field Verification:');
clientFields.forEach(field => {
  const used = businessPlanTemplate.includes(field);
  console.log(`${used ? '✅' : '❌'} ${field}`);
});

console.log('\n📊 Summary:');
const usedFields = clientFields.filter(field => businessPlanTemplate.includes(field));
console.log(`✅ Used: ${usedFields.length}/${clientFields.length} fields`);
console.log(`❌ Missing: ${clientFields.length - usedFields.length} fields`);

const unusedFields = clientFields.filter(field => !businessPlanTemplate.includes(field));
if (unusedFields.length > 0) {
  console.log('Unused fields:', unusedFields.join(', '));
}

console.log('\n🎯 Business Plan Generation Status:');
if (usedFields.length === clientFields.length) {
  console.log('✅ All schema fields available for business plan generation');
} else {
  console.log('⚠️  Some fields may be missing from business plan template');
}

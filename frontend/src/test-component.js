// Simple test to verify the component structure
const testResponse = {
  detailed_analysis: "With what I see, I think you have a skin condition that appears to be some form of dermatitis.",
  recommendations: "**Immediate Care:** Clean the area gently. **Treatment:** Apply hydrocortisone cream."
};

console.log('Test response structure:', testResponse);
console.log('Detailed analysis:', testResponse.detailed_analysis);
console.log('Recommendations:', testResponse.recommendations);
console.log('Type check:', typeof testResponse === 'object');
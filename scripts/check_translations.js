const fs = require('fs');
const path = require('path');

// Read the English translation file (source of truth)
const enTranslation = JSON.parse(fs.readFileSync(path.join(__dirname, 'client/public/locales/en/translation.json'), 'utf8'));

// Get all language directories
const localesDir = path.join(__dirname, 'client/public/locales');
const languageDirs = fs.readdirSync(localesDir).filter(file => 
  fs.statSync(path.join(localesDir, file)).isDirectory()
);

// Function to get missing keys
function getMissingKeys(source, target) {
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);
  return sourceKeys.filter(key => !targetKeys.includes(key));
}

// Check each language
languageDirs.forEach(lang => {
  try {
    const translationFile = path.join(localesDir, lang, 'translation.json');
    if (fs.existsSync(translationFile)) {
      const translation = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
      const missingKeys = getMissingKeys(enTranslation, translation);
      
      console.log(`\n${lang.toUpperCase()} TRANSLATION:`);
      console.log(`Total keys: ${Object.keys(translation).length}/${Object.keys(enTranslation).length}`);
      console.log(`Missing keys: ${missingKeys.length}`);
      
      if (missingKeys.length > 0) {
        console.log('Missing keys:');
        missingKeys.forEach(key => console.log(`  - ${key}`));
      } else {
        console.log('✓ Complete translation');
      }
    }
  } catch (error) {
    console.error(`Error reading ${lang} translation:`, error.message);
  }
});
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/components/RemoteControl.tsx',
  'frontend/src/components/admin/SVGEditor.tsx',
  'frontend/src/components/admin/DragDropManager.tsx',
  'frontend/src/components/admin/DataManager.tsx',
  'frontend/src/pages/ProblemsPage.tsx',
  'frontend/src/pages/admin/ProblemsManager.tsx',
  'frontend/src/pages/admin/TVInterfaceBuilder.tsx',
  'frontend/src/pages/admin/RemoteBuilder.tsx',
  'frontend/src/pages/admin/StepsManagerNew.tsx',
  'frontend/src/pages/admin/SystemSettings.tsx',
  'frontend/src/pages/admin/StepsManager.tsx',
  'frontend/src/pages/admin/DeviceManager.tsx',
  'frontend/src/pages/TVInterfaceDemo.tsx',
  'frontend/src/pages/DiagnosticPage.tsx',
  'frontend/src/pages/DiagnosticPageNew.tsx'
];

filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace import from DataContext to ApiContext
      content = content.replace(
        /import\s*{\s*useData\s*}\s*from\s*["']@\/contexts\/DataContext["'];?/g,
        'import { useData } from "@/contexts/ApiContext";'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

console.log('Import update completed!');

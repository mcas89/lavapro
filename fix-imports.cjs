const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, content.replace(regex, replacement));
  }
}

const sharedDir = path.join(__dirname, 'src', 'components', 'shared');
const layoutDir = path.join(__dirname, 'src', 'components', 'layout');

// layout
replaceInFile(path.join(layoutDir, 'TopBar.tsx'), /import \{ ReactNode \}/, 'import { type ReactNode }');

// shared
replaceInFile(path.join(sharedDir, 'EmptyState.tsx'), /import \{ ReactNode \}/, 'import { type ReactNode }');
replaceInFile(path.join(sharedDir, 'StatCard.tsx'), /import \{ Card, CardContent, CardHeader, CardTitle \} from "@\/components\/ui\/card";\nimport \{ ReactNode \}/, 'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";\nimport { type ReactNode }');
replaceInFile(path.join(sharedDir, 'BottomSheet.tsx'), /import \{ ReactNode, useEffect, useState \}/, 'import { type ReactNode, useEffect, useState }');
replaceInFile(path.join(sharedDir, 'Timeline.tsx'), /import \{ ReactNode \}/, 'import { type ReactNode }');

// Types imports
replaceInFile(path.join(sharedDir, 'CustomerCard.tsx'), /import \{ Customer \}/, 'import type { Customer }');
replaceInFile(path.join(sharedDir, 'VehicleCard.tsx'), /import \{ Vehicle \}/, 'import type { Vehicle }');
replaceInFile(path.join(sharedDir, 'AppointmentCard.tsx'), /import \{ Schedule \}/, 'import type { Schedule }');
replaceInFile(path.join(sharedDir, 'EmployeeCard.tsx'), /import \{ Employee \}/, 'import type { Employee }');
replaceInFile(path.join(sharedDir, 'FinanceCard.tsx'), /import \{ Finance \}/, 'import type { Finance }');

console.log('Imports fixed!');

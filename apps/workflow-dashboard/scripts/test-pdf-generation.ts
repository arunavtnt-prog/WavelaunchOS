import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPdf() {
  const blueprint = await prisma.blueprint.findFirst({
    where: {
      application: {
        fullName: { contains: 'Cody' }
      }
  },
    include: {
      application: true
    }
  });

  if (!blueprint) {
    console.log('Blueprint not found');
    await prisma.$disconnect();
    return;
  }

  const blueprintEngineUrl = process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010';

  console.log('Testing PDF generation...');
  console.log('Blueprint:', blueprint.application.fullName);
  console.log('Markdown length:', blueprint.markdown?.length || 0);
  console.log('Engine URL:', blueprintEngineUrl);
  console.log('');

  try {
    const response = await fetch(`${blueprintEngineUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markdown: blueprint.markdown,
        options: {
          outputFilename: `${blueprint.application.fullName.replace(/\s+/g, '_')}_Blueprint.pdf`,
        },
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const result = await response.json();
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('');
      console.log('PDF generated successfully!');
      console.log('PDF URL:', `${blueprintEngineUrl}${result.pdfUrl}`);

      // Update blueprint with PDF path
      await prisma.blueprint.update({
        where: { id: blueprint.id },
        data: { pdfPath: result.pdfUrl }
      });
      console.log('Updated blueprint.pdfPath in database');
    } else {
      console.error('PDF generation failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await prisma.$disconnect();
}

testPdf().catch(console.error);

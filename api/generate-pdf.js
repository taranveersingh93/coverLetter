const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Function to get today's date in a readable format
const getReadableDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('en-US', options);
};

// Function to wrap text for PDF without splitting words
function wrapText(text, font, fontSize, maxWidth) {
  const lines = text.split('\n'); // Split the text into lines by paragraph breaks
  const wrappedLines = [];

  lines.forEach(line => {
    let currentLine = '';
    const words = line.split(' '); // Split into words for wrapping

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      // If the line width is within the max width, keep adding
      if (textWidth < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine); // Push the wrapped line
        }
        currentLine = word; // Start a new line with the current word
      }
    });

    // Push any remaining text in the line
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  });

  return wrappedLines;
}

const generatePDF = async (event) => {
  try {
    const { company_name } = JSON.parse(event.body);

    if (!company_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Company name is required.' }),
      };
    }

    const currentDate = getReadableDate();

    const coverLetter = `
To: Hiring Manager,

Date: ${currentDate}

I am a perpetual student who pursues his craft relentlessly. I earned cloud computing certificates from AWS, attended a frontend program, studied backend, and am now finishing up a CS degree. Throughout my journey, I have always wanted to learn more. With that very same sentiment, I look forward to joining ${company_name} and continuing to learn on the job.

My 97 percentile on the GMAT shows that I have a "verified" quantitative aptitude but I also have customer service experience. As a result, I innately understand the "why" behind any product feature that I'm implementing. Before pushing any code, I imagine receiving a call from a frustrated customer. Yes, my inner voice is an imaginary irate client and that makes for great quality checks.

I am proud of the fact that in group projects, I'm either the guy with the answers, or the one with the right questions. As much as ${company_name} is a dream workplace for me, I'm sure I'd make for a dream employee as well because of my work ethic, teamwork and technical aptitude.

Sincerely,
Taranveer Singh
(https://taranveer.com)
    `;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 700]); // Page size: width 600, height 700

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 12;
    const maxWidth = 550; // Set the maximum width for the text (for word wrapping)

    const wrappedLines = wrapText(coverLetter.trim(), timesRomanFont, fontSize, maxWidth);
    let yPosition = 650; // Starting y-position for the text

    wrappedLines.forEach(line => {
      if (line.trim() !== '') {
        const isLink = line.includes('https://taranveer.com');

        page.drawText(line, {
          x: 25, // X position (left margin)
          y: yPosition,
          size: fontSize,
          font: timesRomanFont,
          color: isLink ? rgb(0, 0, 1) : rgb(0, 0, 0), // Blue for link, black otherwise
        });

        yPosition -= 14; // Move y position down for each line
      } else {
        yPosition -= 20; // Decrease y-position for empty lines (paragraph breaks)
      }
    });

    const pdfBytes = await pdfDoc.save();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=cover_letter.pdf',
      },
      body: pdfBytes.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate PDF.' }),
    };
  }
};

// Correct export for Vercel Serverless function
module.exports = generatePDF;

// Import necessary libraries
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Function to get today's date in a readable format
const getReadableDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('en-US', options);
};

// Function to wrap text for PDF
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (textWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  lines.push(currentLine);
  return lines;
}

// Main handler function for generating PDF
exports.handler = async (event) => {
  const { company_name } = JSON.parse(event.body); // Parse the request body

  // Get today's date in a readable format
  const currentDate = getReadableDate();

  // Hardcoded cover letter template with today's date and dynamic company name
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

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 700]); // Adjusted page size for longer content

  // Embed font
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 12;
  const maxWidth = 550; // Set the maximum width for the text (for word wrapping)

  // Split the cover letter into lines at each newline (\n)
  const lines = coverLetter.trim().split('\n');

  // Initial y-position for the text
  let yPosition = 650;

  // Loop over each line of the cover letter and draw it on the PDF
  lines.forEach(line => {
    if (line.trim() !== '') {
      // Wrap the text if it's too wide for the page
      const wrappedLines = wrapText(line.trim(), timesRomanFont, fontSize, maxWidth);
      
      wrappedLines.forEach(wrappedLine => {
        // Check if the line contains the hyperlink
        const isLink = wrappedLine.includes('https://taranveer.com');
        
        // Draw the line with different colors for links
        page.drawText(wrappedLine, {
          x: 25, // X position (left margin)
          y: yPosition, // Y position
          size: fontSize,
          font: timesRomanFont,
          color: isLink ? rgb(0, 0, 1) : rgb(0, 0, 0), // Blue for link, black otherwise
        });
        
        yPosition -= 14; // Move y position down for each wrapped line
      });
    } else {
      yPosition -= 20; // Decrease y-position for empty lines (paragraph breaks)
    }
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Return the PDF as a response
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cover_letter.pdf',
    },
    body: pdfBytes.toString('base64'), // Encode the PDF as base64
    isBase64Encoded: true // Indicate that the response body is base64-encoded
  };
};

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Function to get today's date in a readable format
const getReadableDate = () => {
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('en-US', options);
};

// Function to handle PDF generation logic
async function generatePDF(companyName) {
  // Get today's date
  const currentDate = getReadableDate();

  // Hardcoded cover letter template
  const coverLetter = `
To: Hiring Manager,

Date: ${currentDate}

I am a perpetual student who pursues his craft relentlessly. I earned cloud computing certificates from AWS, 
attended a frontend program, studied backend, and am now finishing up a CS degree. Throughout my journey, 
I have always wanted to learn more. With that very same sentiment, I look forward to joining ${companyName}
and continuing to learn on the job.

My 97 percentile on the GMAT shows that I have a "verified" quantitative aptitude but I also have 
customer service experience. As a result, I innately understand the "why" behind any product feature that
I'm implementing. Before pushing any code, I imagine receiving a call from a frustrated customer. 
Yes, my inner voice is an imaginary irate client and that makes for great quality checks.

I am proud of the fact that in group projects, I'm either the guy with the answers, or the one with the
right questions. As much as ${companyName} is a dream workplace for me, I'm sure I'd make for a dream employee
as well because of my work ethic, teamwork and technical aptitude.

Sincerely,
Taranveer Singh
(https://taranveer.com)
  `;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 700]); // Adjust page size for longer content

  // Embed font
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 12;
  const maxWidth = 500; // Set the maximum width for the text

  // Split the cover letter into lines at each newline
  const lines = coverLetter.trim().split('\n');

  // Initial y-position for the text
  let yPosition = 650;

  // Loop over each line of the cover letter and draw it on the PDF
  for (const line of lines) {
    if (line.trim() !== '') {
      // Check if the line contains the hyperlink
      const isLink = line.includes('https://taranveer.com');

      // Draw the line
      page.drawText(line.trim(), {
        x: 50, // X position (left margin)
        y: yPosition, // Y position
        size: fontSize,
        font: timesRomanFont,
        color: isLink ? rgb(0, 0, 1) : rgb(0, 0, 0), // Blue for link, black otherwise
      });

      yPosition -= 14; // Move y position down for each line
    } else {
      yPosition -= 20; // Decrease y-position for empty lines (paragraph breaks)
    }
  }

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = async (req, res) => {
  try {
    const { company_name } = req.body;

    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    // Generate the PDF asynchronously
    const pdfBytes = await generatePDF(company_name);

    // Set the response headers to allow downloading the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cover_letter.pdf');

    // Send the PDF as the response
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
};

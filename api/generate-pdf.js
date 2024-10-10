const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Function to get today's date in a readable format
const getReadableDate = () => {
  const today = new Date();

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  };

  return new Intl.DateTimeFormat('en-US', options).format(today);
};

// Function to handle PDF generation logic
async function generatePDF(companyName) {
  // Get today's date
  const currentDate = getReadableDate();

  // Hardcoded cover letter template
  const coverLetter = `
To: Hiring Manager,

Date: ${currentDate}


I am writing to express my interest in joining ${companyName}, where I believe my passion for continuous
learning and technical expertise would be a perfect fit. I have earned cloud computing certifications from
AWS, completed a frontend development program, explored backend technologies, and recently graduated with a
degree in Computer Science. This drive for continuous growth fuels my desire to contribute meaningfully to
${companyName}.

What sets me apart is my blend of technical skills and hands-on customer service experience.
In a previous role, I was the go-to person for de-escalations, once staying two hours past closing to help
a client prepare documents for an immigration appointment. This commitment to problem-solving and delivering
high-quality solutions under pressure translates into my approach to development. I always visualize the
impact of my work from the user’s perspective, ensuring the end product addresses real-world needs.

I am confident that my strong work ethic, collaborative skills, and technical expertise would make me a
valuable asset to your team. I’m excited about the opportunity to contribute to ${companyName}’s mission
and grow alongside your team.

Thank you for considering my application. I look forward to the possibility of connecting soon.

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
    const file = company_name.toLowerCase();
    // Set the response headers to allow downloading the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=taranveer_singh_${file}_cover_letter.pdf`);

    // Send the PDF as the response
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
};

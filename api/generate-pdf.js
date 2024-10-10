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
learning and technical expertise would be a perfect fit. As someone who is deeply committed to advancing
my skills, I have earned cloud computing certifications from AWS, completed a frontend development program, 
explored backend technologies, and have recently earned my Computer Science degree. 
  
This ongoing journey of learning has always been driven by my desire to push boundaries, and I am eager to
bring that same energy to ${companyName}.

My ability to think analytically has been "verified" through my 97th percentile GMAT score,
demonstrating my quantitative aptitude. However, what truly sets me apart is my blend of technical skills
with hands-on customer service experience. This duality allows me to approach each project with a deep
understanding of not just the "how" but the "why" behind the product features I develop. 
Before any code is written or deployed, I visualize how it will impact the end user—often imagining feedback
from a frustrated customer. This mindset has been instrumental in driving high-quality, user-centric solutions.

In group projects, I am proud to be the team member who either has the answers or asks the right questions. 
My ability to collaborate and think critically has allowed me to contribute meaningfully to the success of 
every team I've been a part of. ${companyName} represents an ideal environment for me to continue learning,
 growing,
and contributing, and I am confident that my work ethic, teamwork, and technical skill set would make me a 
valuable asset to your team.

Thank you for considering my application. I look forward to the opportunity to contribute to ${companyName}’s
success and am excited about the possibility of learning and growing with your team.

Sincerely,
Taranveer Singh
(https://taranveer.com)
  `;

const coverText = `
I am writing to express my interest in joining ${companyName}, where I believe my passion for continuous learning and technical expertise would be a perfect fit. As someone who is deeply committed to advancing my skills, I have earned cloud computing certifications from AWS, completed a frontend development program, explored backend technologies, and have recently earned my Computer Science degree.  

This ongoing journey of learning has always been driven by my desire to push boundaries, and I am eager to
bring that same energy to ${companyName}.

My ability to think analytically has been "verified" through my 97th percentile GMAT score, demonstrating my quantitative aptitude. However, what truly sets me apart is my blend of technical skills with hands-on customer service experience. This duality allows me to approach each project with a deep understanding of not just the "how" but the "why" behind the product features I develop. Before any code is written or deployed, I visualize how it will impact the end user—often imagining feedback from a frustrated customer. This mindset has been instrumental in driving high-quality, user-centric solutions.

In group projects, I am proud to be the team member who either has the answers or asks the right questions. My ability to collaborate and think critically has allowed me to contribute meaningfully to the success of every team I've been a part of. ${companyName} represents an ideal environment for me to continue learning, growing, and contributing, and I am confident that my work ethic, teamwork, and technical skill set would make me a valuable asset to your team.

Thank you for considering my application. I look forward to the opportunity to contribute to ${companyName}’s success and am excited about the possibility of learning and growing with your team.
`
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
  displayGeneratedText(coverText);

  return pdfBytes;
}

function displayGeneratedText(coverLetterText) {
  const generatedTextDiv = document.getElementById('generatedText');

  // Show the generated text and back button, hide the form
  generatedTextDiv.innerText = coverLetterText;
  generatedTextDiv.style.display = 'block';
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

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Function to handle the PDF generation
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { company_name } = req.body;

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 700]);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        const currentDate = new Date().toLocaleDateString();
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

        // Write the cover letter to the PDF
        const fontSize = 12;
        const lines = coverLetter.trim().split('\n');
        let yPosition = 650;

        // Loop over each line of the cover letter and draw it on the PDF
        for (const line of lines) {
            if (line.trim()) {
                page.drawText(line.trim(), {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
                yPosition -= 14; // Move down for the next line
            } else {
                yPosition -= 20; // Extra space for empty lines
            }
        }

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // Set the response headers to allow downloading the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cover_letter.pdf');
        res.status(200).send(Buffer.from(pdfBytes));
    } else {
        // Handle method not allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

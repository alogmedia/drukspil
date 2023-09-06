const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware for at parse JSON-anmodninger
app.use(bodyParser.json());

// Konfigurer express.static til at servere statiske filer fra din "public" mappe (eller den relevante mappe)
app.use(express.static(__dirname));


app.post('/add-statement', (req, res) => {
  const newStatement = req.body.statement;

  if (!newStatement || typeof newStatement !== 'string') {
    return res.status(400).json({ error: 'Ugyldig påstand' });
  }

  // Opret den fulde sti til statements.json-filen
  const filePath = path.join(__dirname, '/public/assets/statements.json');

  try {
    // Læs eksisterende påstande fra filen
    const statementsData = fs.readFileSync(filePath, 'utf8');
    const statements = JSON.parse(statementsData);

    // Tilføj den nye påstand til arrayet
    statements.statements.push(newStatement);

    // Gem de opdaterede påstande til filen
    fs.writeFileSync(filePath, JSON.stringify(statements, null, 2), 'utf8');

    return res.status(200).json({ message: 'Påstand tilføjet med succes' });
  } catch (error) {
    console.error('Fejl ved tilføjelse af påstand:', error);
    return res.status(500).json({ error: 'Intern serverfejl' }); // Tilføj en passende fejlmeddelelse
  }
});


app.listen(port, () => {
  console.log(`Serveren kører på port ${port}`);
});

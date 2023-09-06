let statements = []; // Array til at gemme påstande

function loadStatements() {
  return new Promise((resolve, reject) => {
    fetch('/statements.json')
      .then((response) => response.json())
      .then((data) => {
        statements = data.statements;
        resolve(); // Fortæl, at Fetch-anmodningen er fuldført
      })
      .catch((error) => {
        console.error('Fejl ved indlæsning af JSON-fil:', error);
        reject(error); // Fortæl, at der opstod en fejl
      });
  });
}

// Kald loadStatements-funktionen og vent på, at det er fuldført
loadStatements()
  .then(() => {
    const statementElement = document.getElementById('statement');
    const nextButton = document.getElementById('next');
    const newStatementInput = document.getElementById('newStatement');
    const addButton = document.getElementById('add');

    let currentStatementIndex = 0;

    nextButton.addEventListener('click', () => {
      if (statements.length === 0) {
        statementElement.textContent = 'Ingen påstande tilføjet endnu.';
      } else {
        currentStatementIndex = (currentStatementIndex + 1) % statements.length;
        statementElement.textContent = statements[currentStatementIndex];
      }
    });

    addButton.addEventListener('click', () => {
      const newStatement = newStatementInput.value;
      if (newStatement.trim() !== '') {
        statements.push(newStatement);
        newStatementInput.value = '';
        currentStatementIndex = statements.length - 1;
        statementElement.textContent = newStatement;

        // Send den nye påstand til serveren via en POST-anmodning
        fetch('/add-statement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ statement: newStatement }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === 'Påstand tilføjet med succes') {
              // Behandle bekræftelse her, hvis nødvendigt
            } else {
              // Håndter fejl her, hvis nødvendigt
            }
          })
          .catch((error) => {
            console.error('Fejl ved POST-anmodning:', error);
          });
      }
    });

    // ... (Resten af din kode)
  })
  .catch((error) => {
    console.error('Fejl ved indlæsning af JSON-fil:', error);
  });

// Kald loadStatements-funktionen, når siden indlæses
window.addEventListener('load', loadStatements);

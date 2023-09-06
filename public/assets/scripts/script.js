let statements = []; // Array til at gemme påstande

function loadStatements() {
  return new Promise((resolve, reject) => {
    fetch('/public/statements.json')
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

  // Funktion til at læse cookien med navnet "points"
  function getPointsFromCookie() {
    const name = "points=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return parseInt(cookie.substring(name.length), 10);
      }
    }
    return 0; // Returner 0 point, hvis cookien ikke findes
  }

  // Funktion til at opdatere pointene og gemme dem i en cookie
  function updatePoints(points) {
    document.getElementById('points').textContent = `Point: ${points}`;
    document.cookie = `points=${points}`;
  }

  // Kald funktionen for at indlæse eksisterende point og opdatere visningen
  let currentPoints = getPointsFromCookie();
  updatePoints(currentPoints);

  // Eventlistener for "Næste" knappen
  const nextButton = document.getElementById('next');
  nextButton.addEventListener('click', () => {
    currentPoints++;
    updatePoints(currentPoints);
  });

  // Eventlistener for "Tilføj påstand" knappen
  const addButton = document.getElementById('add');
  addButton.addEventListener('click', () => {
    if (currentPoints >= 10) {
      // Hvis brugeren har nok point, træk 10 point og tilføj påstanden
      currentPoints -= 10;
      updatePoints(currentPoints);

      // Her kan du tilføje logikken for at tilføje en ny påstand
    } else {
      // Hvis brugeren ikke har nok point, vis en besked eller udfør en handling
      alert('Du har ikke nok point til at tilføje en påstand.');
    }
  });

// Resten af din eksisterende kode...


// Kald loadStatements-funktionen, når siden indlæses
window.addEventListener('load', loadStatements);

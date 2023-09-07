let statements = []; // Array til at gemme påstande

// Når siden indlæses
window.addEventListener('load', () => {
  // Tjek om brugeren er logget ind ved at se efter cookien
  const isLoggedIn = document.cookie.includes('isLoggedIn=true');
  
  if (isLoggedIn) {
    // Brugeren er logget ind, skjul registrerings- og login-formularerne
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';

    // Vis brugerens points eller andre relevante oplysninger
    document.getElementById('pointsDisplay').style.display = 'block';

    // Vis log ud knappen
    document.getElementById('logoutButton').style.display = 'block';
  } else {
    // Brugeren er ikke logget ind, vis registrerings- og login-formularerne
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'block';

    // Skjul brugerens points eller andre relevante oplysninger
    document.getElementById('pointsDisplay').style.display = 'none';

    // Skjul log ud knappen
    document.getElementById('logoutButton').style.display = 'none';
  }
});

function loadStatements() {
  return new Promise((resolve, reject) => {
    fetch('statements.json')
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

loadStatements().then(() => {
  const statementElement = document.getElementById('statement');
  const newStatementInput = document.getElementById('newStatement');
  const addButton = document.getElementById('add');

  let currentStatementIndex = 0;

  // Set the initial statement when the page loads
  statementElement.textContent = statements[currentStatementIndex];
    // Resten af din kode...

    // Funktion til at læse cookien med navnet "points"
    function getPointsFromCookie() {
      const name = "pointsDisplay=";
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
      document.getElementById('pointsDisplay').textContent = `Points: ${points}`;
      document.cookie = `pointsDisplay=${points}`;
    }

    // Kald funktionen for at indlæse eksisterende point og opdatere visningen
    let currentPoints = getPointsFromCookie();
    updatePoints(currentPoints);

    // Eventlistener for "Næste" knappen
    const nextButton = document.getElementById('next');
    let isNextButtonEnabled = true;

    nextButton.addEventListener('click', () => {
      if (isNextButtonEnabled) {
        currentStatementIndex++;
        if (currentStatementIndex >= statements.length) {
          currentStatementIndex = 0; // Wrap around to the first statement
        }
        statementElement.textContent = statements[currentStatementIndex];

        // Update the points when "Næste" is clicked
        currentPoints++;
        updatePoints(currentPoints);
        // Deaktiver knappen i et stykke tid (f.eks. 2 sekunder)
        nextButton.disabled = true;
        isNextButtonEnabled = false;
        setTimeout(() => {
          nextButton.disabled = false;
          isNextButtonEnabled = true;
        }, 2000); // 2 sekunder
      }
    });

    // Her kan du tilføje logikken for at tilføje en ny påstand
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
  })
  .catch((error) => {
    // Handle error here if needed
    console.error('Error loading statements:', error);
  });

// Resten af din kode...

// Find logud-knappen ved hjælp af dens ID
const logoutButton = document.getElementById('logoutButton');

// Tilføj en eventlistener til logud-knappen
logoutButton.addEventListener('click', () => {
  // Send en anmodning til serveren for at logge brugeren ud (dette afhænger af din serverimplementering)
  fetch('/logout', {
    method: 'POST', // Du kan bruge POST eller en anden passende metode
    headers: {
      'Content-Type': 'application/json',
    },
    // Eventuelle data, du vil sende til serveren, kan tilføjes her
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'Logout successful') {
        // Håndter logud-success her (f.eks. omdiriger brugeren til loginsiden)
        console.log('Log ud vellykket');
        // Fjern isLoggedIn-cookien
        document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Udløber datoen i fortiden for at slette cookien
        // For eksempel kan du omdirigere brugeren til loginsiden:
        window.location.href = '/'; // Ændr stien til din login-side
      } else {
        // Håndter logud-fejl her
        console.error('Logud-fejl:', data.message);
      }
    })
    .catch((error) => {
      console.error('Fejl ved logud:', error);
    });
});

// Event listener for the login form submission
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  // Extract the username and password from the form
  const loginUsername = document.getElementById('loginUsername').value;
  const loginPassword = document.getElementById('loginPassword').value;

  try {
    // Send a POST request to the server for login
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    });

    if (response.ok) {
      // Authentication successful, update the UI as needed
      // For example, you can hide the login form and show user-specific content
      console.log('Login successful');
    } else {
      // Authentication failed, show an error message or handle it accordingly
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
});

// Event listener for the registration form submission
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  // Extract the username and password from the form
  const registerUsername = document.getElementById('registerUsername').value;
  const registerPassword = document.getElementById('registerPassword').value;

  try {
    // Send a POST request to the server for registration
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: registerUsername, password: registerPassword }),
    });

    if (response.ok) {
      // Registration successful, update the UI as needed
      // For example, you can hide the registration form and show user-specific content
      console.log('Registration successful');
      alert("Du har registreret en konto og du kan nu logge ind!")
    } else {
      // Registration failed, show an error message or handle it accordingly
      console.error('Registration failed');
    }
  } catch (error) {
    console.error('Error during registration:', error);
  }
});

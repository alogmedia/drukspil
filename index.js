const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 80;

app.use(bodyParser.json());

// Configure express-session
app.use(
  session({
    secret: 'c2sfOYy4OV4oK5ZUqqyLxiB1XraVjGs3',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurér cookie-parser
app.use(cookieParser());

let usersData = {};
const usersFilePath = path.join(__dirname, 'users.json');

try {
  const usersFileContent = fs.readFileSync(usersFilePath, 'utf8');
  usersData = JSON.parse(usersFileContent);
} catch (error) {
  console.error('Error reading users.json:', error);
}

function saveUsersData() {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing users.json:', error);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (usersData[username]) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    usersData[username] = { password: hashedPassword };
    saveUsersData();

    return res.status(201).json({ message: 'User registered successfully' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const userData = usersData[username];

  if (!userData) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  bcrypt.compare(password, userData.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Gem brugeroplysninger i session
    req.session.user = username;

    // Opret en cookie for at indikere, at brugeren er logget ind
    res.cookie('isLoggedIn', 'true');

    // Authentication successful
    return res.status(200).json({ message: 'Login successful' });
  });
});

app.post('/logout', (req, res) => {
  // Fjern brugerens session eller nulstil den som passende (afhænger af din sessionhåndtering)
  req.session.destroy((err) => {
    if (err) {
      console.error('Fejl ved log ud:', err);
      return res.status(500).json({ error: 'Fejl ved log ud' });
    }
    return res.status(200).json({ message: 'Logout successful' });
  });
});

app.get('/statements.json', (req, res) => {
  const filePath = path.join(__dirname, 'public/statements.json');
  res.sendFile(filePath);
});

app.post('/add-statement', (req, res) => {
  const newStatement = req.body.statement;

  if (!newStatement || typeof newStatement !== 'string') {
    return res.status(400).json({ error: 'Ugyldig påstand' });
  }

  const filePath = path.join(__dirname, 'public/statements.json');

  try {
    const statementsData = fs.readFileSync(filePath, 'utf8');
    const statements = JSON.parse(statementsData);

    statements.statements.push(newStatement);

    fs.writeFileSync(filePath, JSON.stringify(statements, null, 2), 'utf8');

    return res.status(200).json({ message: 'Påstand tilføjet med succes' });
  } catch (error) {
    console.error('Fejl ved tilføjelse af påstand:', error);
    return res.status(500).json({ error: 'Intern serverfejl' });
  }
});

app.listen(port, () => {
  console.log(`Serveren kører på port ${port}`);
});

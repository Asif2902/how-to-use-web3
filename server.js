 const express = require('express');
const path = require('path');

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname);  // Set views directory to root (current directory)

// Serve static files like index.html
app.use(express.static(__dirname));

// Route for homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html
});

// Route for Blog.ejs (Blogging platform)
app.get('/blog', (req, res) => {
    res.render('Blog'); // Render Blog.ejs dynamically
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
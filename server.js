const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer'); // for handling image uploads
const fs = require('fs'); // for file system operations

const app = express();

// In-memory blog storage (for simplicity)
let blogs = [];

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname); // Set views directory to root (current directory)

// Serve static files
app.use(express.static(__dirname));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup multer for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp + original extension
    }
});
const upload = multer({ storage });

// Route for homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html
});

// Route to render Blog.ejs with blogs
app.get('/blog', (req, res) => {
    res.render('Blog', { blogs }); // Pass blogs to the template
});

// API to submit a blog post
app.post('/submit-blog', upload.array('images'), (req, res) => {
    const { title, content } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`); // Store image paths

    const blogPost = { title, content, images };
    blogs.push(blogPost);

    res.redirect('/blog'); // Redirect to blog page after submission
});

// Ensure the uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

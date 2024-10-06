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
app.set('views', path.join(__dirname, 'views')); // Set views directory to /views

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup multer for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp + original extension
    }
});
const upload = multer({ storage });

// Route for homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html from public
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

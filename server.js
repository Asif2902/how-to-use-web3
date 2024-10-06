const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();

let blogs = [];

// Read blogs from file on server start
const BLOG_FILE = 'blogs.json';

if (fs.existsSync(BLOG_FILE)) {
    const data = fs.readFileSync(BLOG_FILE, 'utf-8');
    blogs = JSON.parse(data);
}

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname);

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
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage });

// Route for homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to render Blog.ejs with blogs
app.get('/blog', (req, res) => {
    res.render('Blog', { blogs });
});

// API to submit a blog post
app.post('/submit-blog', upload.array('images'), (req, res) => {
    const { title, content } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`); 

    const blogPost = { title, content, images };
    blogs.push(blogPost);

    // Save blogs to file
    fs.writeFileSync(BLOG_FILE, JSON.stringify(blogs, null, 2));

    res.redirect('/blog');
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

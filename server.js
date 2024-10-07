const express = require('express');
const fs = require('fs').promises; // Use promise-based fs methods
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files like CSS, JS, etc.
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp for unique filenames
    }
});
const upload = multer({ storage: storage });

// Route to render the index.ejs page
app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile('blogs.json', 'utf8');
        const blogs = JSON.parse(data);
        res.render('index', { blogs: blogs });
    } catch (err) {
        console.error('Error reading blogs.json:', err);
        res.status(500).send('Error loading blogs');
    }
});

// Route to handle new blog submissions
app.post('/submit-blog', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !description) {
        return res.status(400).send('Title and description are required.');
    }

    try {
        // Read current blogs from blogs.json
        const data = await fs.readFile('blogs.json', 'utf8');
        const blogs = JSON.parse(data);

        // Create new blog entry
        const newBlog = {
            title: title,
            description: description,
            image: image,
            date: new Date().toISOString() // Store the current timestamp
        };

        // Add new blog entry to the array
        blogs.push(newBlog);

        // Write updated blog array back to blogs.json
        await fs.writeFile('blogs.json', JSON.stringify(blogs, null, 2));

        // Redirect to the home page after successful submission
        res.redirect('/');
    } catch (err) {
        console.error('Error saving new blog:', err);
        res.status(500).send('Error submitting blog');
    }
});

// Ensure uploads folder exists
const ensureUploadsFolderExists = async () => {
    try {
        await fs.access('uploads');
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir('uploads');
        }
    }
};

// Start the server
app.listen(PORT, async () => {
    await ensureUploadsFolderExists(); // Make sure 'uploads' directory exists
    console.log(`Server is running on port ${PORT}`);
});

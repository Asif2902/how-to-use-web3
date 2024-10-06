const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set up multer for file uploads
const upload = multer({ dest: 'upload/' });

// Route to render the blog submission form
app.get('/', (req, res) => {
    res.render('index'); // Ensure your EJS file is in the views folder
});

// Route to handle blog submission
app.post('/submit-blog', upload.array('images', 10), (req, res) => {
    const { title, content } = req.body;
    const images = req.files.map(file => `/upload/${file.filename}`);

    const newBlog = { title, content, images };

    // Load existing blogs from blogs.json
    fs.readFile('blogs.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File does not exist, create a new array
                const blogs = [newBlog];
                fs.writeFileSync('blogs.json', JSON.stringify(blogs, null, 2));
            } else {
                return res.status(500).send('Error reading blog data.');
            }
        } else {
            const blogs = JSON.parse(data);
            blogs.push(newBlog);

            // Write updated blogs to blogs.json
            fs.writeFileSync('blogs.json', JSON.stringify(blogs, null, 2));
        }

        res.redirect('/');
    });
});

// Route to serve uploaded images
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

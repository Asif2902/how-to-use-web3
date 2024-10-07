const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });  // Files will be uploaded to the 'upload' folder

app.set('view engine', 'ejs');
app.use(express.static('public'));  // For serving static files like CSS, JS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to render the blog form page
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle blog submissions
app.post('/submit-blog', upload.array('images'), (req, res) => {
    const { title, content } = req.body;
    const images = req.files.map(file => file.filename);  // Save filenames of the uploaded images

    const newBlog = {
        title: title,
        content: content,
        images: images
    };

    // Read blogs.json and append new blog post
    fs.readFile('blogs.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading blog data');
        }

        const blogs = JSON.parse(data || '[]');
        blogs.push(newBlog);

        fs.writeFile('blogs.json', JSON.stringify(blogs, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving blog data');
            }

            res.redirect('/');
        });
    });
});

// Route to get and display blogs
app.get('/blogs', (req, res) => {
    fs.readFile('blogs.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading blog data');
        }

        const blogs = JSON.parse(data || '[]');
        res.json(blogs);
    });
});

// Serve the uploaded images
app.use('/upload', express.static(path.join(__dirname, 'upload')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

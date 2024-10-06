const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/blogDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    images: [String]
});

const Blog = mongoose.model('Blog', blogSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Image storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route to display blogs
app.get('/', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', { blogs: blogs });
        }
    });
});

// Route to submit blog
app.post('/submit', upload.array('images', 10), (req, res) => {
    const newBlog = new Blog({
        title: req.body.title,
        content: req.body.content,
        images: req.files.map(file => '/uploads/' + file.filename)
    });

    newBlog.save(err => {
        if (!err) {
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
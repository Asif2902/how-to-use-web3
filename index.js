const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost/blogDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Blog schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    images: [String],
    editKey: String
});

const Blog = mongoose.model('Blog', blogSchema);

// Routes

// Home route to display the homepage
app.get('/', async (req, res) => {
    const blogs = await Blog.find();
    res.render('index', { blogs: blogs });
});

// New blog route to list all blogs
app.get('/blog', async (req, res) => {
    const blogs = await Blog.find();
    res.render('blog', { blogs: blogs }); // Render the 'blog' view
});

// Route to handle blog posting
app.post('/post', upload.array('images', 5), (req, res) => {
    const { title, content } = req.body;
    const files = req.files.map(file => file.path.replace('public', ''));

    // Generate a 16-word key
    const key = crypto.randomBytes(16).toString('hex');

    const newBlog = new Blog({
        title: title,
        content: content,
        images: files,
        editKey: key
    });

    newBlog.save().then(() => {
        res.send(`<script>alert('Your edit/delete key is: ${key}'); window.location.href="/";</script>`);
    });
});

// Route to edit blog
app.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, editKey } = req.body;

    const blog = await Blog.findById(id);

    if (blog.editKey === editKey) {
        blog.title = title;
        blog.content = content;
        await blog.save();
        res.redirect('/blog'); // Redirect to the blog page after editing
    } else {
        res.send('<script>alert("Invalid key!"); window.location.href="/";</script>');
    }
});

// Route to delete blog
app.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const { editKey } = req.body;

    const blog = await Blog.findById(id);

    if (blog.editKey === editKey) {
        await Blog.findByIdAndDelete(id);
        res.redirect('/blog'); // Redirect to the blog page after deletion
    } else {
        res.send('<script>alert("Invalid key!"); window.location.href="/";</script>');
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

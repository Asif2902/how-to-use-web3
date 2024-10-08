const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Multer config for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Simulating database (use actual DB for production)
let blogs = [];

// Generate 16-word key
const generateKey = () => {
  return crypto.randomBytes(8).toString('hex'); // 16-character hex string
};

// POST route for creating a blog
app.post('/post-blog', upload.array('images', 5), (req, res) => {
  const { title, content } = req.body;
  const files = req.files;
  const blogImages = files.map((file) => file.path);

  const key = generateKey(); // Generate a cryptographic key

  const newBlog = {
    id: blogs.length + 1,
    title,
    content,
    images: blogImages,
    key,
  };

  blogs.push(newBlog);

  // Save the blogs and keys to a file (or DB)
  fs.writeFileSync('blogs.json', JSON.stringify(blogs));

  // Send the key back to the user in a popup
  res.render('success', { key });
});

// Render the blog posting page
app.get('/', (req, res) => {
  res.render('index', { blogs });
});

// PUT route to edit a blog (requires key)
app.put('/edit-blog/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, key } = req.body;

  const blog = blogs.find((b) => b.id == id);
  if (blog && blog.key === key) {
    blog.title = title;
    blog.content = content;

    fs.writeFileSync('blogs.json', JSON.stringify(blogs)); // Update blogs

    res.send('Blog updated successfully');
  } else {
    res.status(403).send('Invalid key');
  }
});

// DELETE route to delete a blog (requires key)
app.delete('/delete-blog/:id', (req, res) => {
  const { id } = req.params;
  const { key } = req.body;

  const blogIndex = blogs.findIndex((b) => b.id == id);
  if (blogIndex !== -1 && blogs[blogIndex].key === key) {
    blogs.splice(blogIndex, 1); // Remove the blog

    fs.writeFileSync('blogs.json', JSON.stringify(blogs)); // Update blogs

    res.send('Blog deleted successfully');
  } else {
    res.status(403).send('Invalid key');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
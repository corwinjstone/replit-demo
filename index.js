const { exec } = require('child_process');
const path = require("path")
const express = require("express")
const multer = require('multer')
const fetch = require('node-fetch')
global.fetch = fetch
const { Client } = require('@replit/object-storage')
const { v4: uuidv4 } = require('uuid')
const app = express()

// Initialize Object Storage client conditionally
let client = null
try {
  client = new Client()
} catch (error) {
  console.warn('Object Storage not available:', error.message)
}

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// In-memory storage for listings (in production, you'd use a database)
let listings = []

app.use(express.static(path.join(__dirname, "public/")))
app.use(express.static(path.join(__dirname, "pages/")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }
});
  res.sendFile(path.join("__dirname", "pages/index.html"))
})

app.get("/create-listing.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/create-listing.html"))
})

app.get("/mortgage-calculator.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/mortgage-calculator.html"))
})

app.get("/photo-upload.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/photo-upload.html"))
})

app.get("/review-listing.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/review-listing.html"))
})

app.get("/listing-success.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/listing-success.html"))
})

app.get("/dashboard.html", (req,res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
  if (err) {
    return;
  }
});
  res.sendFile(path.join(__dirname, "pages/dashboard.html"))
})

// API route to upload photos
app.post('/api/upload-photos', upload.array('photos', 20), async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ success: false, error: 'Object storage not available' })
    }

    const uploadedFiles = []
    
    for (const file of req.files) {
      const fileId = uuidv4()
      const fileName = `listings/${fileId}-${file.originalname}`
      
      // Upload to Object Storage
      await client.uploadFromBytes(fileName, file.buffer)
      
      uploadedFiles.push({
        id: fileId,
        name: file.originalname,
        path: fileName,
        size: file.size,
        type: file.mimetype
      })
    }
    
    res.json({ success: true, files: uploadedFiles })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, error: 'Upload failed' })
  }
})

// API route to get uploaded image
app.get('/api/image/:path(*)', async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'Object storage not available' })
    }

    const imagePath = req.params.path
    const imageData = await client.downloadAsBytes(`listings/${imagePath}`)
    
    res.setHeader('Content-Type', 'image/jpeg')
    res.send(Buffer.from(imageData))
  } catch (error) {
    console.error('Image retrieval error:', error)
    res.status(404).json({ error: 'Image not found' })
  }
})

// API route to create listing
app.post('/api/create-listing', async (req, res) => {
  try {
    const listing = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    
    listings.push(listing)
    res.json({ success: true, listing })
  } catch (error) {
    console.error('Listing creation error:', error)
    res.status(500).json({ success: false, error: 'Failed to create listing' })
  }
})

// API route to get all listings
app.get('/api/listings', (req, res) => {
  res.json({ listings })
})

app.listen(3000, () => {
  console.log("🚀 Shipping on port 3000")
})
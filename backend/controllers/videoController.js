const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

exports.uploadVideo = [
  upload.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }
      
      const { title, description, caption, hashtags, location, tripId } = req.body;
      
      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'weekend-mojo/videos',
          eager: [
            { width: 300, height: 300, crop: 'pad', audio: false },
            { width: 640, height: 480, crop: 'pad', audio: true }
          ],
          eager_async: true,
          eager_notification_url: `${process.env.BACKEND_URL}/api/videos/cloudinary-callback`
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Failed to upload video' });
          }
          
          // Create video record
          const video = new Video({
            userId: req.user._id,
            title,
            description,
            caption,
            hashtags: hashtags ? JSON.parse(hashtags) : [],
            location: location ? JSON.parse(location) : null,
            tripId,
            url: result.secure_url,
            thumbnail: result.eager[0].secure_url,
            cloudinaryId: result.public_id,
            duration: result.duration,
            status: 'pending'
          });
          
          await video.save();
          
          res.status(201).json({
            success: true,
            video: {
              id: video._id,
              url: video.url,
              thumbnail: video.thumbnail,
              status: video.status
            }
          });
        }
      );
      
      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = new Readable();
      readableStream.push(req.file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
      
    } catch (error) {
      console.error('Upload video error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
];

exports.getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const videos = await Video.find(query)
      .populate('userId', 'name mobile')
      .populate('tripId', 'title location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Video.countDocuments(query);
    
    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

exports.approveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ success: true, video });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({ error: 'Failed to update video status' });
  }
};

exports.updateVideoMetadata = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { caption, hashtags, location } = req.body;
    
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        caption,
        hashtags,
        location,
        status: 'ready_to_publish'
      },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ success: true, video });
  } catch (error) {
    console.error('Update video metadata error:', error);
    res.status(500).json({ error: 'Failed to update video metadata' });
  }
};

exports.markAsPublished = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { instagramPostId } = req.body;
    
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        status: 'published',
        instagramPosted: true,
        instagramPostId,
        publishScheduledAt: new Date()
      },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ success: true, video });
  } catch (error) {
    console.error('Mark as published error:', error);
    res.status(500).json({ error: 'Failed to update video status' });
  }
};
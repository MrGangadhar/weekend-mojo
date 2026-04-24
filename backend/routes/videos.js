const express = require('express');
const router = express.Router();
const { 
  uploadVideo, 
  getUserVideos, 
  getAllVideos,
  approveVideo,
  updateVideoMetadata,
  markAsPublished
} = require('../controllers/videoController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/upload', auth, uploadVideo);
router.get('/my-videos', auth, getUserVideos);
router.get('/all', auth, authorize('management', 'editor'), getAllVideos);
router.put('/:videoId/approve', auth, authorize('management'), approveVideo);
router.put('/:videoId/metadata', auth, authorize('editor'), updateVideoMetadata);
router.put('/:videoId/publish', auth, authorize('editor'), markAsPublished);

module.exports = router;
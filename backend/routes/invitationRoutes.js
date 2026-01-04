const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const auth = require('../middleware/auth');

// Public routes (no auth required)
router.get('/token/:token', invitationController.getInvitationByToken);
router.post('/accept', invitationController.acceptInvitation);

// Protected routes (auth required)
router.use(auth);
router.get('/', invitationController.getInvitations);
router.post('/', invitationController.createInvitation);
router.post('/:id/resend', invitationController.resendInvitation);
router.delete('/:id', invitationController.deleteInvitation);

module.exports = router;

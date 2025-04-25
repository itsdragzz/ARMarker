// backend/routes/flags.js
const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');

/**
 * @route   GET /api/flags
 * @desc    Get all flags
 * @access  Public
 */
router.get('/', flagController.getAllFlags);

/**
 * @route   GET /api/flags/:id
 * @desc    Get flag by ID
 * @access  Public
 */
router.get('/:id', flagController.getFlagById);

/**
 * @route   GET /api/flags/nearby
 * @desc    Get flags near a location
 * @access  Public
 */
router.get('/nearby', flagController.getNearbyFlags);

/**
 * @route   POST /api/flags
 * @desc    Create a new flag
 * @access  Public
 */
router.post('/', flagController.createFlag);

/**
 * @route   DELETE /api/flags/:id
 * @desc    Delete a flag
 * @access  Public (in a real app, should be restricted)
 */
router.delete('/:id', flagController.deleteFlag);

module.exports = router;
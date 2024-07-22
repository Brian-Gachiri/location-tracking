import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  meetup_id: {
    type: Number,
    required: true
  },
  user_id: {
    type: Number,
    required: true
  },
  is_started_sharing: {
    type: Boolean,
    required: true,
    default: false
  },
  is_connected: {
    type: Boolean,
    required: true,
    default: false
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
},
    {
  timestamps: true,
  collection: 'location'
});

const LocationRepository = mongoose.model('Location', LocationSchema);

export default LocationRepository;
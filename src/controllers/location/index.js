import APIResponseBuilder  from '../../utils/api.builder.js';
import LocationRepository from "../../repository/mongo/Location.js";


export default class LocationsController {
    // GET - Fetch Notifications
    async getLocation(req, res) {
        try {
            const paginationParams = req.paginationParams;
            const { owner_id, meetup_id } = req.query;

            const locations = await LocationRepository.find({ user: owner_id, meetup_id: meetup_id  },function (err, docs) {
                if (err){
                    console.log(err);
                }
                else{
                    console.log("First function call : ", docs);
                }
            });


            // const paginationData
            return APIResponseBuilder.builder()
                .withStatusCode(200)
                .withMessage("Location fetched successfully")
                .withData(locations)
                .build(res)
                .send();
        } catch (error) {
            return APIResponseBuilder.builder()
                .withStatusCode(400)
                .withMessage(error.message)
                .build(res)
                .send();
        }
    }

    // POST - Create a Notification
    async createLocation(req, res) {
        try {

            const { latitude, longitude, meetup_id } = req.body;
            const location = LocationRepository.findOneAndUpdate(
                {
                    user_id: req.user.userId,
                    meetup_id: meetup_id
                },
                {
                    user_id: req.user.userId,
                    coordinates: { latitude, longitude },
                    meetup_id: meetup_id,
                    is_sharing: true,
                    is_connected: false
                },
                {
                    new: true
                }
            );
            return APIResponseBuilder.builder()
                .withStatusCode(201)
                .withMessage("Location created successfully")
                .withData(location)
                .build(res)
                .send();
        } catch (error) {
            return APIResponseBuilder.builder()
                .withStatusCode(400)
                .withMessage(error.message)
                .build(res)
                .send();
        }
    }

    // PUT - Update Location lat-long, sharing status, disconnect status etc
    async updateLocation(req, res) {
        try {
            const {user_id, meetup_id, ...updates} = req.body;

            const updatedLocation = await LocationRepository.findOneAndUpdate(
                {
                    user_id,
                    meetup_id
                },
                updates,
                {
                    new: false
                }
            );
            if (!updatedLocation) {
                return APIResponseBuilder.builder()
                    .withStatusCode(404)
                    .withMessage("Location not found")
                    .build(res)
                    .send();
            }
            return APIResponseBuilder.builder()
                .withStatusCode(200)
                .withMessage("Location updated successfully")
                .withData(updatedLocation)
                .build(res)
                .send();
        } catch (error) {
            return APIResponseBuilder.builder()
                .withStatusCode(400)
                .withMessage(error.message)
                .build(res)
                .send();
        }
    }


}

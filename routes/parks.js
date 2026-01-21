import express from 'express';
import Park from "../models/Park.js";

const router = express.Router()

router.options('/', (req, res) => {
    res.header('Allow', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Methods', "GET,POST,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Origin,Content-Type,Accept,Authorization");
    res.status(204).send();
});

router.get('/', async (req, res) => {


    try {

        //pagination
        const totalItems = await Park.countDocuments();
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        let parks;
        let totalPages;
        let currentItems;

        if (limit) {
            const skip = (page - 1) * limit;
            parks = await Park.find().skip(skip).limit(limit);

            totalPages = Math.ceil(totalItems / limit) || 1;
            currentItems = parks.length;
        } else {
            parks = await Park.find();
            totalPages = 1;
            currentItems = parks.length;
        }

        const items = parks.map(park => ({
                id: park.id,
                name: park.name,
                state: park.state,
                imageUrl: park.imageUrl,
                _links: {
                    self: {
                        href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks/${park.id}`,
                    }
                }
            }
        ));
        //get gelukt
        res.status(200).json({
            items,
            _links: {
                self: {
                    href: limit
                        ? `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks?page=${page}&limit=${limit}`
                        : `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
                },
                collection: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
                },
            },

            //pagination
            pagination: {
                currentPage: page,
                currentItems,
                totalPages,
                totalItems,

                _links: {
                    first: {
                        page: 1,
                        href: limit ? `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks?page=1&limit=${limit}`
                            : `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
                    },
                    last: {
                        page: totalPages,
                        href: limit ? `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks?page=${totalPages}&limit=${limit}`
                            : `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,

                    },
                    previous: limit && page > 1 ? {
                        page: page - 1,
                        href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks?page=${page - 1}&limit=${limit}`,
                    } : null,
                    next: limit && page < totalPages ? {
                        page: page + 1,
                        href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks?page=${page + 1}&limit=${limit}`,
                    } : null

                }
            }
        });


    } catch (e) {
        //server fout, eerste pagina die laad
        res.status(500).json({error: e.message});
    }

});


router.options('/:id', (req, res) => {
    res.header('Allow', 'GET,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Methods', "GET,PUT,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Origin,Content-Type,Accept,Authorization");

    res.status(204).send();
});

router.get('/:id', async (req, res) => {

    try {
        const park = await Park.findById(req.params.id);

        if (park === null) {
            //item niet gevonden
            res.status(404).send();
        }

        //get lukt
        res.status(200).json(park);

    } catch (e) {
        //verkeerde id
        res.status(400).json({error: e.message});

    }

});

router.post('/seed', async (req, res) => {
    try {
        //delete all current
        await Park.deleteMany();

        //add new ones
        for (let i = 0; i < req.body.amount; i++) {

            await Park.create({

                name: "Yosemite National Park",
                state: "California",
                location: "Sierra Nevada, Central California",
                trails: [
                    "Half Dome Trail",
                    "Mist Trail"
                ],
                activities: [
                    "Rock Climbing",
                    "Waterfall Viewing"
                ],
                openingHours: "Open 24/7 all year",
                imageUrl: "https://www.visittheusa.com/sites/default/files/styles/hero_l/public/images/hero_media_image/2016-10/Yosemite_CROPPED_Web72DPI.jpg?itok=yh64rimD"

            });

        }
        //post succesvol gedaan
        res.status(201).json({message: "Database succesvol geseed"});
    } catch (e) {
        //server fout, eerste pagina die laad
        res.status(500).json({error: e.message});
    }

});

router.post('/', async (req, res) => {
    try {

        const park = await Park.create(req.body);

        //post succesvol gedaan
        res.status(201).json(park);
    } catch (e) {
        //client error, fout in required fields
        res.status(400).json({error: e.message});
    }


});


router.put('/:id', async (req, res) => {
    try {
        const park = await Park.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );

        if (!park) {
            //item niet gevonden
            return res.status(404).json({message: "Park niet gevonden"});
        }
        //put succesvol aangepast
        res.status(200).json(park);

    } catch (e) {
        //ongeldige input
        res.status(400).json({error: "Ongeldige data of ID"});
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const park = await Park.findByIdAndDelete(
            req.params.id
        );

        if (!park) {
            //item niet gevonden
            return res.status(404).json({message: "Park niet gevonden"});
        }
        //delete succesvol
        res.status(204).json({
            message: "Park is verwijderd",
            park: park
        });

    } catch (e) {
        //ongeldige input / verkeerde id
        res.status(400).json({error: "Ongeldig ID"});
    }

});


export default router;
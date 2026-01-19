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
        const parks = await Park.find();

        //alleen titel en id zijn zichtbaar in de collection pagina
        const items = parks.map(park => ({
                name: park.name,
                id: park.id,
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
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
                },
                collection: {
                    href: `${process.env.APPLICATION_URL}:${process.env.EXPRESS_PORT}/parks`,
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

                // name: "Yosemite National Park",
                // state: "California",
                // location: "Sierra Nevada, Central California",
                // parkType: "National Park",
                // trails: [
                //     "Half Dome Trail",
                //     "Mist Trail"
                // ],
                // activities: [
                //     "Rock Climbing",
                //     "Waterfall Viewing"
                // ],
                // openingHours: "Open 24/7 all year"

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